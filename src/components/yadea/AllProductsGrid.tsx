import { getHomepageProducts } from "@/lib/yadea-home";
import { HomeProductCard } from "./HomeProductCard";

export function AllProductsGrid() {
  const products = getHomepageProducts();

  return (
    <section className="bg-[#f5f5f5] py-14 md:py-20">
      <div className="container-main">
        <h2 className="section-title mb-10 md:mb-14">Tất cả sản phẩm</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:gap-x-8">
          {products.map((p) => (
            <HomeProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
