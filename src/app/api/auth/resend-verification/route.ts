import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import { requireAuth } from "@/server/auth/session";
import { handleApiError, getClientIp } from "@/server/utils/api-handler";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const clientIp = getClientIp(req);

    const result = await authService.resendVerificationEmail(user, clientIp);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
