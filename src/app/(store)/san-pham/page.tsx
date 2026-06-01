import { loadCatalog } from "@/lib/yadea-catalog";
import { ProductCard } from "@/components/yadea/ProductCard";

export const metadata = {
  title: "Sản phẩm | YADEA Việt Nam",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ loai?: string }>;
}) {
  const { loai } = await searchParams;
  const catalog = loadCatalog();
  let products = catalog.products;

  if (loai === "xe-may-dien") {
    products = products.filter((p) => p.category === "xe-may-dien");
  } else if (loai === "xe-gan-may-dien") {
    products = products.filter((p) => p.category === "xe-gan-may-dien");
  }

  const title =
    loai === "xe-may-dien"
      ? "Xe máy điện"
      : loai === "xe-gan-may-dien"
        ? "Xe gắn máy điện"
        : "Tất cả sản phẩm";

  return (
    <div className="bg-yadea-bg py-10 md:py-14">
      <div className="container-main">
        <h1 className="section-title mb-8">{title}</h1>
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
