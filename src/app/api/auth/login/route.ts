import { NextRequest, NextResponse } from "next/server";
import { LoginSchema } from "@/server/validators/auth.schema";
import { authService } from "@/server/services/auth.service";
import { setSessionCookie } from "@/server/auth/session";
import { handleApiError, getClientIp } from "@/server/utils/api-handler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedInput = LoginSchema.parse(body);
    const clientIp = getClientIp(req);

    const result = await authService.login(validatedInput, clientIp);

    const response = NextResponse.json(
      {
        success: true,
        user: result.user,
        message: "Signed in successfully",
      },
      { status: 200 }
    );

    setSessionCookie(response, result.sessionToken);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
