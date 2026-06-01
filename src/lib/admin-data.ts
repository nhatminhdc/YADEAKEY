import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { spawn } from "child_process";
import { yadeaCatalogSchema } from "@/lib/yadea-types";
import { yadeaHomeSchema, type YadeaHome } from "@/lib/yadea-home";
import {
  loadSiteSettings,
  saveSiteSettings,
  siteSettingsSchema,
  type SiteSettings,
} from "@/lib/site-settings";

const dataDir = () => join(process.cwd(), "data");

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path: string, data: unknown): void {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function readCatalogFile() {
  const path = join(dataDir(), "yadea-products.json");
  return yadeaCatalogSchema.parse(readJson(path));
}

export function writeCatalogFile(catalog: ReturnType<typeof readCatalogFile>) {
  writeJson(join(dataDir(), "yadea-products.json"), catalog);
}

export function readHomeFile(): YadeaHome {
  const path = join(dataDir(), "yadea-home.json");
  return yadeaHomeSchema.parse(readJson(path));
}

export function writeHomeFile(home: YadeaHome) {
  writeJson(join(dataDir(), "yadea-home.json"), home);
}

export function readSettingsFile(): SiteSettings {
  return loadSiteSettings();
}

export function writeSettingsFile(settings: SiteSettings) {
  saveSiteSettings(siteSettingsSchema.parse(settings));
}

export type SyncStep = {
  script: string;
  ok: boolean;
  output: string;
};

export function runSyncScript(script: string): Promise<SyncStep> {
  return new Promise((resolve) => {
    const child = spawn("node", [join(process.cwd(), "scripts", script)], {
      cwd: process.cwd(),
      env: process.env,
    });
    let output = "";
    child.stdout.on("data", (d) => {
      output += d.toString();
    });
    child.stderr.on("data", (d) => {
      output += d.toString();
    });
    child.on("close", (code) => {
      resolve({
        script,
        ok: code === 0,
        output: output.slice(-4000),
      });
    });
    child.on("error", (err) => {
      resolve({
        script,
        ok: false,
        output: String(err),
      });
    });
  });
}

export async function runFullYadeaSync(): Promise<SyncStep[]> {
  const scripts = [
    "sync-yadea.mjs",
    "sync-yadea-home.mjs",
    "sync-configurator-pages.mjs",
  ];
  const results: SyncStep[] = [];
  for (const script of scripts) {
    results.push(await runSyncScript(script));
    if (!results[results.length - 1].ok) break;
  }
  return results;
}
