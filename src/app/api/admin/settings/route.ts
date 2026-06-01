import { siteSettingsSchema } from "@/lib/site-settings";
import { readSettingsFile, writeSettingsFile } from "@/lib/admin-data";
import { jsonError, jsonOk, requireAdmin } from "@/lib/admin-api";
import { revalidatePath } from "next/cache";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return jsonOk({ settings: readSettingsFile() });
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await req.json()) as { settings?: unknown };
    const settings = siteSettingsSchema.parse(body.settings);
    writeSettingsFile(settings);
    revalidatePath("/", "layout");
    return jsonOk({ settings: readSettingsFile() });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Dữ liệu không hợp lệ");
  }
}
