
import { NextResponse } from "next/server";
import { z } from "zod";
import { withValidation } from "@/lib/api/withValidation";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.number().min(0, "Value must be positive"),
  tags: z.array(z.string()).optional()
});

export const POST = withValidation(schema, async (req, data) => {
  return NextResponse.json({
    success: true,
    message: "Validation successful",
    data
  });
});
