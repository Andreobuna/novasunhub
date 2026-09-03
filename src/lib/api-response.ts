import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: number) {
  return NextResponse.json({ success: true, data }, { status: init ?? 200 });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, error: { message, details } },
    { status }
  );
}

/** Wraps a route handler so unexpected errors never leak internals to the client. */
export function withErrorHandling(
  handler: (...args: any[]) => Promise<NextResponse>
) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error("[API_ERROR]", err);
      const message =
        err instanceof Error && (err as any).expose ? err.message : "Something went wrong. Please try again.";
      const status = err instanceof Error && (err as any).status ? (err as any).status : 500;
      return fail(message, status);
    }
  };
}

export class ApiError extends Error {
  status: number;
  expose: boolean;
  constructor(message: string, status = 400, expose = true) {
    super(message);
    this.status = status;
    this.expose = expose;
  }
}
