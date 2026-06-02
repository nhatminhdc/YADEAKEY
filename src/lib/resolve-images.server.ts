import "server-only";

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import {
  pickImageSrc,
  proxyImageUrl,
  type ImageSizePreset,
} from "@/lib/image-url";

type MediaManifest = Record<string, string>;

let manifest: MediaManifest | null = null;

function getManifest(): MediaManifest {
  if (manifest) return manifest;
  for (const file of ["data/media-manifest.json", "public/media-manifest.json"]) {
    const path = join(process.cwd(), file);
    if (existsSync(path)) {
      try {
        manifest = JSON.parse(readFileSync(path, "utf8")) as MediaManifest;
        return manifest;
      } catch {
        /* try next */
      }
    }
  }
  manifest = {};
  return manifest;
}

export function getLocalMediaPath(sourceUrl: string): string | null {
  if (!sourceUrl || sourceUrl.startsWith("/")) return sourceUrl;
  return getManifest()[sourceUrl] ?? null;
}

export function resolveImageUrl(
  sourceUrl: string,
  preset?: ImageSizePreset,
): string {
  if (!sourceUrl) return "";
  return pickImageSrc(sourceUrl, getLocalMediaPath(sourceUrl), preset);
}

export function resolveImageUrlWithWidth(
  sourceUrl: string,
  w: number,
  q = 82,
): string {
  const local = getLocalMediaPath(sourceUrl);
  if (local) return local;
  return proxyImageUrl(sourceUrl, { w, q });
}
