import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"

export function errorHandler(err: Error, c: Context) {
  console.error("Error:", err)

  if (err instanceof HTTPException) {
    return c.json(
      {
        error: {
          code: "HTTP_ERROR",
          message: err.message,
        },
      },
      err.status
    )
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: err.message,
        },
      },
      400
    )
  }

  // Generic error
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    500
  )
}
