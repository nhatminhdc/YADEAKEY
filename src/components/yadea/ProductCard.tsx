"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { YadeaProduct } from "@/lib/yadea-types";
import {
  displayName,
  getColorSwatches,
  getDefaultCardImage,
} from "@/lib/yadea-types";
import { formatPrice } from "@/lib/utils";
import { ProxiedImage } from "./ProxiedImage";
import { ProductColorSwatches } from "./ProductColorSwatches";

export function ProductCard({ product }: { product: YadeaProduct }) {
  const swatches = getColorSwatches(product);
  const defaultImage = getDefaultCardImage(product) ?? "";
  const [activeImage, setActiveImage] = useState(defaultImage);
  const name = displayName(product.name);

  return (
    <article className="yadea-product-card group flex flex-col p-4 shadow-sm">
      <div className="relative">
        {product.badge && (
          <span
            className={`absolute left-0 top-0 z-10 px-2 py-0.5 text-[10px] font-bold uppercase text-white ${
              product.badge === "NEW" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {product.badge === "NEW" ? "MỚI" : "BÁN CHẠY"}
          </span>
        )}
        <Link
          href={`/san-pham/${product.slug}`}
          className="yadea-product-card-media relative block aspect-[4/3] bg-gray-50"
        >
          {activeImage && (
            <ProxiedImage
              src={activeImage}
              alt={name}
              fill
              className="yadea-img-zoom object-contain p-2"
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

      <h3 className="mt-3 text-center text-sm font-bold uppercase text-gray-900">{name}</h3>
      {product.price && (
        <p className="mt-1 text-center text-sm font-semibold text-brand">
          {formatPrice(product.price)}
        </p>
      )}

      <Link
        href={`/san-pham/${product.slug}`}
        className="btn-outline-brand mt-4 flex items-center justify-center gap-1 py-2 text-xs font-semibold uppercase"
      >
        Xem chi tiết
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}
