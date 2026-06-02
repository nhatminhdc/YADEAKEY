import { notFound } from "next/navigation";
import { displayName } from "@/lib/yadea-catalog";
import {
  getDisplayCatalog,
  getDisplayProductBySlug,
} from "@/lib/catalog-display";
import { loadCatalog } from "@/lib/yadea-catalog";
import { ProductConfiguratorView } from "@/components/yadea/ProductConfiguratorView";
import { enrichProductForConfiguratorResolved } from "@/lib/enrich-product.server";

export const revalidate = 3600;

export async function generateStaticParams() {
  const catalog = loadCatalog();
  return catalog.products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getDisplayProductBySlug(slug);
  if (!product) return { title: "Sản phẩm" };
  return {
    title: `${displayName(product.name)} | YADEA Việt Nam`,
    description: product.tagline ?? `Thông tin ${displayName(product.name)} từ YADEA Việt Nam`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = getDisplayCatalog();
  const product = getDisplayProductBySlug(slug);
  if (!product) notFound();

  const enriched = enrichProductForConfiguratorResolved(product, catalog);

  return (
    <ProductConfiguratorView product={enriched} catalog={catalog} />
  );
}
