import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "../../../server/services/category.service";
import { requireAdmin } from "../../../server/auth/session";
import { handleApiError, getClientIp } from "../../../server/utils/api-handler";
import { CreateCategorySchema } from "../../../server/validators/catalog.schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const flat = searchParams.get("flat") === "true";
    const includeInactive = searchParams.get("includeInactive") === "true";

    const categories = flat
      ? await categoryService.getAllFlatCategories(includeInactive)
      : await categoryService.getCategories(includeInactive);

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const body = await req.json();
    const validated = CreateCategorySchema.parse(body);
    const ipAddress = getClientIp(req);

    const category = await categoryService.createCategory(
      validated,
      admin.id,
      admin.role,
      ipAddress
    );

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
