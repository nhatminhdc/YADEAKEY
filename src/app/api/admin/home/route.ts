import { yadeaHomeSchema } from "@/lib/yadea-home";
import { readHomeFile, writeHomeFile } from "@/lib/admin-data";
import { jsonError, jsonOk, requireAdmin } from "@/lib/admin-api";
import { revalidatePath } from "next/cache";

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await req.json()) as { home?: unknown };
    const home = yadeaHomeSchema.parse(body.home);
    writeHomeFile(home);
    revalidatePath("/");
    return jsonOk({ home: readHomeFile() });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Dữ liệu trang chủ không hợp lệ");
  }
}
