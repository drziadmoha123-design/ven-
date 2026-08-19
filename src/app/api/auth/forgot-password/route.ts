import { NextRequest, NextResponse } from "next/server";
import { ForgotPasswordSchema } from "@/server/validators/auth.schema";
import { authService } from "@/server/services/auth.service";
import { handleApiError, getClientIp } from "@/server/utils/api-handler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedInput = ForgotPasswordSchema.parse(body);
    const clientIp = getClientIp(req);

    const result = await authService.requestPasswordReset(validatedInput, clientIp);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
