import { NextRequest, NextResponse } from "next/server";
import { variantService } from "../../../../../server/services/variant.service";
import { requireAdmin } from "../../../../../server/auth/session";
import { handleApiError, getClientIp } from "../../../../../server/utils/api-handler";
import { CreateVariantSchema } from "../../../../../server/validators/catalog.schema";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const variants = await variantService.getProductVariants(id, includeInactive);
    return NextResponse.json({ success: true, data: variants });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const validated = CreateVariantSchema.parse(body);
    const ipAddress = getClientIp(req);

    const variant = await variantService.createVariant(
      id,
      validated,
      admin.id,
      admin.role,
      ipAddress
    );

    return NextResponse.json({ success: true, data: variant }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
