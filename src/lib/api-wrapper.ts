import { NextRequest, NextResponse } from "next/server";
import { AppError, UnauthorizedError } from "./errors";
import { AuthService } from "@/services/authService";
import { ZodError } from "zod";

type Handler = (
  request: NextRequest,
  context: any
) => Promise<NextResponse | any>;

type ProtectedHandler = (
  request: NextRequest,
  user: { userId: string; email: string },
  context: any
) => Promise<NextResponse | any>;

function handleError(error: any) {
  console.error("API Error:", error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          message: error.message,
          code: error.constructor.name,
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          message: "Validation failed",
          details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
          code: "ValidationError",
        },
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      data: null,
      error: {
        message: "An unexpected error occurred",
        code: "InternalServerError",
      },
    },
    { status: 500 }
  );
}

function handleSuccess(result: any) {
  if (result instanceof NextResponse) {
    return result;
  }

  return NextResponse.json({
    success: true,
    data: result.data ?? result,
    pagination: result.pagination ?? undefined,
    error: null,
  });
}

export function apiWrapper(handler: Handler) {
  return async (request: NextRequest, context: any) => {
    try {
      const result = await handler(request, context);
      return handleSuccess(result);
    } catch (error: any) {
      return handleError(error);
    }
  };
}

export function protectedApiWrapper(handler: ProtectedHandler) {
  return async (request: NextRequest, context: any) => {
    try {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Missing or invalid token");
      }

      const token = authHeader.split(" ")[1];
      const decoded = AuthService.verifyToken(token);
      if (!decoded) {
        throw new UnauthorizedError("Invalid or expired token");
      }

      const result = await handler(request, decoded, context);
      return handleSuccess(result);
    } catch (error: any) {
      return handleError(error);
    }
  };
}
