/** Chuyển link yadea.com.vn sang trang nội bộ — không redirect ra site gốc */
export function internalPathFromYadeaUrl(url: string): string | null {
  try {
    const u = new URL(url, "https://www.yadea.com.vn");
    if (!u.hostname.includes("yadea.com.vn")) return null;

    const product =
      u.pathname.match(/\/thong-tin-san-pham\/([^/]+)/)?.[1] ??
      u.pathname.match(/\/san-pham\/([^/]+)/)?.[1];
    if (product) return `/san-pham/${product}#dat-hang`;

    return "/dat-hang";
  } catch {
    return null;
  }
}

export function resolveSiteHref(href: string): string {
  if (!href || href === "#") return "/dat-hang";
  if (href.startsWith("/")) return href;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return href;

  const internal = internalPathFromYadeaUrl(href);
  if (internal) return internal;

  return href;
}

/** Chỉ mở tab mới cho mạng xã hội / bên thứ ba — không phải yadea.com.vn */
export function opensInNewTab(href: string): boolean {
  if (href.startsWith("/") || href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (href.includes("yadea.com.vn")) return false;
  return /^https?:\/\//i.test(href);
}
