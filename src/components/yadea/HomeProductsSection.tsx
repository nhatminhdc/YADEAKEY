import type { HomeProductCard } from "@/lib/yadea-home";
import { HomeProductCard as HomeProductCardView } from "./HomeProductCard";
import type { YadeaProduct } from "@/lib/yadea-types";
import { loadCatalog } from "@/lib/yadea-catalog";

function mergeHomeProduct(
  item: HomeProductCard,
  catalogProduct?: YadeaProduct,
): YadeaProduct & { homeImageUrl?: string } {
  if (!catalogProduct) {
    return {
      slug: item.slug ?? "unknown",
      name: item.name,
      price: item.price ?? null,
      sourceUrl: item.href ?? "#",
      heroImage: item.imageUrl ?? null,
      badge: item.badge ?? undefined,
      homeImageUrl: item.imageUrl,
      colorVariants: [],
    } as YadeaProduct & { homeImageUrl?: string };
  }

  const hero =
    item.imageUrl ??
    catalogProduct.colorVariants?.[0]?.imageUrl ??
    catalogProduct.heroImage;

  return {
    ...catalogProduct,
    price: item.price ?? catalogProduct.price,
    badge: item.badge ?? catalogProduct.badge,
    homeImageUrl: hero ?? undefined,
    heroImage: hero ?? catalogProduct.heroImage,
  };
}

export function HomeProductsSection({
  title,
  items,
}: {
  title: string;
  items: HomeProductCard[];
}) {
  const catalog = loadCatalog();
  const products = items
    .map((item) => {
      const p = catalog.products.find((x) => x.slug === item.slug);
      return mergeHomeProduct(item, p);
    })
    .filter((p) => Boolean(p.homeImageUrl || p.heroImage));

  if (!products.length) return null;

  return (
    <section className="bg-[#f5f5f5] py-14 md:py-20">
      <div className="container-main">
        <h2 className="section-title mb-10 md:mb-14">{title}</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:gap-x-8">
          {products.map((p) => (
            <HomeProductCardView key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
