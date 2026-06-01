import type { YadeaProduct } from "./yadea-types";
import { displayName } from "./yadea-types";

export type PurchaseProductOption = {
  slug: string;
  name: string;
  price: number | null;
};

export function getPurchaseProductOptions(
  products: YadeaProduct[],
): PurchaseProductOption[] {
  return products
    .map((p) => ({
      slug: p.slug,
      name: displayName(p.name),
      price: p.price ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

export function formatProductOptionLabel(option: PurchaseProductOption): string {
  const priceText =
    option.price != null
      ? `${new Intl.NumberFormat("vi-VN").format(option.price)} VND`
      : "Liên hệ";
  return `${option.name} — ${priceText}`;
}
