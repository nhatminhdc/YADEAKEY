import type { YadeaProduct } from "@/lib/yadea-types";
import { ProductCard } from "./ProductCard";

export function ProductGridSection({
  title,
  products,
  id,
}: {
  title: string;
  products: YadeaProduct[];
  id?: string;
}) {
  if (!products.length) return null;

  return (
    <section id={id} className="bg-yadea-bg py-12 md:py-16">
      <div className="container-main">
        <h2 className="section-title mb-8">{title}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
