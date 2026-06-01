import Link from "next/link";
import type { YadeaHome } from "@/lib/yadea-home";
import { resolveSiteHref } from "@/lib/site-links";
import { ProxiedImage } from "./ProxiedImage";

export function NewProductsBanner({
  items,
}: {
  items: YadeaHome["newProducts"];
}) {
  return (
    <section className="bg-white py-14 md:py-20">
      <div className="container-main">
        <h2 className="section-title mb-10 md:mb-12">Sản phẩm mới</h2>
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={resolveSiteHref(
                item.href.startsWith("/")
                  ? item.href
                  : `/san-pham/${item.slug}`,
              )}
              className="group relative block aspect-[16/10] overflow-hidden bg-neutral-200"
            >
              <ProxiedImage
                src={item.imageUrl}
                alt={item.name}
                fill
                className="yadea-img-zoom-hero object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-8 text-white">
                <h3 className="text-xl font-bold uppercase tracking-wide md:text-2xl">
                  {item.name}
                </h3>
                <span className="mt-4 border border-white px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 ease-out group-hover:bg-white group-hover:text-gray-900 group-hover:shadow-lg">
                  Xem chi tiết
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
