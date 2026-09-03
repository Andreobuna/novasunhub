import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSession, sessionCookieOptions } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling, ApiError } from "@/lib/api-response";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Enter a valid email and password", 422, parsed.error.flatten());
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Generic message on purpose — never reveal whether the email exists.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new ApiError("Incorrect email or password.", 401);
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError("This account has been suspended. Contact support.", 403);
  }

  const token = signSession({ sub: user.id, role: user.role, email: user.email });
  cookies().set(sessionCookieOptions.name, token, sessionCookieOptions);

  return ok({ id: user.id, name: user.name, email: user.email, role: user.role });
});
