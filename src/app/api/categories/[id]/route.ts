import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "../../../../server/services/category.service";
import { requireAdmin } from "../../../../server/auth/session";
import { handleApiError, getClientIp } from "../../../../server/utils/api-handler";
import { UpdateCategorySchema } from "../../../../server/validators/catalog.schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const category = isUuid
      ? await categoryService.getCategoryById(id)
      : await categoryService.getCategoryBySlug(id);

    return NextResponse.json({ success: true, data: category });
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
    const validated = UpdateCategorySchema.parse(body);
    const ipAddress = getClientIp(req);

    const category = await categoryService.updateCategory(
      id,
      validated,
      admin.id,
      admin.role,
      ipAddress
    );

    return NextResponse.json({ success: true, data: category });
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

    await categoryService.deleteCategory(id, admin.id, admin.role, ipAddress);

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
