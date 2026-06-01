/**
 * Sync product catalog from https://www.yadea.com.vn/
 * Run: node scripts/sync-yadea.mjs
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BASE = "https://www.yadea.com.vn";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parsePrice(text) {
  const m = text.match(/([\d.,]+)\s*VND/i);
  if (!m) return null;
  return Math.round(parseFloat(m[1].replace(/\./g, "").replace(/,/g, "")));
}

function slugFromUrl(url) {
  const m = url.match(/thong-tin-san-pham\/([^/]+)/);
  return m ? m[1] : url;
}

function extractProductUrls(html) {
  const urls = new Set();
  const re = /href="(https:\/\/www\.yadea\.com\.vn\/thong-tin-san-pham\/[^"#?]+)"/gi;
  let m;
  while ((m = re.exec(html))) urls.add(m[1].replace(/\/$/, "") + "/");
  return [...urls];
}

function extractImages(html) {
  const imgs = new Set();
  const re =
    /https:\/\/www\.yadea\.com\.vn\/wp-content\/uploads\/20\d{2}\/[^"'\s>]+\.(?:jpg|jpeg|png|webp)/gi;
  let m;
  while ((m = re.exec(html))) {
    const u = m[0];
    if (!u.includes("logo") && !u.includes("favicon") && !u.includes("banner-mobile"))
      imgs.add(u.split("-").slice(0, -1).join("-") === u ? u : u); // keep full
  }
  return [...imgs];
}

function extractTitle(html) {
  const h1 = html.match(/<h1[^>]*>([^<]+)</i);
  if (h1) return decodeHtml(h1[1].trim());
  const og = html.match(/property="og:title"\s+content="([^"]+)"/i);
  if (og) return decodeHtml(og[1].split("|")[0].trim());
  return null;
}

function extractTagline(html) {
  const sub = html.match(/class="[^"]*product-subtitle[^"]*"[^>]*>([^<]+)</i);
  if (sub) return decodeHtml(sub[1].trim());
  const desc = html.match(/class="[^"]*slogan[^"]*"[^>]*>([^<]+)</i);
  if (desc) return decodeHtml(desc[1].trim());
  return null;
}

function extractPrices(html) {
  const prices = [];
  const re = /([\d]{1,3}(?:[.,]\d{3})+)\s*VND/gi;
  let m;
  while ((m = re.exec(html))) {
    const p = parsePrice(m[0]);
    if (p && p > 5_000_000 && p < 100_000_000) prices.push(p);
  }
  return [...new Set(prices)].sort((a, b) => b - a);
}

function extractSpecSections(html) {
  const sections = [];
  // accordion panels: title + rows
  const panelRe =
    /<div[^>]*class="[^"]*accordion[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi;
  const titleRe = /<(?:h[2-4]|button)[^>]*>([^<]+)</gi;
  const rowRe =
    /<div[^>]*class="[^"]*(?:spec-row|row-item|table-row)[^"]*"[^>]*>[\s\S]*?<\/div>/gi;

  // Simpler: find "THÔNG SỐ" block and dl/dt/dd or table rows
  const specBlock = html.match(/THÔNG SỐ KỸ THUẬT[\s\S]{0,80000}/i);
  if (!specBlock) return sections;

  const block = specBlock[0];
  const categoryRe =
    /(?:class="[^"]*accordion-title[^"]*"|class="[^"]*spec-title[^"]*")[^>]*>([^<]+)</gi;
  let cat;
  const categories = [];
  while ((cat = categoryRe.exec(block))) {
    const t = decodeHtml(cat[1].trim());
    if (t && t.length < 80 && !t.includes("MUA NGAY")) categories.push(t);
  }

  const labelValueRe =
    /<(?:dt|td|span)[^>]*class="[^"]*(?:label|name|title)[^"]*"[^>]*>([^<]+)<[\s\S]*?<(?:dd|td|span)[^>]*class="[^"]*(?:value|content)[^"]*"[^>]*>([^<]+)</gi;
  const rows = [];
  let lv;
  while ((lv = labelValueRe.exec(block))) {
    rows.push({ label: decodeHtml(lv[1].trim()), value: decodeHtml(lv[2].trim()) });
  }

  // Fallback: paired divs
  if (rows.length === 0) {
    const pairRe = /<div[^>]*>([^<]{2,60})<\/div>\s*<div[^>]*>([^<]{1,120})<\/div>/gi;
    let p;
    while ((p = pairRe.exec(block))) {
      const label = decodeHtml(p[1].trim());
      const value = decodeHtml(p[2].trim());
      if (label && value && !label.includes("http")) rows.push({ label, value });
    }
  }

  if (categories.length) {
    categories.forEach((title, i) => {
      sections.push({
        title,
        rows: i === 0 ? rows.slice(0, 30) : [],
      });
    });
  } else if (rows.length) {
    sections.push({ title: "Động cơ & Bình điện", rows: rows.slice(0, 40) });
  }

  return sections;
}

function extractColorImages(html) {
  const colors = [];
  const colorRe =
    /data-color="([^"]+)"[^>]*(?:data-src|src)="([^"]+)"/gi;
  let m;
  while ((m = colorRe.exec(html))) {
    colors.push({ name: m[1], imageUrl: m[2] });
  }
  if (colors.length) return colors;

  // color swatch section
  const swatchRe =
    /class="[^"]*color[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"/gi;
  while ((m = swatchRe.exec(html))) {
    colors.push({ name: m[2] || `Màu ${colors.length + 1}`, imageUrl: m[1] });
  }
  return colors;
}

function extractHighlights(html) {
  const items = [];
  const re =
    /class="[^"]*(?:highlight|feature-item|spec-icon)[^"]*"[^>]*>[\s\S]*?<(?:p|span|h\d)[^>]*>([^<]{3,80})</gi;
  let m;
  while ((m = re.exec(html))) {
    const t = decodeHtml(m[1].trim());
    if (t && !items.includes(t)) items.push(t);
  }
  return items.slice(0, 8);
}

function pickHeroImage(images, name) {
  const key = name.toLowerCase().replace(/yadea\s*/i, "").trim();
  const scored = images
    .filter((u) => !u.includes("-150x") && !u.includes("-300x"))
    .map((u) => {
      let score = 0;
      if (u.includes("1280") || u.includes("1920")) score += 3;
      if (key && u.toLowerCase().includes(key.split(" ")[0])) score += 5;
      if (u.includes("anh-chinh") || u.includes("Anh-chinh")) score += 4;
      return { u, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored[0]?.u || images[0] || null;
}

function parseHomeProducts(html) {
  const products = [];
  // product cards on homepage
  const cardRe =
    /YADEA\s+[A-Z0-9][A-Z0-9\s+-]*[\s\S]{0,2000}?([\d]{1,3}(?:[.,]\d{3})+)\s*VND/gi;
  let m;
  const seen = new Set();
  while ((m = cardRe.exec(html))) {
    const chunk = m[0];
    const nameM = chunk.match(/YADEA\s+[A-Z0-9][A-Z0-9\s+-]*/);
    if (!nameM) continue;
    const name = nameM[0].trim().replace(/\s+/g, " ");
    if (seen.has(name)) continue;
    seen.add(name);
    const price = parsePrice(m[1] + " VND");
    products.push({ name, price });
  }
  return products;
}

async function parseProductPage(url, homeHint) {
  const html = await fetchHtml(url);
  const slug = slugFromUrl(url);
  const name = extractTitle(html) || homeHint?.name || slug;
  const tagline = extractTagline(html);
  const prices = extractPrices(html);
  const images = extractImages(html);
  const heroImage = pickHeroImage(images, name);
  const gallery = images.filter((u) => u !== heroImage).slice(0, 12);
  const specSections = extractSpecSections(html);
  const colors = extractColorImages(html);
  const highlights = extractHighlights(html);

  const badge = html.includes("BÁN CHẠY")
    ? "HOT"
    : html.includes("MỚI") || html.includes("NEW")
      ? "NEW"
      : null;

  return {
    slug,
    name,
    tagline,
    price: prices[0] || homeHint?.price || null,
    compareAtPrice: prices[1] || null,
    sourceUrl: url,
    badge,
    heroImage,
    gallery,
    colors,
    highlights,
    specSections,
    category: slug.includes("i8") || slug.includes("ifun") || slug.includes("flit") || slug.includes("vito")
      ? "xe-gan-may-dien"
      : "xe-may-dien",
    syncedAt: new Date().toISOString(),
  };
}

async function main() {
  console.log("Fetching Yadea homepage...");
  const homeHtml = await fetchHtml(BASE + "/");
  const productUrls = extractProductUrls(homeHtml);
  const homeProducts = parseHomeProducts(homeHtml);
  console.log(`Found ${productUrls.length} product URLs`);

  const homeByName = Object.fromEntries(
    homeProducts.map((p) => [p.name.toUpperCase(), p]),
  );

  const catalog = {
    syncedAt: new Date().toISOString(),
    source: BASE,
    hero: {
      imageUrl:
        "https://www.yadea.com.vn/wp-content/uploads/2025/09/2560x1120.jpg",
      mobileUrl:
        "https://www.yadea.com.vn/wp-content/uploads/2025/12/banner-mobile.png",
      title: "YADEA OSTA",
      subtitle: "Enjoy Your Life",
      link: "/san-pham/yadea-osta-2026",
    },
    newProducts: [
      {
        name: "YADEA OSTA",
        slug: "yadea-osta-2026",
        imageUrl:
          "https://www.yadea.com.vn/wp-content/uploads/2026/02/osta-banner-1.jpg",
        href: "/san-pham/yadea-osta-2026",
      },
      {
        name: "YADEA OVA",
        slug: "yadea-ova",
        imageUrl:
          "https://www.yadea.com.vn/wp-content/uploads/2026/03/Ova-Anh-danh-muc-san-pham.png",
        href: "/san-pham/yadea-ova",
      },
    ],
    news: [],
    instagram: [],
    products: [],
  };

  // News from homepage
  const newsRe =
    /(\d{2}\/\d{2}\/\d{4})[\s\S]{0,200}?(Tin tức|Sự kiện)[\s\S]{0,100}?([^<]{10,120})/gi;
  let nm;
  while ((nm = newsRe.exec(homeHtml))) {
    catalog.news.push({
      date: nm[1],
      category: nm[2],
      title: decodeHtml(nm[3].trim()),
      href: "https://www.yadea.com.vn/tin-tuc/",
    });
    if (catalog.news.length >= 6) break;
  }

  for (let i = 0; i < productUrls.length; i++) {
    const url = productUrls[i];
    const slug = slugFromUrl(url);
    process.stdout.write(`[${i + 1}/${productUrls.length}] ${slug}... `);
    try {
      const hint = Object.values(homeByName).find((p) =>
        slug.replace(/yadea-|-/g, "").includes(p.name.replace(/YADEA\s*/i, "").replace(/\s/g, "").toLowerCase().slice(0, 4)),
      );
      const product = await parseProductPage(url, hint);
      catalog.products.push(product);
      console.log("OK");
    } catch (e) {
      console.log("FAIL:", e.message);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  // Sort: featured first (osta, ova), then by price desc
  catalog.products.sort((a, b) => (b.price || 0) - (a.price || 0));

  const outPath = join(ROOT, "data", "yadea-products.json");
  writeFileSync(outPath, JSON.stringify(catalog, null, 2), "utf8");
  console.log(`\nWrote ${catalog.products.length} products → ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
