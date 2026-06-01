import { NextResponse } from "next/server";
import { runFullYadeaSync } from "@/lib/admin-data";
import { jsonOk, jsonError, requireAdmin } from "@/lib/admin-api";
import { revalidatePath } from "next/cache";

export const maxDuration = 300;

export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const steps = await runFullYadeaSync();
    const allOk = steps.every((s) => s.ok);
    revalidatePath("/", "layout");
    revalidatePath("/san-pham");

    if (!allOk) {
      return NextResponse.json(
        { ok: false, steps, error: "Một hoặc nhiều bước sync thất bại" },
        { status: 500 },
      );
    }

    return jsonOk({ steps });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Sync thất bại", 500);
  }
}
