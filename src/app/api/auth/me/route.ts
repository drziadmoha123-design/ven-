import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { handleApiError } from "@/server/utils/api-handler";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          user: null,
          message: "Unauthenticated",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
