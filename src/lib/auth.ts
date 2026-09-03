import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const COOKIE_NAME = process.env.COOKIE_NAME || "nsh_session";

export interface SessionPayload {
  sub: string; // user id
  role: "CUSTOMER" | "ADMIN";
  email: string;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

/** Reads + verifies the session cookie on the server (route handlers, server components). */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const store = cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user || user.status !== "ACTIVE") return null;
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error("You must be signed in to do that.");
    (err as any).status = 401;
    (err as any).expose = true;
    throw err;
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    const err = new Error("Admin access required.");
    (err as any).status = 403;
    (err as any).expose = true;
    throw err;
  }
  return user;
}

export const sessionCookieOptions = {
  name: COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
