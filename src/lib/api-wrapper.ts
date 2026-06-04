import { NextRequest, NextResponse } from "next/server";
import { AppError } from "./errors";

/**
 * THE ANALOGY: The "Emergency Room Protocol"
 * No matter what injury (error) a patient (request) has, the hospital has a 
 * standard way of logging them in, treating them, and discharging them.
 */

type Handler = (
  request: NextRequest,
  context: any
) => Promise<NextResponse | any>;

export function apiWrapper(handler: Handler) {
  return async (request: NextRequest, context: any) => {
    try {
      const result = await handler(request, context);

      // If it's already a NextResponse, return it
      if (result instanceof NextResponse) {
        return result;
      }

      // Otherwise, wrap it in a success response
      return NextResponse.json({
        success: true,
        data: result.data || result,
        meta: result.meta || undefined,
      });
    } catch (error: any) {
      console.error("API Error:", error);

      // Handle custom AppErrors
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

      // Handle unexpected errors
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
