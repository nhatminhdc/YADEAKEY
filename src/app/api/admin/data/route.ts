import {
  readCatalogFile,
  readHomeFile,
  readSettingsFile,
} from "@/lib/admin-data";
import { jsonOk, requireAdmin } from "@/lib/admin-api";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const catalog = readCatalogFile();
  const home = readHomeFile();
  const settings = readSettingsFile();

  return jsonOk({
    settings,
    home,
    catalog: {
      syncedAt: catalog.syncedAt,
      productCount: catalog.products.length,
      products: catalog.products.map((p) => ({
        slug: p.slug,
        name: p.name,
        price: p.price ?? null,
        category: p.category ?? "xe-may-dien",
        badge: p.badge ?? null,
      })),
    },
  });
}
