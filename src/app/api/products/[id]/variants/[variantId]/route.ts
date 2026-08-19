import { NextRequest, NextResponse } from "next/server";
import { variantService } from "../../../../../../server/services/variant.service";
import { requireAdmin } from "../../../../../../server/auth/session";
import { handleApiError, getClientIp } from "../../../../../../server/utils/api-handler";
import { UpdateVariantSchema } from "../../../../../../server/validators/catalog.schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const variant = await variantService.getVariantById(variantId);
    return NextResponse.json({ success: true, data: variant });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    const { variantId } = await params;
    const body = await req.json();
    const validated = UpdateVariantSchema.parse(body);
    const ipAddress = getClientIp(req);

    const variant = await variantService.updateVariant(
      variantId,
      validated,
      admin.id,
      admin.role,
      ipAddress
    );

    return NextResponse.json({ success: true, data: variant });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    const { variantId } = await params;
    const ipAddress = getClientIp(req);

    await variantService.deleteVariant(variantId, admin.id, admin.role, ipAddress);

    return NextResponse.json({ success: true, message: "Variant deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
