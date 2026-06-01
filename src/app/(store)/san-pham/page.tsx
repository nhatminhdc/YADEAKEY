import { getDisplayProducts, getEnabledCategories } from "@/lib/catalog-display";
import { getCategoryLabel, loadSiteSettings } from "@/lib/site-settings";
import { ProductCard } from "@/components/yadea/ProductCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sản phẩm | YADEA Việt Nam",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ loai?: string }>;
}) {
  const { loai } = await searchParams;
  const settings = loadSiteSettings();
  const products = getDisplayProducts(loai);
  const categories = getEnabledCategories(settings);

  const title =
    loai === "xe-may-dien"
      ? getCategoryLabel(settings, "xe-may-dien")
      : loai === "xe-gan-may-dien"
        ? getCategoryLabel(settings, "xe-gan-may-dien")
        : "Tất cả sản phẩm";

  return (
    <div className="bg-yadea-bg py-10 md:py-14">
      <div className="container-main">
        <h1 className="section-title mb-8">{title}</h1>
        <div className="mb-8 flex flex-wrap justify-center gap-3 text-sm">
          <a
            href="/san-pham"
            className={`rounded-full px-4 py-1.5 ${!loai ? "bg-brand text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
          >
            Tất cả
          </a>
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/san-pham?loai=${c.id}`}
              className={`rounded-full px-4 py-1.5 ${
                loai === c.id ? "bg-brand text-white" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {c.label}
            </a>
          ))}
        </div>
        <p className="mb-8 text-center text-sm text-gray-500">
          {products.length} sản phẩm ·{" "}
          <a href="/dat-hang" className="font-medium text-brand underline">
            Đặt mua / tư vấn qua form
          </a>
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
