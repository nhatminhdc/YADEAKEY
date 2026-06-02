import "server-only";

import { unstable_cache } from "next/cache";
import { createHash } from "crypto";
import sharp from "sharp";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const MAX_WIDTH = 1920;

function cacheKey(url: string, w: number, q: number, format: "webp" | "avif" | "raw") {
  return createHash("sha256")
    .update(`${url}|${w}|${q}|${format}`)
    .digest("hex")
    .slice(0, 32);
}

async function fetchUpstream(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    next: { revalidate: 86_400 * 7 },
  });
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function optimizeRaster(
  input: Buffer,
  targetWidth: number,
  quality: number,
  preferAvif: boolean,
): Promise<{ data: Buffer; contentType: string }> {
  let pipeline = sharp(input).rotate();
  const meta = await pipeline.metadata();
  if ((meta.width ?? 0) > targetWidth) {
    pipeline = pipeline.resize(targetWidth, undefined, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  if (preferAvif) {
    return {
      data: await pipeline.avif({ quality: Math.min(quality, 75) }).toBuffer(),
      contentType: "image/avif",
    };
  }
  return {
    data: await pipeline.webp({ quality }).toBuffer(),
    contentType: "image/webp",
  };
}

export async function getOptimizedImage(
  url: string,
  targetWidth: number,
  quality: number,
  preferAvif: boolean,
): Promise<{ data: Buffer; contentType: string }> {
  const isSvg = /\.svg$/i.test(url);

  if (isSvg) {
    const cachedSvg = unstable_cache(
      async () => {
        const data = await fetchUpstream(url);
        return {
          data: data.toString("base64"),
          contentType: "image/svg+xml",
        };
      },
      ["proxy-svg", cacheKey(url, targetWidth, quality, "raw")],
      { revalidate: 86_400 * 30 },
    );
    const hit = await cachedSvg();
    return { data: Buffer.from(hit.data, "base64"), contentType: hit.contentType };
  }

  const format = preferAvif ? "avif" : "webp";
  const cached = unstable_cache(
    async () => {
      const input = await fetchUpstream(url);
      const { data, contentType } = await optimizeRaster(
        input,
        targetWidth,
        quality,
        preferAvif,
      );
      return { data: data.toString("base64"), contentType };
    },
    ["proxy-img", cacheKey(url, targetWidth, quality, format)],
    { revalidate: 86_400 * 30 },
  );

  const hit = await cached();
  return {
    data: Buffer.from(hit.data, "base64"),
    contentType: hit.contentType,
  };
}
