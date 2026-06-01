"use client";

import { useState } from "react";
import type { ProductColorOption } from "@/lib/yadea-types";

type Props = {
  variants: ProductColorOption[];
  initialImage: string;
  onImageChange: (url: string) => void;
};

export function ProductColorSwatches({
  variants,
  initialImage,
  onImageChange,
}: Props) {
  const initialIndex = Math.max(
    0,
    variants.findIndex(
      (v) =>
        v.imageUrl === initialImage ||
        initialImage.includes(v.imageUrl.replace(/-\d+x\d+/, "")),
    ),
  );
  const [active, setActive] = useState(initialIndex);

  if (variants.length < 2) return null;

  return (
    <div className="mt-4 flex justify-center px-2">
      <div
        className="inline-flex max-w-full flex-wrap items-center justify-center gap-3 rounded-full bg-[#ebebeb] px-4 py-2.5"
        role="group"
        aria-label="Chọn màu sản phẩm"
      >
        {variants.map((variant, index) => (
          <button
            key={`${variant.name}-${variant.imageUrl}`}
            type="button"
            title={variant.name}
            aria-label={variant.name}
            aria-pressed={active === index}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActive(index);
              onImageChange(variant.imageUrl);
            }}
            className="yadea-color-dot-sm border-transparent"
            style={{ backgroundColor: variant.hex }}
          />
        ))}
      </div>
    </div>
  );
}
