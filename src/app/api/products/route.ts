import { NextRequest, NextResponse } from "next/server";
import { productService } from "../../../server/services/product.service";
import { requireAdmin } from "../../../server/auth/session";
import { handleApiError, getClientIp } from "../../../server/utils/api-handler";
import { CatalogQuerySchema, CreateProductSchema } from "../../../server/validators/catalog.schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryObj: Record<string, unknown> = {};

    searchParams.forEach((value, key) => {
      queryObj[key] = value;
    });

    const validatedFilters = CatalogQuerySchema.parse(queryObj);
    const result = await productService.getCatalog(validatedFilters);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const body = await req.json();
    const validated = CreateProductSchema.parse(body);
    const ipAddress = getClientIp(req);

    const product = await productService.createProduct(
      validated,
      admin.id,
      admin.role,
      ipAddress
    );

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
