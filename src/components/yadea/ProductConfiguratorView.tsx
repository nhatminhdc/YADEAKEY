"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { YadeaCatalog, YadeaProduct } from "@/lib/yadea-types";
import { displayName, getProductImage } from "@/lib/yadea-types";
import { getConfiguratorColors } from "@/lib/yadea-configurator";
import {
  catalogSlugFromYadea,
  productHref,
} from "@/lib/yadea-slug-map";
import { ProxiedImage } from "./ProxiedImage";
import { ConfiguratorColorDots } from "./ConfiguratorColorDots";
import { getPurchaseProductOptions } from "@/lib/purchase-product-options";
import { PurchaseOrderForm } from "./PurchaseOrderForm";

type Props = {
  product: YadeaProduct;
  catalog: YadeaCatalog;
};

export function ProductConfiguratorView({ product, catalog }: Props) {
  const colors = useMemo(() => getConfiguratorColors(product), [product]);
  const [colorIndex, setColorIndex] = useState(0);
  const activeColor = colors[colorIndex];

  const imageSlides =
    colors.length > 0
      ? colors.map((c) => c.imageUrl)
      : [getProductImage(product)].filter(Boolean);
  const [slideIndex, setSlideIndex] = useState(0);
  const activeImage = imageSlides[slideIndex] ?? getProductImage(product) ?? "";

  const modelVersions = product.modelVersions ?? [];
  const [versionIndex, setVersionIndex] = useState(0);

  const syncSlideWithColor = (index: number) => {
    setColorIndex(index);
    setSlideIndex(index);
  };

  const prevSlide = () => {
    const next = (slideIndex - 1 + imageSlides.length) % imageSlides.length;
    setSlideIndex(next);
    setColorIndex(next);
  };

  const nextSlide = () => {
    const next = (slideIndex + 1) % imageSlides.length;
    setSlideIndex(next);
    setColorIndex(next);
  };

  const name = displayName(product.name);

  const sidebar = product.configuratorSidebar ?? [];

  const sidebarItems = useMemo(() => {
    const seenCatalog = new Set<string>();
    const items: {
      yadeaSlug: string;
      catalogSlug: string;
      label: string;
      thumb: string | null;
      isActive: boolean;
      href: string;
    }[] = [];

    for (const item of sidebar) {
      const catalogSlug =
        item.catalogSlug ?? catalogSlugFromYadea(item.yadeaSlug);
      if (seenCatalog.has(catalogSlug)) continue;
      seenCatalog.add(catalogSlug);

      const p = catalog.products.find((x) => x.slug === catalogSlug);
      const thumb = p ? getProductImage(p) : null;
      const label =
        item.label ??
        (p ? displayName(p.name).replace(/^YADEA\s*/i, "") : item.yadeaSlug);

      items.push({
        yadeaSlug: item.yadeaSlug,
        catalogSlug,
        label,
        thumb,
        isActive: catalogSlug === product.slug,
        href: productHref(catalogSlug),
      });
    }
    return items;
  }, [sidebar, catalog.products, product.slug]);

  const keySpecs = product.keySpecs ?? [];
  const purchaseProducts = useMemo(
    () => getPurchaseProductOptions(catalog.products),
    [catalog.products],
  );

  return (
    <div className="yadea-config-root">
      <aside className="yadea-config-sidebar">
        {sidebarItems.map((item) => (
          <Link
            key={item.yadeaSlug}
            href={item.href}
            title={item.label}
            className={`group yadea-config-sidebar-item ${
              item.isActive ? "yadea-config-sidebar-item-active" : ""
            }`}
          >
            <div className="yadea-config-sidebar-thumb">
              {item.thumb ? (
                <ProxiedImage
                  src={item.thumb}
                  alt={item.label}
                  fill
                  className="object-contain p-0.5"
                />
              ) : (
                <div className="h-full w-full bg-gray-100" />
              )}
            </div>
            <span className="max-w-[72px] text-center text-[9px] font-medium leading-tight text-gray-600 group-hover:text-gray-900">
              {item.label}
            </span>
          </Link>
        ))}
      </aside>

      <div className="yadea-config-gallery">
        <Link
          href="/san-pham"
          className="yadea-config-back"
        >
          &lt; Trở lại
        </Link>

        <div className="yadea-config-gallery-grid">
          <div className="yadea-config-gallery-stage">
            <div className="yadea-config-image-shell">
              {imageSlides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Ảnh trước"
                    className="yadea-config-nav yadea-config-nav-prev"
                  >
                    <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Ảnh sau"
                    className="yadea-config-nav yadea-config-nav-next"
                  >
                    <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
                  </button>
                </>
              )}

              <div className="yadea-config-image-aspect">
                {activeImage ? (
                  <div key={activeImage} className="yadea-fade-in absolute inset-0">
                    <ProxiedImage
                      src={activeImage}
                      alt={`${name} — ${activeColor?.name ?? ""}`}
                      fill
                      className="yadea-config-image"
                      priority
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[1280/880] items-center justify-center text-sm text-gray-400">
                    Chưa có ảnh sản phẩm
                  </div>
                )}
              </div>
            </div>
          </div>

          {keySpecs.length > 0 && (
            <div className="yadea-config-specs">
              {keySpecs.map((spec, i) => (
                <div
                  key={spec.label}
                  className={`px-2 text-center sm:px-6 ${
                    i > 0 ? "border-l border-[#d8ddd3]" : ""
                  }`}
                >
                  <p className="yadea-config-spec-label">{spec.label}</p>
                  <p className="yadea-config-spec-value">{spec.value}</p>
                  {spec.description && (
                    <p className="yadea-config-spec-desc">{spec.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="yadea-config-panel">
        <h1 className="yadea-config-title">{name}</h1>

        {colors.length > 0 && (
          <div className="mt-8">
            <p className="text-sm font-bold text-gray-900">Chọn màu sắc</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <ConfiguratorColorDots
                variants={colors}
                activeIndex={colorIndex}
                onSelect={syncSlideWithColor}
              />
              <span className="text-sm text-gray-700">
                {activeColor?.name}
              </span>
            </div>
          </div>
        )}

        {modelVersions.length > 0 && (
          <div className="mt-8">
            <p className="text-sm font-bold text-gray-900">Chọn phiên bản xe</p>
            <div className="mt-4 flex flex-col gap-3">
              {modelVersions.map((ver, i) => (
                <button
                  key={ver.id}
                  type="button"
                  onClick={() => setVersionIndex(i)}
                  className={`yadea-config-version-card ${
                    versionIndex === i ? "yadea-config-version-card-active" : ""
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      versionIndex === i
                        ? "border-brand bg-brand"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {versionIndex === i && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                  <span className="text-[15px] font-medium text-gray-900">
                    {ver.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-gray-100 pt-6">
          {!product.outOfStock && product.price != null && (
            <>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-medium text-gray-800">
                  Số tiền thanh toán
                </span>
                <span className="text-[22px] font-bold text-brand lg:text-2xl">
                  {new Intl.NumberFormat("vi-VN").format(product.price)} VND
                </span>
              </div>
              <p className="mt-1 text-right text-xs italic text-gray-400">
                *Giá chưa bao gồm thuế VAT
              </p>
            </>
          )}

          {product.outOfStock && (
            <p className="mb-4 text-sm text-gray-600">
              Sản phẩm tạm hết hàng — vẫn có thể để lại thông tin để được tư vấn
              hoặc đặt trước.
            </p>
          )}

          <PurchaseOrderForm
            products={purchaseProducts}
            defaultSlug={product.slug}
            selectedColor={activeColor?.name}
            selectedVersion={modelVersions[versionIndex]?.name}
          />
        </div>

        <div className="mt-10 border-t border-gray-100 pt-8">
          <h2 className="text-base font-bold text-gray-900">Đăng ký lái thử</h2>
          <p className="mt-2 text-sm text-gray-500">
            Điền form phía trên (mục đặt mua) và ghi chú &quot;Đăng ký lái thử&quot;
            trong phần ghi chú.
          </p>
          <a
            href="#dat-hang"
            className="btn-outline-brand mt-4 inline-flex w-full items-center justify-center py-3.5 text-sm font-bold uppercase"
          >
            Điền form đăng ký
          </a>
        </div>
      </div>
    </div>
  );
}
