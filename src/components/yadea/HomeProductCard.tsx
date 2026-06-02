"use client";

import Link from "next/link";
import { useState } from "react";
import type { YadeaProduct } from "@/lib/yadea-types";
import {
  displayName,
  getColorSwatches,
  getDefaultCardImage,
} from "@/lib/yadea-types";
import { formatPrice } from "@/lib/utils";
import { ProxiedImage } from "./ProxiedImage";
import { ProductColorSwatches } from "./ProductColorSwatches";

type Props = {
  product: YadeaProduct & {
    homeImageUrl?: string;
    colorSwatchUrls?: string[];
  };
};

export function HomeProductCard({ product }: Props) {
  const swatches = getColorSwatches(product);
  const defaultImage =
    getDefaultCardImage(product, product.homeImageUrl) ?? "";
  const [activeImage, setActiveImage] = useState(defaultImage);
  const name = displayName(product.name);

  return (
    <article className="yadea-product-card group flex flex-col">
      <div className="yadea-product-card-media relative">
        {product.badge && (
          <span
            className={`absolute right-3 top-3 z-10 border px-2 py-0.5 text-[10px] font-bold uppercase ${
              product.badge === "NEW"
                ? "border-green-600 bg-white text-green-600"
                : "border-red-600 bg-white text-red-600"
            }`}
          >
            {product.badge === "NEW" ? "Mới" : "Bán chạy"}
          </span>
        )}

        <Link
          href={`/san-pham/${product.slug}`}
          className="relative block aspect-square w-full"
        >
          {activeImage && (
            <ProxiedImage
              src={activeImage}
              alt={name}
              fill
              preset="card"
              className="yadea-img-zoom object-contain p-4"
            />
          )}
        </Link>
      </div>

      {swatches.length >= 2 && (
        <ProductColorSwatches
          variants={swatches}
          initialImage={defaultImage}
          onImageChange={setActiveImage}
        />
      )}

      <h3 className="mt-4 text-center text-sm font-bold uppercase tracking-wide text-gray-900">
        {name}
      </h3>
      {product.price && (
        <p className="mt-1 text-center text-[15px] font-semibold text-gray-800">
          {product.slug.includes("osta") ? "Từ " : ""}
          {formatPrice(product.price)}
        </p>
      )}

      <Link
        href={`/san-pham/${product.slug}`}
        className="btn-outline-brand mx-auto mt-4 mb-3 flex items-center justify-center gap-1 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide"
      >
        Chọn mua sản phẩm
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}
