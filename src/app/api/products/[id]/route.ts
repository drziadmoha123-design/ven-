import { NextRequest, NextResponse } from "next/server";
import { productService } from "../../../../server/services/product.service";
import { requireAdmin } from "../../../../server/auth/session";
import { handleApiError, getClientIp } from "../../../../server/utils/api-handler";
import { UpdateProductSchema } from "../../../../server/validators/catalog.schema";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const product = await productService.getProductByIdOrSlug(id, includeInactive);
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const validated = UpdateProductSchema.parse(body);
    const ipAddress = getClientIp(req);

    const product = await productService.updateProduct(
      id,
      validated,
      admin.id,
      admin.role,
      ipAddress
    );

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    const { id } = await params;
    const ipAddress = getClientIp(req);

    await productService.deleteProduct(id, admin.id, admin.role, ipAddress);

    return NextResponse.json({ success: true, message: "Product archived successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
