import "server-only";

import type { YadeaCatalog, YadeaProduct } from "./yadea-types";
import { enrichProductForConfigurator } from "./yadea-configurator";
import { resolveImageUrl } from "./resolve-images.server";

/** Enrich + resolve ảnh (local media hoặc proxy WebP) — chỉ gọi từ Server Component */
export function enrichProductForConfiguratorResolved(
  product: YadeaProduct,
  catalog?: YadeaCatalog,
): YadeaProduct {
  const base = enrichProductForConfigurator(product, catalog);

  return {
    ...base,
    heroImage: base.heroImage
      ? resolveImageUrl(base.heroImage, "gallery")
      : base.heroImage,
    gallery: base.gallery?.map((u) => resolveImageUrl(u, "gallery")),
    colorVariants: base.colorVariants?.map((v) => ({
      ...v,
      imageUrl: resolveImageUrl(v.imageUrl, "gallery"),
    })),
  };
}
