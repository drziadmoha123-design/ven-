import { NextRequest, NextResponse } from "next/server";
import { productService } from "../../../../server/services/product.service";
import { handleApiError } from "../../../../server/utils/api-handler";
import { CatalogQuerySchema } from "../../../../server/validators/catalog.schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || searchParams.get("search") || "";
    const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit")) || 10));

    const result = await productService.getCatalog({
      search: q,
      limit,
      page: 1,
    });

    return NextResponse.json({
      success: true,
      data: {
        query: q,
        results: result.items,
        total: result.total,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
