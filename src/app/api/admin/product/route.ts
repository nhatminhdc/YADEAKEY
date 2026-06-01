import { z } from "zod";
import { readCatalogFile, writeCatalogFile } from "@/lib/admin-data";
import { readSettingsFile, writeSettingsFile } from "@/lib/admin-data";
import { jsonError, jsonOk, requireAdmin } from "@/lib/admin-api";
import { revalidatePath } from "next/cache";

const patchSchema = z.object({
  slug: z.string(),
  catalog: z
    .object({
      name: z.string().optional(),
      price: z.number().nullable().optional(),
      category: z.string().optional(),
      badge: z.enum(["HOT", "NEW"]).nullable().optional(),
      tagline: z.string().nullable().optional(),
    })
    .optional(),
  override: z
    .object({
      name: z.string().optional(),
      price: z.number().nullable().optional(),
      category: z.string().optional(),
      badge: z.enum(["HOT", "NEW"]).nullable().optional(),
      hidden: z.boolean().optional(),
      tagline: z.string().nullable().optional(),
      clear: z.boolean().optional(),
    })
    .optional(),
});

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = patchSchema.parse(await req.json());
    const catalog = readCatalogFile();
    const idx = catalog.products.findIndex((p) => p.slug === body.slug);
    if (idx < 0) return jsonError("Không tìm thấy sản phẩm", 404);

    if (body.catalog) {
      catalog.products[idx] = { ...catalog.products[idx], ...body.catalog };
      writeCatalogFile(catalog);
    }

    if (body.override) {
      const settings = readSettingsFile();
      const { clear, ...rest } = body.override;
      if (clear) {
        delete settings.productOverrides[body.slug];
      } else {
        settings.productOverrides[body.slug] = {
          ...settings.productOverrides[body.slug],
          ...rest,
        };
      }
      writeSettingsFile(settings);
    }

    revalidatePath("/");
    revalidatePath("/san-pham");
    revalidatePath(`/san-pham/${body.slug}`);

    return jsonOk({ slug: body.slug });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Cập nhật thất bại");
  }
}
