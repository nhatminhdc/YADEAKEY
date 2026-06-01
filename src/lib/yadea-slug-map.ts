/** Slug trên yadea.com.vn/san-pham → slug trong catalog local */
export const YADEA_SLUG_TO_CATALOG: Record<string, string> = {
  "yadea-vigor-nang-cap": "yadea-vigor-2025",
  ossy: "yadea-ossy",
  "yadea-orla-gau-dau": "yadea-orla-2024",
  xzone: "yadea-velax",
  "yadea-osta": "yadea-osta-2026",
  "yadea-velax-u": "yadea-velax-u-2026",
  "yadea-voltguad-p-l": "yadea-voltguard-p-l",
  "yadea-voltguard-u80": "yadea-voltguard-u80-2pin",
  "yadea-i8-vintage": "i8-vintage",
};

export function catalogSlugFromYadea(yadeaSlug: string): string {
  return YADEA_SLUG_TO_CATALOG[yadeaSlug] ?? yadeaSlug;
}

export function productHref(catalogSlug: string): string {
  return `/san-pham/${catalogSlug}`;
}
