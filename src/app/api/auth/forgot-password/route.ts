import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";

/**
 * Forgot-password architecture:
 * 1. Client posts an email.
 * 2. We always respond with a generic "check your email" message, whether or
 *    not an account exists, to avoid leaking which emails are registered.
 * 3. If the account exists, a single-use, time-limited token is stored and
 *    (TODO) emailed via a transactional email provider — no provider is
 *    wired up yet, so we log the reset link server-side for now instead of
 *    silently pretending an email was sent.
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const { email } = await req.json();

  if (email && typeof email === "string") {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
      });

      // TODO(integration): send this via a transactional email provider
      // (Resend, SendGrid, Postmark, etc.) instead of logging it.
      console.log(
        `[password-reset] Reset link for ${email}: /reset-password?token=${token}`
      );
    }
  }

  return ok({
    message: "If an account exists for that email, a reset link has been sent.",
  });
});
