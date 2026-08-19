import { NextRequest, NextResponse } from "next/server";
import { productImageService } from "../../../../../../server/services/product-image.service";
import { requireAdmin } from "../../../../../../server/auth/session";
import { handleApiError, getClientIp } from "../../../../../../server/utils/api-handler";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    const { id, imageId } = await params;
    const ipAddress = getClientIp(req);

    await productImageService.setPrimaryImage(id, imageId, admin.id, admin.role, ipAddress);

    return NextResponse.json({ success: true, message: "Primary image updated successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    const { id, imageId } = await params;
    const ipAddress = getClientIp(req);

    await productImageService.deleteImage(id, imageId, admin.id, admin.role, ipAddress);

    return NextResponse.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
