import type { YadeaCatalog, YadeaProduct } from "@/lib/yadea-types";
import { getProductBySlug } from "@/lib/yadea-types";
import {
  loadSiteSettings,
  type ListingOrderKey,
  type SiteSettings,
} from "@/lib/site-settings";
import { loadCatalog } from "@/lib/yadea-catalog";

function applyOverrides(
  product: YadeaProduct,
  settings: SiteSettings,
): YadeaProduct | null {
  const o = settings.productOverrides[product.slug];
  if (o?.hidden) return null;
  if (!o) return product;
  return {
    ...product,
    ...(o.name !== undefined ? { name: o.name } : {}),
    ...(o.price !== undefined ? { price: o.price } : {}),
    ...(o.category !== undefined ? { category: o.category } : {}),
    ...(o.badge !== undefined ? { badge: o.badge } : {}),
    ...(o.tagline !== undefined ? { tagline: o.tagline } : {}),
  };
}

export function getDisplayProducts(
  categoryFilter?: string,
  settings = loadSiteSettings(),
): YadeaProduct[] {
  const catalog = loadCatalog();
  let products = catalog.products
    .map((p) => applyOverrides(p, settings))
    .filter((p): p is YadeaProduct => p !== null);

  if (categoryFilter) {
    products = products.filter((p) => p.category === categoryFilter);
  }

  const orderKey: ListingOrderKey = categoryFilter
    ? categoryFilter === "xe-may-dien" || categoryFilter === "xe-gan-may-dien"
      ? (categoryFilter as ListingOrderKey)
      : "all"
    : "all";

  const order = settings.listingOrder[orderKey];
  if (!order.length) return products;

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const ordered: YadeaProduct[] = [];
  for (const slug of order) {
    const p = bySlug.get(slug);
    if (p) {
      ordered.push(p);
      bySlug.delete(slug);
    }
  }
  return [...ordered, ...bySlug.values()];
}

export function getEnabledCategories(settings = loadSiteSettings()) {
  return settings.categories.filter((c) => c.enabled);
}

export function getDisplayCatalog(settings = loadSiteSettings()): YadeaCatalog {
  const catalog = loadCatalog();
  const products = catalog.products
    .map((p) => applyOverrides(p, settings))
    .filter((p): p is YadeaProduct => p !== null);
  return { ...catalog, products };
}

export function getDisplayProductBySlug(
  slug: string,
  settings = loadSiteSettings(),
): YadeaProduct | undefined {
  const catalog = loadCatalog();
  const product = getProductBySlug(catalog, slug);
  if (!product) return undefined;
  return applyOverrides(product, settings) ?? undefined;
}
