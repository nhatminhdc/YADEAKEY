"use client";

import { useEffect, useState } from "react";
import { proxyImageUrl } from "@/lib/yadea-types";

type Props = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
};

/** Ảnh qua proxy — dùng thẻ img native để ổn định với yadea.com.vn */
export function ProxiedImage({
  src,
  alt,
  className = "",
  fill,
  width,
  height,
  priority,
}: Props) {
  const proxied = proxyImageUrl(src);
  const [imgSrc, setImgSrc] = useState(proxied);

  useEffect(() => {
    setImgSrc(proxied);
  }, [proxied]);

  const onError = () => {
    if (imgSrc !== src) setImgSrc(src);
  };

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imgSrc}
        alt={alt}
        onError={onError}
        className={`absolute inset-0 h-full w-full ${className}`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      onError={onError}
      width={width ?? 800}
      height={height ?? 600}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
