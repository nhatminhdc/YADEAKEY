import type { PurchaseOrderBody } from "./purchase-order-schema";

function formatPrice(price: number | null | undefined): string {
  if (price == null) return "Liên hệ";
  return `${new Intl.NumberFormat("vi-VN").format(price)} VND`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildPurchaseOrderTelegramMessage(
  order: PurchaseOrderBody,
  orderId?: string,
): string {
  const lines = [
    "🛵 <b>Đơn đặt mua mới — YADEA</b>",
    "",
    `👤 <b>Khách:</b> ${escapeHtml(order.customerName)}`,
    `📞 <b>SĐT:</b> ${escapeHtml(order.phone)}`,
    `🏷 <b>Dòng xe:</b> ${escapeHtml(order.productName)}`,
    `💰 <b>Giá:</b> ${escapeHtml(formatPrice(order.productPrice ?? null))}`,
  ];

  if (order.selectedColor) {
    lines.push(`🎨 <b>Màu:</b> ${escapeHtml(order.selectedColor)}`);
  }
  if (order.selectedVersion) {
    lines.push(`📦 <b>Phiên bản:</b> ${escapeHtml(order.selectedVersion)}`);
  }
  if (order.notes) {
    lines.push(`📝 <b>Ghi chú:</b> ${escapeHtml(order.notes)}`);
  }

  lines.push("", `🔗 Slug: <code>${escapeHtml(order.productSlug)}</code>`);
  if (orderId) lines.push(`🆔 ID: <code>${escapeHtml(orderId)}</code>`);

  return lines.join("\n");
}

export async function sendTelegramPurchaseOrder(
  order: PurchaseOrderBody,
  orderId?: string,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    throw new Error("TELEGRAM_NOT_CONFIGURED");
  }

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildPurchaseOrderTelegramMessage(order, orderId),
        parse_mode: "HTML",
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram API error: ${res.status} ${err}`);
  }
}
