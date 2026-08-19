import { NextRequest, NextResponse } from "next/server";
import { GoogleOAuthSchema } from "@/server/validators/auth.schema";
import { authService } from "@/server/services/auth.service";
import { setSessionCookie } from "@/server/auth/session";
import { handleApiError, getClientIp } from "@/server/utils/api-handler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedInput = GoogleOAuthSchema.parse(body);
    const clientIp = getClientIp(req);

    const result = await authService.googleOAuth(validatedInput, clientIp);

    const response = NextResponse.json(
      {
        success: true,
        user: result.user,
        isNewUser: result.isNewUser,
        message: result.isNewUser
          ? "Google account created and authenticated successfully"
          : "Signed in with Google successfully",
      },
      { status: 200 }
    );

    setSessionCookie(response, result.sessionToken);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
