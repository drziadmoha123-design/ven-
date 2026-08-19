import { NextRequest, NextResponse } from "next/server";
import { productImageService } from "../../../../../server/services/product-image.service";
import { requireAdmin } from "../../../../../server/auth/session";
import { handleApiError, getClientIp } from "../../../../../server/utils/api-handler";
import { CreateProductImageSchema } from "../../../../../server/validators/catalog.schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const images = await productImageService.getProductImages(id);
    return NextResponse.json({ success: true, data: images });
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
    const validated = CreateProductImageSchema.parse(body);
    const ipAddress = getClientIp(req);

    const image = await productImageService.addImage(
      id,
      validated,
      admin.id,
      admin.role,
      ipAddress
    );

    return NextResponse.json({ success: true, data: image }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
