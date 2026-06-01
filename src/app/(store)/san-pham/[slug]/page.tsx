import { notFound } from "next/navigation";
import { loadCatalog, getProductBySlug, displayName } from "@/lib/yadea-catalog";
import { ProductConfiguratorView } from "@/components/yadea/ProductConfiguratorView";
import { enrichProductForConfigurator } from "@/lib/yadea-configurator";

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
  const catalog = loadCatalog();
  const product = getProductBySlug(catalog, slug);
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
  const catalog = loadCatalog();
  const product = getProductBySlug(catalog, slug);
  if (!product) notFound();

  const enriched = enrichProductForConfigurator(product, catalog);

  return (
    <ProductConfiguratorView product={enriched} catalog={catalog} />
  );
}
