import sidebarData from "../../data/yadea-configurator-sidebar.json";
import type { YadeaCatalog, YadeaProduct } from "./yadea-types";
import { getProductImage, type ProductColorOption } from "./yadea-types";
import { catalogSlugFromYadea } from "./yadea-slug-map";

export type ConfiguratorSidebarItem = {
  yadeaSlug: string;
  catalogSlug?: string;
  label?: string;
};

export type KeySpec = {
  label: string;
  value: string;
  description?: string;
};

export function getConfiguratorSidebar(): ConfiguratorSidebarItem[] {
  return sidebarData as ConfiguratorSidebarItem[];
}

const CATALOG_TO_YADEA: Record<string, string> = {
  "yadea-vigor-2025": "yadea-vigor-nang-cap",
  "yadea-ossy": "ossy",
  "yadea-orla-2024": "yadea-orla-gau-dau",
  "yadea-osta-2026": "yadea-osta",
  "yadea-velax-u-2026": "yadea-velax-u",
  "yadea-voltguard-p-l": "yadea-voltguad-p-l",
  "yadea-voltguard-u80-2pin": "yadea-voltguard-u80",
  "i8-vintage": "yadea-i8-vintage",
  "yadea-velax": "yadea-velax",
  "vekoo": "vekoo",
};

export function yadeaSlugFromCatalog(catalogSlug: string): string {
  return CATALOG_TO_YADEA[catalogSlug] ?? catalogSlug;
}

export function purchaseUrlForProduct(product: YadeaProduct): string {
  return `/san-pham/${product.slug}#dat-hang`;
}

function deriveKeySpecs(product: YadeaProduct): KeySpec[] {
  if (product.keySpecs?.length) return product.keySpecs;

  const h = product.highlights ?? [];
  const specs: KeySpec[] = [];

  const speed = h.find((x) => /km\/h|km\/h/i.test(x));
  const range = h.find((x) => /^\d+\s*km$/i.test(x) || /km/i.test(x));
  if (speed && speed.length < 20) {
    specs.push({ label: "Tốc độ tối đa", value: speed });
  }
  if (range && range !== speed && range.length < 20) {
    specs.push({
      label: "Quãng đường",
      value: range,
      description: "Trong 1 lần sạc",
    });
  }

  return specs.slice(0, 3);
}

/** Chuẩn hóa dữ liệu để hiển thị layout configurator */
export function enrichProductForConfigurator(
  product: YadeaProduct,
  _catalog?: YadeaCatalog,
): YadeaProduct {
  const colorVariants: NonNullable<YadeaProduct["colorVariants"]> =
    product.colorVariants?.length ? product.colorVariants : [];

  const hero = getProductImage(product);
  const variants =
    colorVariants.length > 0
      ? colorVariants
      : hero
        ? [{ name: "Mặc định", hex: "#cccccc", imageUrl: hero }]
        : [];

  const keySpecs = deriveKeySpecs(product);
  const sidebar = getConfiguratorSidebar().map((item) => ({
    ...item,
    catalogSlug: item.catalogSlug ?? catalogSlugFromYadea(item.yadeaSlug),
  }));

  return {
    ...product,
    pageLayout: "configurator",
    purchaseUrl: purchaseUrlForProduct(product),
    colorVariants: variants,
    keySpecs: keySpecs.length ? keySpecs : product.keySpecs,
    configuratorSidebar: sidebar,
    heroImage: hero ?? product.heroImage,
  };
}

export function getConfiguratorColors(product: YadeaProduct): ProductColorOption[] {
  return (product.colorVariants ?? []).map((c) => ({
    name: c.name,
    imageUrl: c.imageUrl,
    hex: c.hex,
  }));
}
