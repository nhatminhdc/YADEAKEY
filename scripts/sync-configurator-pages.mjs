/**
 * Đồng bộ configurator — CHỈ ảnh/thông số thuộc đúng trang sản phẩm đó
 * Run: node scripts/sync-configurator-pages.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const CATALOG_TO_YADEA = {
  "yadea-vigor-2025": "yadea-vigor-nang-cap",
  "yadea-ossy": "ossy",
  "yadea-orla-2024": "yadea-orla-gau-dau",
  "yadea-osta-2026": "yadea-osta",
  "yadea-velax-u-2026": "yadea-velax-u",
  "yadea-voltguard-p-l": "yadea-voltguad-p-l",
  "yadea-voltguard-u80-2pin": "yadea-voltguard-u80",
  "i8-vintage": "yadea-i8-vintage",
};

/** Từ khóa nhận diện ảnh đúng xe — không lấy ảnh xe khác */
function productTokens(yadeaSlug) {
  const base = yadeaSlug.replace(/^yadea-/, "");
  const tokens = new Set([
    yadeaSlug.toLowerCase(),
    base.toLowerCase(),
    base.replace(/-/g, "").toLowerCase(),
  ]);
  for (const part of base.split("-")) {
    if (part.length >= 2) tokens.add(part.toLowerCase());
  }
  if (base.includes("voltguard")) {
    tokens.add("voltguard");
    if (base.includes("u80")) tokens.add("u80");
    if (base.includes("u50")) tokens.add("u50");
  }
  if (base === "x-sky") {
    tokens.add("xsky");
    tokens.add("x-sky");
  }
  if (base.includes("oris")) tokens.add("oris-h");
  if (base.includes("odora")) tokens.add("odora");
  return [...tokens];
}

const OTHER_MODEL_MARKERS = [
  "ifun",
  "velax-u",
  "velax-h-plus",
  "velax-h",
  "voltguard",
  "oris-h",
  "odora-s2",
  "odora-h",
  "xbull",
  "icute",
  "vekoo",
  "ocean",
  "orla",
  "ossy",
  "vigor",
  "vito",
  "flit",
  "osta",
  "ova",
  "xzone",
  "x-sky",
  "i8-vintage",
  "i8-h",
  "i8-gau",
];

function isOtherModelImage(url, yadeaSlug) {
  const u = url.toLowerCase();
  if (/logo|banner|background|avt-|favicon|circle-shape/i.test(u)) return true;

  const tokens = productTokens(yadeaSlug);
  if (tokens.some((t) => t.length >= 3 && u.includes(t))) return false;

  const slugKey = yadeaSlug.replace(/^yadea-/, "").replace(/-nang-cap$/, "");
  for (const marker of OTHER_MODEL_MARKERS) {
    if (slugKey.includes(marker) || marker.includes(slugKey)) continue;
    if (u.includes(marker)) return true;
  }
  return false;
}

function urlBelongsToProduct(url, yadeaSlug) {
  if (isOtherModelImage(url, yadeaSlug)) return false;
  const u = url.toLowerCase();
  const tokens = productTokens(yadeaSlug);
  if (tokens.some((t) => t.length >= 3 && u.includes(t))) return true;
  if (/ngang-cac-mau|1280x880|anh-chinh|co-bong|mau-trang/i.test(u)) return true;
  return false;
}

function extractProductImages(html, yadeaSlug) {
  const tokens = productTokens(yadeaSlug);
  const galleryStart = html.indexOf("vii-product-gallery");
  const dotsStart = html.indexOf("vii-product-color-dots");
  const start =
    galleryStart >= 0
      ? galleryStart
      : dotsStart >= 0
        ? dotsStart
        : html.indexOf("vii-product-h-specs");

  const endMarkers = [
    "Đăng ký lái thử",
    "vii-product-test-drive",
    "vii-footer",
  ];
  let end = html.length;
  for (const marker of endMarkers) {
    const i = html.indexOf(marker, start > 0 ? start : 0);
    if (i > start && i < end) end = i;
  }
  const chunk =
    start >= 0 ? html.slice(start, end) : html.slice(0, Math.min(html.length, 400000));

  const found = [];
  const seen = new Set();
  const re = /https:\/\/www\.yadea\.com\.vn\/wp-content\/uploads\/[^"'\s\\]+/gi;
  let m;
  while ((m = re.exec(chunk))) {
    let u = m[0].replace(/\\/g, "");
    if (/-\d+x\d+\./i.test(u)) continue;
    if (/\.(svg|jpg)$/i.test(u) && !/anh-chinh/i.test(u)) continue;
    if (!urlBelongsToProduct(u, yadeaSlug)) continue;
    if (seen.has(u)) continue;
    seen.add(u);
    found.push({ url: u, pos: m.index });
  }

  found.sort((a, b) => a.pos - b.pos);

  const colorLike = found.filter(
    (x) =>
      /mau-|ngang-cac-mau|1280x880|anh-chinh|co-bong|mau-trang/i.test(x.url) ||
      /Mau-/.test(x.url),
  );
  const list = (colorLike.length >= 2 ? colorLike : found).map((x) => x.url);
  return list;
}

/** Tên hiển thị chính thức — lấy từ <h1> trang /san-pham/ (không dùng SEO title) */
function extractModelVersions(html) {
  const selectMatch = html.match(
    /<select[^>]*id="pa_phien-ban"[^>]*>([\s\S]*?)<\/select>/i,
  );
  if (!selectMatch) return [];

  const versions = [];
  const optRe = /<option value="([^"]*)"([^>]*)>([^<]*)<\/option>/gi;
  let m;
  while ((m = optRe.exec(selectMatch[1]))) {
    const id = m[1].trim();
    if (!id) continue;
    versions.push({ id, name: m[3].trim() });
  }
  return versions;
}

function extractProductName(html) {
  const h1s = [...html.matchAll(/<h1[^>]*>([^<]+)<\/h1>/gi)].map((m) =>
    m[1].trim(),
  );
  const name =
    h1s.find((h) => /^YADEA\s/i.test(h) || /^Yadea\s/i.test(h)) ?? h1s[0];
  return name?.length ? name : null;
}

function parseConfiguratorHtml(html, yadeaSlug) {
  const dots = [
    ...html.matchAll(
      /vii-product-color-dots__item[^>]*style="--dot-color:([^";]+)[^"]*"[^>]*aria-label="([^"]+)"/g,
    ),
  ].map((m) => ({
    hex: m[1].trim().replace(/;$/, ""),
    name: m[2].trim(),
  }));

  const productImages = extractProductImages(html, yadeaSlug);

  const colorVariants = dots
    .map((dot, i) => ({
      name: dot.name,
      hex: dot.hex,
      imageUrl: productImages[i] ?? "",
    }))
    .filter((c) => c.imageUrl);

  const keySpecs = [];
  const specRe =
    /vii-product-h-specs-txt d-block name">([^<]+)<\/span><span class="vii-product-h-specs-txt d-block value heading_5[^"]*">([^<]+)<\/span>(?:<span class="vii-product-h-specs-txt d-block description">([^<]*)<\/span>)?/g;
  let sm;
  while ((sm = specRe.exec(html))) {
    keySpecs.push({
      label: sm[1].trim(),
      value: sm[2].trim(),
      ...(sm[3]?.trim() ? { description: sm[3].trim() } : {}),
    });
  }

  const outOfStock = /hết hàng|không có sẵn/i.test(html);
  const priceMatch = html.match(/([\d]{1,3}(?:[.,]\d{3})+)\s*VND/i);
  let price = null;
  if (priceMatch) {
    price = Math.round(
      parseFloat(priceMatch[1].replace(/\./g, "").replace(/,/g, "")),
    );
  }

  const name = extractProductName(html);
  const modelVersions = extractModelVersions(html);

  return {
    colorVariants,
    keySpecs,
    outOfStock,
    price,
    productImages,
    name,
    modelVersions,
  };
}

async function fetchPage(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  return res.text();
}

async function main() {
  const catalogPath = join(ROOT, "data", "yadea-products.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  const sidebar = JSON.parse(
    readFileSync(join(ROOT, "data", "yadea-configurator-sidebar.json"), "utf8"),
  );

  for (const product of catalog.products) {
    const slug = CATALOG_TO_YADEA[product.slug] ?? product.slug;
    const url = `https://www.yadea.com.vn/san-pham/${slug}/`;
    process.stdout.write(`→ ${product.slug} … `);

    try {
      const html = await fetchPage(url);
      product.pageLayout = "configurator";
      product.purchaseUrl = url;
      product.configuratorSidebar = sidebar;
      product.gallery = [];
      delete product.colors;

      if (!html) {
        console.log("404");
        continue;
      }

      const parsed = parseConfiguratorHtml(html, slug);
      product.outOfStock = parsed.outOfStock;

      if (parsed.name) {
        product.name = parsed.name;
      }

      if (parsed.modelVersions.length) {
        product.modelVersions = parsed.modelVersions;
      } else {
        delete product.modelVersions;
      }

      if (parsed.colorVariants.length) {
        product.colorVariants = parsed.colorVariants;
        product.colors = parsed.colorVariants.map((c) => ({
          name: c.name,
          hex: c.hex,
          imageUrl: c.imageUrl,
        }));
        product.heroImage = parsed.colorVariants[0].imageUrl;
        product.gallery = parsed.colorVariants.map((c) => c.imageUrl);
      } else if (parsed.productImages[0]) {
        product.heroImage = parsed.productImages[0];
        product.gallery = parsed.productImages.slice(0, 6);
      }

      if (parsed.keySpecs.length) {
        product.keySpecs = parsed.keySpecs;
        product.highlights = [];
      }

      if (parsed.price && !parsed.outOfStock) {
        product.price = parsed.price;
      }

      console.log(
        `ok (${parsed.colorVariants.length} màu, ${parsed.keySpecs.length} spec)`,
      );
    } catch (e) {
      console.log(`err: ${e.message}`);
    }

    await new Promise((r) => setTimeout(r, 450));
  }

  catalog.syncedAt = new Date().toISOString();
  writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
  console.log("\nDone.", catalog.products.length, "products.");
}

main();
