import Link from "next/link";
import { loadCatalog } from "@/lib/yadea-catalog";
import { getPurchaseProductOptions } from "@/lib/purchase-product-options";
import { PurchaseOrderForm } from "@/components/yadea/PurchaseOrderForm";

export const metadata = {
  title: "Đặt mua xe | YADEA Việt Nam",
  description: "Điền form để đặt mua xe điện YADEA — chúng tôi liên hệ tư vấn sớm nhất.",
};

export default async function DatHangPage({
  searchParams,
}: {
  searchParams: Promise<{ sanPham?: string }>;
}) {
  const { sanPham: slug } = await searchParams;
  const catalog = loadCatalog();
  const products = getPurchaseProductOptions(catalog.products);
  const defaultSlug =
    slug && products.some((p) => p.slug === slug)
      ? slug
      : (products[0]?.slug ?? "");

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-main max-w-lg">
        <Link href="/san-pham" className="yadea-link text-sm text-gray-500">
          ← Danh sách sản phẩm
        </Link>
        <h1 className="mt-4 text-2xl font-bold uppercase text-gray-900 md:text-3xl">
          Đặt mua / Tư vấn
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Điền thông tin bên dưới. Đội ngũ sẽ gọi lại trong thời gian sớm nhất.
        </p>

        <PurchaseOrderForm products={products} defaultSlug={defaultSlug} />
      </div>
    </div>
  );
}
