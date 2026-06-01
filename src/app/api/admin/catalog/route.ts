import { yadeaCatalogSchema } from "@/lib/yadea-types";
import { readCatalogFile, writeCatalogFile } from "@/lib/admin-data";
import { jsonError, jsonOk, requireAdmin } from "@/lib/admin-api";
import { revalidatePath } from "next/cache";

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await req.json()) as { catalog?: unknown };
    const catalog = yadeaCatalogSchema.parse(body.catalog);
    writeCatalogFile(catalog);
    revalidatePath("/san-pham");
    revalidatePath("/", "layout");
    return jsonOk({ syncedAt: catalog.syncedAt });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Catalog không hợp lệ");
  }
}
