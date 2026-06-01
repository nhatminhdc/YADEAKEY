import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";
import type { YadeaProduct } from "@/lib/yadea-types";
import { getProductImage, loadCatalog } from "@/lib/yadea-catalog";

function pickHomeListingImage(product: YadeaProduct): string | undefined {
  return (
    product.colorVariants?.[0]?.imageUrl ??
    product.heroImage ??
    getProductImage(product) ??
    undefined
  );
}

const homeProductSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
  price: z.number().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  href: z.string().nullable().optional(),
  badge: z.enum(["HOT", "NEW"]).nullable().optional(),
  colorSwatches: z.array(z.string()).optional(),
});

export const yadeaHomeSchema = z.object({
  syncedAt: z.string(),
  source: z.string(),
  topBar: z.array(z.object({ label: z.string(), href: z.string() })),
  hero: z.object({
    slides: z.array(
      z.object({
        desktop: z.string(),
        mobile: z.string().optional(),
        link: z.string().optional(),
      }),
    ),
    title: z.string(),
    subtitle: z.string(),
    tagline: z.string().optional(),
  }),
  newProducts: z.array(
    z.object({
      name: z.string(),
      slug: z.string(),
      href: z.string(),
      imageUrl: z.string(),
    }),
  ),
  news: z.array(
    z.object({
      date: z.string().optional(),
      category: z.string(),
      title: z.string(),
      imageUrl: z.string().optional(),
      href: z.string(),
    }),
  ),
  instagram: z.array(z.string()),
  homeProductOrder: z.array(z.string()).optional(),
  allProducts: z.array(homeProductSchema).optional(),
  xeMay: z.array(homeProductSchema).optional(),
  xeGan: z.array(homeProductSchema).optional(),
});

export type YadeaHome = z.infer<typeof yadeaHomeSchema>;
export type HomeProductCard = z.infer<typeof homeProductSchema>;

export function loadHome(): YadeaHome {
  const raw = readFileSync(join(process.cwd(), "data", "yadea-home.json"), "utf8");
  return yadeaHomeSchema.parse(JSON.parse(raw));
}

/** Sản phẩm trang chủ theo thứ tự yadea.com.vn */
export function getHomepageProducts(): Array<
  YadeaProduct & { homeImageUrl?: string; colorSwatchUrls?: string[] }
> {
  const home = loadHome();
  const catalog = loadCatalog();
  const order = home.homeProductOrder ?? catalog.products.map((p) => p.slug);

  return order
    .map((slug) => {
      const p = catalog.products.find((x) => x.slug === slug);
      if (!p) return null;
      const override = home.allProducts?.find((h) => h.slug === slug);
      return {
        ...p,
        homeImageUrl: override?.imageUrl ?? pickHomeListingImage(p),
        colorSwatchUrls: override?.colorSwatches,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
}
