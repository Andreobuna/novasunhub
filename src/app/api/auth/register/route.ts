import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSession, sessionCookieOptions } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling, ApiError } from "@/lib/api-response";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Invalid registration details", 422, parsed.error.flatten());
  }

  const { name, email, password, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError("An account with this email already exists.", 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, phone, role: "CUSTOMER" },
  });

  const token = signSession({ sub: user.id, role: user.role, email: user.email });
  cookies().set(sessionCookieOptions.name, token, sessionCookieOptions);

  return ok({ id: user.id, name: user.name, email: user.email, role: user.role }, 201);
});
