"use client";

import type { ProductColorOption } from "@/lib/yadea-types";

type Props = {
  variants: ProductColorOption[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

function isLightHex(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r + g + b) / 3 > 210;
}

/** Chấm màu kiểu trang cấu hình Yadea (viền cam khi chọn) */
export function ConfiguratorColorDots({
  variants,
  activeIndex,
  onSelect,
}: Props) {
  return (
    <div
      className="inline-flex flex-wrap items-center gap-2.5"
      role="group"
      aria-label="Chọn màu sắc"
    >
      {variants.map((variant, index) => {
        const light = isLightHex(variant.hex);
        return (
          <button
            key={`${variant.name}-${variant.imageUrl}`}
            type="button"
            title={variant.name}
            aria-label={variant.name}
            aria-pressed={activeIndex === index}
            onClick={() => onSelect(index)}
            className={`yadea-color-dot ${
              light
                ? "border-gray-400 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                : "border-gray-300"
            }`}
            style={{ backgroundColor: variant.hex }}
          />
        );
      })}
    </div>
  );
}
