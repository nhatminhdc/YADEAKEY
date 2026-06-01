/**
 * Sync homepage assets from https://www.yadea.com.vn/
 * Run: node scripts/sync-yadea-home.mjs
 */
import { writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

async function fetchHtml() {
  const res = await fetch("https://www.yadea.com.vn/", {
    headers: { "User-Agent": UA },
  });
  return res.text();
}

function slugFromHref(href) {
  const m = href?.match(/thong-tin-san-pham\/([^/]+)/);
  return m ? m[1] : null;
}

function parsePrice(html) {
  const m = html.match(/([\d]{1,3}(?:\.\d{3})+)(?:\s|&nbsp;)*<\/span>\s*<span class="woocommerce-Price-currencySymbol">/);
  if (m) return Math.round(parseFloat(m[1].replace(/\./g, "")));
  const m2 = html.match(/([\d]{1,3}(?:\.\d{3})+)\s*(?:&nbsp;)?VND/i);
  if (m2) return Math.round(parseFloat(m2[1].replace(/\./g, "")));
  return null;
}

function parseHomeProducts(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start + 100);
  const chunk = html.slice(start, end > 0 ? end : start + 280000);

  const titles = [
    ...chunk.matchAll(/woocommerce-loop-product__title">([^<]+)</gi),
  ].map((m) => m[1].trim());

  const blocks = chunk.split(/type-product/);
  const products = [];

  for (let i = 1; i < blocks.length; i++) {
    const b = blocks[i].slice(0, 15000);
    const title =
      b.match(/woocommerce-loop-product__title">([^<]+)</i)?.[1]?.trim() ||
      titles[i - 1];
    if (!title || title.length > 80 || title.includes("CHỌN MUA")) continue;

    const href = b.match(
      /href="(https:\/\/www\.yadea\.com\.vn\/thong-tin-san-pham\/[^"]+)"/i,
    )?.[1];
    const price = parsePrice(b);
    const imgs = [
      ...b.matchAll(
        /(?:data-src|src)="(https:\/\/www\.yadea\.com\.vn\/wp-content\/uploads\/[^"]+)"/gi,
      ),
    ].map((x) => x[1]);
    const imageUrl =
      imgs.find((u) => u.includes("Anh-danh-muc") && !/-\d+x\d+/.test(u)) ||
      imgs.find((u) => /Anh-danh-muc|1280x10|anh-chinh/i.test(u) && !/480x\d+/.test(u)) ||
      imgs.find((u) => u.includes("anh-nho") && !/480x\d+/.test(u)) ||
      imgs.find((u) => !/480x\d+/.test(u)) ||
      imgs[0];
    const colorSwatches = [
      ...new Set(
        imgs.filter((u) =>
          /480x330|480x422|ngang-cac-mau|Ova-Anh-ngang/.test(u),
        ),
      ),
    ].slice(0, 6);
    const badgeRaw = b.match(/vii-product-badge[^>]*>([^<]+)</i)?.[1];
    const badge =
      badgeRaw?.includes("BÁN CHẠY") || b.includes("BÁN CHẠY")
        ? "HOT"
        : badgeRaw?.includes("MỚI") || b.includes("MỚI")
          ? "NEW"
          : null;

    const slug = slugFromHref(href);
    if (!slug || !imageUrl) continue;

    products.push({
      name: title.toUpperCase().startsWith("YADEA")
        ? title
        : `YADEA ${title}`,
      price,
      imageUrl,
      href: href || null,
      slug,
      badge,
      colorSwatches,
    });
  }

  const seen = new Set();
  return products.filter((p) => {
    const key = p.slug || p.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseHero(html) {
  const chunk = html.slice(
    html.indexOf("vii-home-banner"),
    html.indexOf("vii-home-banner") + 35000,
  );
  const slides = [];
  const parts = chunk.split("vii-home-banner__slide");
  for (const part of parts.slice(1)) {
    const imgs = [
      ...part.matchAll(
        /(?:src|data-src)="(https:\/\/www\.yadea\.com\.vn\/wp-content\/uploads\/[^"]+)"/gi,
      ),
    ].map((x) => x[1]);
    if (!imgs.length) continue;
    const desktop =
      imgs.find((u) => u.includes("2560") || u.includes("PC-Banner")) ||
      imgs[0];
    const mobile = imgs.find(
      (u) => u.includes("768x970") || u.includes("banner-mobile"),
    );
    const link = part.match(
      /href="(https:\/\/www\.yadea\.com\.vn\/[^"]+)"/i,
    )?.[1];
    slides.push({ desktop, mobile, link });
  }
  return slides;
}

function parseNewProducts(html) {
  const chunk = html.slice(
    html.indexOf("vii-new-products"),
    html.indexOf("vii-new-products") + 15000,
  );
  const items = [];
  const cards = chunk.split("vii-new-products__item");
  for (const card of cards.slice(1)) {
    const href = card.match(/href="([^"]+)"/)?.[1];
    const img =
      card.match(/src="(https:\/\/www\.yadea\.com\.vn[^"]+)"/)?.[1] ||
      card.match(
        /background-image:\s*url\(['"]?(https:\/\/[^'")]+)['"]?\)/i,
      )?.[1];
    const title = card.match(/<h\d[^>]*>([^<]+)</i)?.[1]?.trim();
    if (href && img && !img.includes("data:image")) {
      items.push({
        name: title || (href.includes("osta") ? "YADEA OSTA" : "YADEA OVA"),
        href,
        imageUrl: img,
        slug: slugFromHref(href),
      });
    }
  }
  const seen = new Set();
  return items.filter((x) => {
    if (seen.has(x.href)) return false;
    seen.add(x.href);
    return true;
  });
}

function parseNews(html) {
  const chunk = html.slice(
    html.indexOf("TIN TỨC"),
    html.indexOf("TIN TỨC") + 50000,
  );
  const items = [];
  const parts = chunk.split("vii-blog-item");
  for (const part of parts.slice(1)) {
    const img = part.match(/src="(https:\/\/www\.yadea\.com\.vn[^"]+)"/)?.[1];
    const title = part
      .match(/vii-blog-item__title[^>]*>([^<]+)</i)?.[1]
      ?.replace(/h3 class[^>]+>/, "")
      .trim();
    const date = part.match(/(\d{2}\/\d{2}\/\d{4})/)?.[1];
    const category = part.match(/(Tin tức|Sự kiện)/)?.[0];
    const href = part.match(/href="(https:\/\/www\.yadea\.com\.vn\/[^"]+)"/)?.[1];
    if (title && title.length > 10) {
      items.push({ title, date, category, imageUrl: img, href });
    }
  }
  return items.slice(0, 8);
}

function parseInstagram(html) {
  const chunk = html.slice(
    html.indexOf("THEO DÕI"),
    html.indexOf("THEO DÕI") + 40000,
  );
  const imgs = [
    ...chunk.matchAll(
      /src="(https:\/\/www\.yadea\.com\.vn\/wp-content\/uploads\/20(?:24|25|26)\/[^"]+\.(jpg|png|webp))"/gi,
    ),
  ]
    .map((x) => x[1])
    .filter((u) => !u.includes("logo") && !u.includes("favicon"));
  return [...new Set(imgs)].slice(0, 6);
}

async function main() {
  console.log("Fetching homepage...");
  const html = await fetchHtml();

  const heroSlides = parseHero(html);
  let newProducts = parseNewProducts(html);
  if (newProducts.length < 2) {
    newProducts = [
      {
        name: "YADEA OSTA",
        href: "https://www.yadea.com.vn/thong-tin-san-pham/yadea-osta-2026/",
        imageUrl:
          "https://www.yadea.com.vn/wp-content/uploads/2026/03/Anh-giong-Soobin.png",
        slug: "yadea-osta-2026",
      },
      {
        name: "YADEA OVA",
        href: "https://www.yadea.com.vn/thong-tin-san-pham/yadea-ova/",
        imageUrl:
          "https://www.yadea.com.vn/wp-content/uploads/2026/05/2205-Ova-thay-xe-Soobin-1.png",
        slug: "yadea-ova",
      },
    ];
  }
  const xeMay = parseHomeProducts(html, "XE MÁY ĐIỆN", "XE GẮN MÁY");
  const xeGan = parseHomeProducts(html, "XE GẮN MÁY ĐIỆN", "TIN TỨC");
  const allProducts = [...xeMay, ...xeGan];
  const news = parseNews(html);
  let instagram = parseInstagram(html);

  if (instagram.length < 3) {
    instagram = [
      "https://www.yadea.com.vn/wp-content/uploads/2026/02/Osta-Lifestyle-Tin-bai-web-1280x853-1.png",
      "https://www.yadea.com.vn/wp-content/uploads/2026/05/2205-Ova-thay-xe-Soobin-1.png",
      "https://www.yadea.com.vn/wp-content/uploads/2026/03/Anh-giong-Soobin.png",
      "https://www.yadea.com.vn/wp-content/uploads/2024/06/Orla-P-45-co-bong-1280x1038.png",
      "https://www.yadea.com.vn/wp-content/uploads/2024/08/xzone-xam-ngang-1280x880-1.png",
      "https://www.yadea.com.vn/wp-content/uploads/2024/05/anh-sp-ossy1-1280x1041.png",
    ];
  }

  const catalogPath = join(ROOT, "data", "yadea-products.json");
  let nameBySlug = {};
  try {
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    nameBySlug = Object.fromEntries(
      catalog.products.map((p) => [p.slug, p.name]),
    );
  } catch {
    /* catalog chưa có — giữ tên từ homepage scrape */
  }

  function withOfficialNames(items) {
    return items.map((item) => {
      if (item.slug && nameBySlug[item.slug]) {
        return { ...item, name: nameBySlug[item.slug] };
      }
      return item;
    });
  }

  const home = {
    syncedAt: new Date().toISOString(),
    source: "https://www.yadea.com.vn/",
    hero: {
      slides: heroSlides.length
        ? heroSlides
        : [
            {
              desktop:
                "https://www.yadea.com.vn/wp-content/uploads/2026/02/PC-Banner-2560x1120-1.jpg",
              mobile:
                "https://www.yadea.com.vn/wp-content/uploads/2025/12/banner-mobile.png",
              link: "https://www.yadea.com.vn/thong-tin-san-pham/yadea-osta-2026/",
            },
          ],
      title: "Osta",
      subtitle: "Enjoy the New Life",
      tagline: "Mẫu xe điện phong cách mới",
    },
    newProducts: withOfficialNames(
      newProducts.length
        ? newProducts
        : [
          {
            name: "YADEA OSTA",
            href: "https://www.yadea.com.vn/thong-tin-san-pham/yadea-osta-2026/",
            imageUrl:
              "https://www.yadea.com.vn/wp-content/uploads/2026/03/Anh-giong-Soobin.png",
            slug: "yadea-osta-2026",
          },
          {
            name: "YADEA OVA",
            href: "https://www.yadea.com.vn/thong-tin-san-pham/yadea-ova/",
            imageUrl:
              "https://www.yadea.com.vn/wp-content/uploads/2026/05/2205-Ova-thay-xe-Soobin-1.png",
            slug: "yadea-ova",
          },
        ],
    ),
    allProducts: withOfficialNames(allProducts),
    xeMay: withOfficialNames(xeMay),
    xeGan: withOfficialNames(xeGan),
    news,
    instagram,
    topBar: [
      { label: "Công Nghệ", href: "https://www.yadea.com.vn/cong-nghe/" },
      {
        label: "Hỗ Trợ & Bảo Hành",
        href: "https://www.yadea.com.vn/ho-tro-bao-hanh/",
      },
      { label: "Tin Tức", href: "https://www.yadea.com.vn/tin-tuc/" },
      {
        label: "Cơ Hội Hợp Tác",
        href: "https://www.yadea.com.vn/co-hoi-hop-tac/",
      },
    ],
  };

  const out = join(ROOT, "data", "yadea-home.json");
  writeFileSync(out, JSON.stringify(home, null, 2), "utf8");
  console.log(
    `Wrote ${out}: ${allProducts.length} products, ${news.length} news, ${heroSlides.length} hero slides`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
