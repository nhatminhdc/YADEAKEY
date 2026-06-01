import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { z } from "zod";

const linkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const productOverrideSchema = z.object({
  name: z.string().optional(),
  price: z.number().nullable().optional(),
  category: z.string().optional(),
  badge: z.enum(["HOT", "NEW"]).nullable().optional(),
  hidden: z.boolean().optional(),
  tagline: z.string().nullable().optional(),
});

export const siteSettingsSchema = z.object({
  updatedAt: z.string(),
  header: z.object({
    logoUrl: z.string(),
    topBarHotline: z.string(),
    topBar: z.array(linkSchema),
    mainNav: z.array(linkSchema),
  }),
  footer: z.object({
    logoUrl: z.string(),
    companyName: z.string(),
    addressLines: z.array(z.string()),
    hotline: z.string(),
    cskh: z.string(),
    email: z.string(),
    copyright: z.string(),
    columns: z.array(
      z.object({
        title: z.string(),
        links: z.array(linkSchema),
      }),
    ),
    social: z.object({
      facebook: z.string(),
      youtube: z.string(),
      instagram: z.string(),
    }),
    bottomLinks: z.array(linkSchema),
  }),
  categories: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      enabled: z.boolean(),
    }),
  ),
  listingOrder: z.object({
    all: z.array(z.string()),
    "xe-may-dien": z.array(z.string()),
    "xe-gan-may-dien": z.array(z.string()),
  }),
  productOverrides: z.record(z.string(), productOverrideSchema),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type ProductOverride = z.infer<typeof productOverrideSchema>;
export type ListingOrderKey = keyof SiteSettings["listingOrder"];

const settingsPath = () => join(process.cwd(), "data", "site-settings.json");

export function loadSiteSettings(): SiteSettings {
  const raw = readFileSync(settingsPath(), "utf8");
  return siteSettingsSchema.parse(JSON.parse(raw));
}

export function saveSiteSettings(settings: SiteSettings): void {
  const next = siteSettingsSchema.parse({
    ...settings,
    updatedAt: new Date().toISOString(),
  });
  writeFileSync(settingsPath(), `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

export function getCategoryLabel(
  settings: SiteSettings,
  categoryId: string,
): string {
  return (
    settings.categories.find((c) => c.id === categoryId)?.label ?? categoryId
  );
}
