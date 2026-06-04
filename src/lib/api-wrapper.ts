import { NextRequest, NextResponse } from "next/server";
import { AppError, UnauthorizedError } from "./errors";
import { AuthService } from "@/services/authService";

type Handler = (
  request: NextRequest,
  context: any
) => Promise<NextResponse | any>;

type ProtectedHandler = (
  request: NextRequest,
  user: { userId: string; email: string },
  context: any
) => Promise<NextResponse | any>;

export function apiWrapper(handler: Handler) {
  return async (request: NextRequest, context: any) => {
    try {
      const result = await handler(request, context);

      if (result instanceof NextResponse) {
        return result;
      }

      return NextResponse.json({
        success: true,
        data: result.data || result,
        meta: result.meta || undefined,
      });
    } catch (error: any) {
      console.error("API Error:", error);

      if (error instanceof AppError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: error.message,
              code: error.constructor.name,
            },
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            message: "An unexpected error occurred",
            code: "InternalServerError",
          },
        },
        { status: 500 }
      );
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

      if (result instanceof NextResponse) {
        return result;
      }

      return NextResponse.json({
        success: true,
        data: result.data || result,
        meta: result.meta || undefined,
      });
    } catch (error: any) {
      console.error("Protected API Error:", error);

      if (error instanceof AppError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: error.message,
              code: error.constructor.name,
            },
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            message: "An unexpected error occurred",
            code: "InternalServerError",
          },
        },
        { status: 500 }
      );
    }
  };
}
