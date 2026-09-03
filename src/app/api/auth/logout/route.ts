import { cookies } from "next/headers";
import { sessionCookieOptions } from "@/lib/auth";
import { ok, withErrorHandling } from "@/lib/api-response";

export const POST = withErrorHandling(async () => {
  cookies().set(sessionCookieOptions.name, "", { ...sessionCookieOptions, maxAge: 0 });
  return ok({ loggedOut: true });
});
