/**
 * Giai đoạn B: tải & nén ảnh Yadea → public/media + manifest
 * Run: node scripts/sync-media.mjs
 */
import { createHash } from "crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MEDIA_DIR = join(ROOT, "public", "media");
const MANIFEST_DATA = join(ROOT, "data", "media-manifest.json");
const MANIFEST_PUBLIC = join(ROOT, "public", "media-manifest.json");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

const WIDTH_BY_HINT = {
  logo: 280,
  card: 480,
  banner: 960,
  hero: 1280,
  gallery: 880,
  default: 960,
};

function collectUrls(obj, out = new Set()) {
  if (obj == null) return out;
  if (typeof obj === "string") {
    if (obj.startsWith("https://www.yadea.com.vn/") && /\.(png|jpe?g|webp)/i.test(obj)) {
      out.add(obj);
    }
    return out;
  }
  if (Array.isArray(obj)) {
    for (const v of obj) collectUrls(v, out);
    return out;
  }
  if (typeof obj === "object") {
    for (const v of Object.values(obj)) collectUrls(v, out);
  }
  return out;
}

function hashName(url) {
  return createHash("sha256").update(url).digest("hex").slice(0, 20);
}

function hintForUrl(url) {
  const u = url.toLowerCase();
  if (u.includes("logo")) return "logo";
  if (u.includes("banner") || u.includes("2560")) return "hero";
  if (u.includes("1280x880") || u.includes("anh-chinh")) return "gallery";
  if (u.includes("480x") || u.includes("anh-nho")) return "card";
  return "default";
}

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function optimizeOne(url, manifest) {
  if (manifest[url]) return manifest[url];

  const hint = hintForUrl(url);
  const maxW = WIDTH_BY_HINT[hint] ?? WIDTH_BY_HINT.default;
  const name = hashName(url);
  const outPath = join(MEDIA_DIR, `${name}.webp`);
  const publicPath = `/media/${name}.webp`;

  if (existsSync(outPath)) {
    manifest[url] = publicPath;
    return publicPath;
  }

  const input = await fetchBuffer(url);
  let pipeline = sharp(input).rotate();
  const meta = await pipeline.metadata();
  if ((meta.width ?? 0) > maxW) {
    pipeline = pipeline.resize(maxW, undefined, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  await pipeline.webp({ quality: 82 }).toFile(outPath);
  manifest[url] = publicPath;
  console.log("✓", publicPath, "←", url.slice(0, 72) + "…");
  return publicPath;
}

async function main() {
  mkdirSync(MEDIA_DIR, { recursive: true });

  const files = [
    join(ROOT, "data", "yadea-products.json"),
    join(ROOT, "data", "yadea-home.json"),
    join(ROOT, "data", "site-settings.json"),
  ];

  const urls = new Set();
  for (const f of files) {
    if (!existsSync(f)) continue;
    collectUrls(JSON.parse(readFileSync(f, "utf8")), urls);
  }

  const manifest = existsSync(MANIFEST_DATA)
    ? JSON.parse(readFileSync(MANIFEST_DATA, "utf8"))
    : {};

  const list = [...urls];
  console.log(`Sync ${list.length} ảnh → public/media/ …\n`);

  let ok = 0;
  let fail = 0;
  for (const url of list) {
    try {
      await optimizeOne(url, manifest);
      ok++;
    } catch (e) {
      fail++;
      console.warn("✗", url.slice(0, 60), e.message);
    }
  }

  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(MANIFEST_DATA, json);
  writeFileSync(MANIFEST_PUBLIC, json);

  console.log(`\nXong: ${ok} ok, ${fail} lỗi. Manifest → data/ + public/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
