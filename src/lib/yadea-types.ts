import { z } from "zod";

const specRowSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const specSectionSchema = z.object({
  title: z.string(),
  rows: z.array(specRowSchema),
});

const colorSchema = z.object({
  name: z.string(),
  imageUrl: z.string(),
  hex: z.string().optional(),
});

const keySpecSchema = z.object({
  label: z.string(),
  value: z.string(),
  description: z.string().optional(),
});

const colorVariantSchema = z.object({
  name: z.string(),
  hex: z.string(),
  imageUrl: z.string(),
});

const sidebarItemSchema = z.object({
  yadeaSlug: z.string(),
  catalogSlug: z.string().optional(),
  label: z.string().optional(),
});

const modelVersionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const yadeaProductSchema = z.object({
  slug: z.string(),
  name: z.string(),
  tagline: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  compareAtPrice: z.number().nullable().optional(),
  sourceUrl: z.string(),
  badge: z.enum(["HOT", "NEW"]).nullable().optional(),
  heroImage: z.string().nullable().optional(),
  gallery: z.array(z.string()).optional(),
  colors: z.array(colorSchema).optional(),
  highlights: z.array(z.string()).optional(),
  specSections: z.array(specSectionSchema).optional(),
  category: z.string().optional(),
  syncedAt: z.string().optional(),
  pageLayout: z.enum(["default", "configurator"]).optional(),
  purchaseUrl: z.string().optional(),
  outOfStock: z.boolean().optional(),
  keySpecs: z.array(keySpecSchema).optional(),
  colorVariants: z.array(colorVariantSchema).optional(),
  configuratorSidebar: z.array(sidebarItemSchema).optional(),
  modelVersions: z.array(modelVersionSchema).optional(),
});

export const yadeaCatalogSchema = z.object({
  syncedAt: z.string(),
  source: z.string(),
  hero: z.object({
    imageUrl: z.string(),
    mobileUrl: z.string().optional(),
    title: z.string(),
    subtitle: z.string().optional(),
    link: z.string(),
  }),
  newProducts: z.array(
    z.object({
      name: z.string(),
      slug: z.string(),
      imageUrl: z.string(),
      href: z.string(),
    }),
  ),
  news: z.array(
    z.object({
      date: z.string(),
      category: z.string(),
      title: z.string(),
      href: z.string(),
    }),
  ),
  instagram: z.array(z.unknown()),
  products: z.array(yadeaProductSchema),
});

export type YadeaProduct = z.infer<typeof yadeaProductSchema>;
export type YadeaCatalog = z.infer<typeof yadeaCatalogSchema>;

const SKIP_IMAGE =
  /logo|favicon|banner-mobile|banner-web|background|white-logo|circle-shape|aigo-logo/i;

export function proxyImageUrl(url: string): string {
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

export function getProductImage(product: YadeaProduct): string | null {
  const key = product.slug.replace(/^yadea-/, "").replace(/-/g, "");
  const candidates = [
    product.heroImage,
    ...(product.gallery ?? []),
    ...(product.colors?.map((c) => c.imageUrl) ?? []),
  ].filter((u): u is string => !!u && !SKIP_IMAGE.test(u));

  const scored = candidates.map((url) => {
    const lower = url.toLowerCase();
    let score = 0;
    if (key && lower.includes(key.slice(0, 4))) score += 10;
    if (lower.includes("anh-chinh") || lower.includes("1280x")) score += 5;
    if (lower.includes("ngang-cac-mau") || lower.includes("480x330")) score += 3;
    if (lower.includes("anh-nho") || lower.includes("480x361")) score += 1;
    if (lower.includes("ifun") && !key.includes("ifun")) score -= 5;
    return { url, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.url ?? candidates[0] ?? null;
}

export type ProductColorOption = {
  name: string;
  imageUrl: string;
  hex: string;
};

/** Bỏ hậu tố kích thước WordPress để lấy ảnh gốc khi có */
export function toFullSizeImageUrl(url: string): string {
  return url.replace(/-\d+x\d+(\.(png|jpe?g|webp))$/i, "$1");
}

function urlBelongsToProduct(url: string, slug: string): boolean {
  const u = url.toLowerCase();
  if (slug === "yadea-oris-h") {
    return u.includes("oris-h") && !/velax|i8|background|logo/i.test(u);
  }
  const key = slug.replace(/^yadea-/, "").replace(/-/g, "");
  if (key.length >= 4 && u.includes(key)) return true;
  return !/velax|background|logo|banner-mobile/i.test(u);
}

export function colorNameFromUrl(url: string, fallback?: string): string {
  const lower = url.toLowerCase();
  if (/oris-h-xanh/i.test(lower)) return "Vàng";
  if (/den|black/i.test(lower)) return "Đen";
  if (/trang|white/i.test(lower)) return "Trắng";
  if (/xam|grey|gray/i.test(lower)) return "Xám";
  if (/be|beige|cream/i.test(lower)) return "Be";
  if (/xanh|green/i.test(lower)) return "Xanh";
  if (/do|red/i.test(lower)) return "Đỏ";
  if (/blue/i.test(lower)) return "Xanh dương";
  if (/pink/i.test(lower)) return "Hồng";
  if (/vang|gold/i.test(lower)) return "Vàng";
  return fallback && fallback.length < 24 ? fallback : "Màu";
}

export function colorHexFromUrl(url: string, name?: string): string {
  const lower = `${url} ${name ?? ""}`.toLowerCase();
  if (/oris-h-xanh/i.test(lower)) return "#c9a86c";
  if (/den|đen|black/i.test(lower)) return "#2b2b2b";
  if (/trang|white/i.test(lower)) return "#f4f4ef";
  if (/xam|xám|grey|gray/i.test(lower)) return "#9a9a9a";
  if (/be|beige|cream/i.test(lower)) return "#e8e0d0";
  if (/xanh|green/i.test(lower)) return "#6b8e6b";
  if (/do|đỏ|red/i.test(lower)) return "#b33a3a";
  if (/blue/i.test(lower)) return "#4a6fa5";
  if (/pink|hồng/i.test(lower)) return "#e8a0b0";
  if (/vang|vàng|gold/i.test(lower)) return "#c9a86c";
  return "#cccccc";
}

/** Ảnh đại diện từng màu (thumbnail hoặc ảnh chính theo màu) */
function isColorVariantUrl(url: string): boolean {
  if (SKIP_IMAGE.test(url)) return false;
  if (url.includes("/themes/") || url.includes(".svg")) return false;
  if (url.includes("Banner") || url.includes("background")) return false;
  return (
    /ngang-cac-mau/i.test(url) ||
    /480x330/i.test(url) ||
    /480x422/i.test(url) ||
    /\/Mau-/i.test(url) ||
    /\/(do|trang|xam|blue|den|beige|pink)-480x330/i.test(url) ||
    /xanh-la.*480x330/i.test(url) ||
    /-anh-chinh\.(png|jpe?g|webp)$/i.test(url) ||
    /Oris-H-(den|xam|be|xanh)/i.test(url)
  );
}

function toSwatchOption(
  name: string,
  imageUrl: string,
): ProductColorOption {
  const displayUrl = toFullSizeImageUrl(imageUrl);
  const label = colorNameFromUrl(imageUrl, name);
  return {
    name: label,
    imageUrl: displayUrl,
    hex: colorHexFromUrl(imageUrl, label),
  };
}

/** Ảnh từng màu — chấm màu đổi ảnh sản phẩm */
export function getColorSwatches(product: YadeaProduct): ProductColorOption[] {
  if (product.colorVariants?.length) {
    return product.colorVariants.map((c) => ({
      name: c.name,
      imageUrl: c.imageUrl,
      hex: c.hex,
    }));
  }

  const fromColors = (product.colors ?? []).filter(
    (c) =>
      c.imageUrl &&
      urlBelongsToProduct(c.imageUrl, product.slug) &&
      (isColorVariantUrl(c.imageUrl) || /anh-chinh/i.test(c.imageUrl)),
  );

  const fromGallery = (product.gallery ?? [])
    .filter(
      (url) =>
        isColorVariantUrl(url) && urlBelongsToProduct(url, product.slug),
    )
    .map((url, i) => ({ name: `Màu ${i + 1}`, imageUrl: url }));

  const merged = [...fromColors, ...fromGallery];
  const seen = new Set<string>();
  const unique: ProductColorOption[] = [];

  for (const item of merged) {
    const key = item.imageUrl.replace(/-\d+x\d+/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(toSwatchOption(item.name, item.imageUrl));
    if (unique.length >= 6) break;
  }

  return unique;
}

/** Ảnh chính trên thẻ sản phẩm */
export function getDefaultCardImage(
  product: YadeaProduct,
  fallback?: string | null,
): string | null {
  return fallback ?? getProductImage(product) ?? getColorSwatches(product)[0]?.imageUrl ?? null;
}

export function displayName(name: string): string {
  return name.split("–")[0].split("|")[0].trim();
}

export function getProductBySlug(
  catalog: YadeaCatalog,
  slug: string,
): YadeaProduct | undefined {
  return catalog.products.find((p) => p.slug === slug);
}
