import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import { extractSessionToken, clearSessionCookie } from "@/server/auth/session";
import { handleApiError } from "@/server/utils/api-handler";

export async function POST(req: NextRequest) {
  try {
    const sessionToken = extractSessionToken(req);
    if (sessionToken) {
      await authService.logout(sessionToken);
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Signed out successfully",
      },
      { status: 200 }
    );

    clearSessionCookie(response);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
