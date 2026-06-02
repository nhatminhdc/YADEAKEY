"use client";

import { useEffect, useState } from "react";
import {
  imageSizesForPreset,
  proxyImageUrl,
  type ImageSizePreset,
} from "@/lib/image-url";

type Props = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  /** Preset kích thước — tự chọn w + sizes */
  preset?: ImageSizePreset;
  /** Ghi đè width proxy (ưu tiên hơn preset) */
  proxyWidth?: number;
  quality?: number;
};

export function ProxiedImage({
  src,
  alt,
  className = "",
  fill,
  width,
  height,
  priority,
  preset,
  proxyWidth,
  quality,
}: Props) {
  const resolved = proxyImageUrl(src, {
    preset,
    w: proxyWidth,
    q: quality,
  });
  const [imgSrc, setImgSrc] = useState(resolved);
  const sizes = imageSizesForPreset(preset);

  useEffect(() => {
    setImgSrc(resolved);
  }, [resolved]);

  const onError = () => {
    if (!src.startsWith("/") && imgSrc !== src) {
      setImgSrc(src);
      return;
    }
    const fallback = proxyImageUrl(src, { w: proxyWidth ?? 1200, q: quality });
    if (imgSrc !== fallback) setImgSrc(fallback);
  };

  const shared = {
    src: imgSrc,
    alt,
    onError,
    decoding: "async" as const,
    loading: (priority ? "eager" : "lazy") as "eager" | "lazy",
    fetchPriority: priority ? ("high" as const) : undefined,
    sizes,
  };

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...shared}
        className={`absolute inset-0 h-full w-full ${className}`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...shared}
      width={width ?? 800}
      height={height ?? 600}
      className={className}
    />
  );
}
