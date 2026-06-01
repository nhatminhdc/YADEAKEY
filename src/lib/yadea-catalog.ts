import { readFileSync } from "fs";
import { join } from "path";
import {
  yadeaCatalogSchema,
  type YadeaCatalog,
  type YadeaProduct,
} from "@/lib/yadea-types";

export type { YadeaCatalog, YadeaProduct };
export {
  displayName,
  getColorSwatches,
  getProductBySlug,
  getProductImage,
  proxyImageUrl,
} from "@/lib/yadea-types";

const catalogPath = () => join(process.cwd(), "data", "yadea-products.json");

export function loadCatalog(): YadeaCatalog {
  const raw = readFileSync(catalogPath(), "utf8");
  return yadeaCatalogSchema.parse(JSON.parse(raw));
}
