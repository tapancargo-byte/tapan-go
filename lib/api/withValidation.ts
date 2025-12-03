import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * API middleware for Zod schema validation
 * Automatically validates request body and returns typed data
 * 
 * @example
 * const schema = z.object({ name: z.string() });
 * export const POST = withValidation(schema, async (req, data) => {
 *   // data is fully typed!
 *   return NextResponse.json({ success: true });
 * });
 */
export function withValidation<T extends z.ZodSchema>(
  schema: T,
  handler: (
    req: Request,
    data: z.infer<T>,
    context?: any
  ) => Promise<NextResponse>
) {
  return async (req: Request, context?: any) => {
    try {
      const body = await req.json();
      const validated = schema.parse(body);
      return await handler(req, validated, context);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            code: "VALIDATION_ERROR",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
              code: err.code,
            })),
          },
          { status: 400 }
        );
      }

      if (error instanceof SyntaxError) {
        return NextResponse.json(
          {
            error: "Invalid JSON in request body",
            code: "INVALID_JSON",
          },
          { status: 400 }
        );
      }

      console.error("[API Validation Error]", error);
      return NextResponse.json(
        {
          error: "Internal server error",
          code: "INTERNAL_ERROR",
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Validate query parameters instead of body
 */
export function withQueryValidation<T extends z.ZodSchema>(
  schema: T,
  handler: (
    req: Request,
    data: z.infer<T>,
    context?: any
  ) => Promise<NextResponse>
) {
  return async (req: Request, context?: any) => {
    try {
      const { searchParams } = new URL(req.url);
      const params = Object.fromEntries(searchParams.entries());
      const validated = schema.parse(params);
      return await handler(req, validated, context);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            code: "VALIDATION_ERROR",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }

      console.error("[API Query Validation Error]", error);
      return NextResponse.json(
        {
          error: "Internal server error",
          code: "INTERNAL_ERROR",
        },
        { status: 500 }
      );
    }
  };
}
