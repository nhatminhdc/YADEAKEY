import { NextResponse } from "next/server";
import { purchaseOrderBodySchema } from "@/lib/purchase-order-schema";
import { insertPurchaseOrder } from "@/lib/supabase-admin";
import { sendTelegramPurchaseOrder } from "@/lib/telegram-notify";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const parsed = purchaseOrderBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 },
    );
  }

  const order = parsed.data;

  try {
    const { id } = await insertPurchaseOrder(order);

    let telegramOk = true;
    try {
      await sendTelegramPurchaseOrder(order, id);
    } catch (e) {
      telegramOk = false;
      console.error("Telegram notify failed:", e);
    }

    return NextResponse.json({
      ok: true,
      id,
      telegramOk,
      message: telegramOk
        ? "Đã gửi đơn thành công. Chúng tôi sẽ liên hệ sớm!"
        : "Đã lưu đơn. Thông báo Telegram tạm lỗi — đội ngũ vẫn nhận được qua hệ thống.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNKNOWN";
    if (msg === "SUPABASE_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          error:
            "Hệ thống chưa cấu hình Supabase. Thêm SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY vào .env",
        },
        { status: 503 },
      );
    }
    console.error("Purchase order error:", e);
    return NextResponse.json(
      { error: "Không thể lưu đơn. Vui lòng thử lại sau." },
      { status: 500 },
    );
  }
}
