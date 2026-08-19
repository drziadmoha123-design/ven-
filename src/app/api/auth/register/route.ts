import { NextRequest, NextResponse } from "next/server";
import { RegisterSchema } from "@/server/validators/auth.schema";
import { authService } from "@/server/services/auth.service";
import { setSessionCookie } from "@/server/auth/session";
import { handleApiError, getClientIp } from "@/server/utils/api-handler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedInput = RegisterSchema.parse(body);
    const clientIp = getClientIp(req);

    const result = await authService.register(validatedInput, clientIp);

    const response = NextResponse.json(
      {
        success: true,
        user: result.user,
        message: "Registration successful. Welcome to VEN+!",
      },
      { status: 201 }
    );

    setSessionCookie(response, result.sessionToken);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
