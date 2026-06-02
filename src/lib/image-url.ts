export type ImageSizePreset = "logo" | "card" | "banner" | "hero" | "gallery";

const PRESET_WIDTH: Record<ImageSizePreset, number> = {
  logo: 280,
  card: 480,
  banner: 960,
  hero: 1280,
  gallery: 880,
};

export function widthForPreset(preset?: ImageSizePreset): number | undefined {
  return preset ? PRESET_WIDTH[preset] : undefined;
}

/** URL ảnh: path local, hoặc proxy đã resize (WebP/AVIF) */
export function proxyImageUrl(
  url: string,
  options?: { w?: number; q?: number; preset?: ImageSizePreset },
): string {
  if (!url) return "";
  if (url.startsWith("/")) return url;

  const w = options?.w ?? (options?.preset ? PRESET_WIDTH[options.preset] : undefined);
  const q = options?.q ?? 82;
  const params = new URLSearchParams({ url });
  if (w) params.set("w", String(w));
  if (q !== 82) params.set("q", String(q));
  return `/api/proxy-image?${params.toString()}`;
}

export function imageSizesForPreset(preset?: ImageSizePreset): string | undefined {
  switch (preset) {
    case "logo":
      return "140px";
    case "card":
      return "(max-width: 768px) 50vw, 320px";
    case "banner":
      return "(max-width: 768px) 100vw, 960px";
    case "hero":
      return "100vw";
    case "gallery":
      return "(max-width: 1024px) 100vw, 880px";
    default:
      return undefined;
  }
}

/** Ưu tiên localPath từ manifest (server) */
export function pickImageSrc(
  sourceUrl: string,
  localPath: string | null | undefined,
  preset?: ImageSizePreset,
): string {
  if (localPath) return localPath;
  return proxyImageUrl(sourceUrl, { preset });
}
