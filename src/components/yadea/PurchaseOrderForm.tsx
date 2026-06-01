"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  formatProductOptionLabel,
  type PurchaseProductOption,
} from "@/lib/purchase-product-options";

type Props = {
  products: PurchaseProductOption[];
  defaultSlug: string;
  selectedColor?: string;
  selectedVersion?: string;
};

export function PurchaseOrderForm({
  products,
  defaultSlug,
  selectedColor,
  selectedVersion,
}: Props) {
  const initialSlug =
    products.some((p) => p.slug === defaultSlug)
      ? defaultSlug
      : (products[0]?.slug ?? "");

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const selectedProduct = useMemo(
    () => products.find((p) => p.slug === selectedSlug),
    [products, selectedSlug],
  );

  const showConfiguratorExtras =
    selectedSlug === defaultSlug && (selectedColor || selectedVersion);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          productName: selectedProduct.name,
          productSlug: selectedProduct.slug,
          productPrice: selectedProduct.price,
          selectedColor:
            showConfiguratorExtras && selectedColor ? selectedColor : undefined,
          selectedVersion:
            showConfiguratorExtras && selectedVersion
              ? selectedVersion
              : undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Gửi thất bại. Vui lòng thử lại.");
        return;
      }

      setStatus("success");
      setMessage(data.message ?? "Đã gửi đơn thành công!");
      setCustomerName("");
      setPhone("");
      setNotes("");
    } catch {
      setStatus("error");
      setMessage("Lỗi kết nối. Kiểm tra mạng và thử lại.");
    }
  }

  const inputClass = "yadea-input";

  if (!products.length) {
    return (
      <p className="mt-6 text-sm text-red-600">
        Chưa có danh sách sản phẩm. Vui lòng thử lại sau.
      </p>
    );
  }

  return (
    <form id="dat-hang" onSubmit={onSubmit} className="mt-6 scroll-mt-28 space-y-4">
      <div>
        <label htmlFor="po-name" className="text-sm font-medium text-gray-800">
          Họ và tên <span className="text-brand">*</span>
        </label>
        <input
          id="po-name"
          type="text"
          required
          minLength={2}
          maxLength={120}
          autoComplete="name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className={inputClass}
          placeholder="Nguyễn Văn A"
        />
      </div>

      <div>
        <label htmlFor="po-phone" className="text-sm font-medium text-gray-800">
          Số điện thoại <span className="text-brand">*</span>
        </label>
        <input
          id="po-phone"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          placeholder="0901234567"
        />
      </div>

      <div>
        <label htmlFor="po-product" className="text-sm font-medium text-gray-800">
          Dòng xe muốn mua <span className="text-brand">*</span>
        </label>
        <select
          id="po-product"
          required
          value={selectedSlug}
          onChange={(e) => setSelectedSlug(e.target.value)}
          className={inputClass}
        >
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>
              {formatProductOptionLabel(p)}
            </option>
          ))}
        </select>
        {showConfiguratorExtras && (
          <p className="mt-1 text-xs text-gray-500">
            {selectedColor && `Màu: ${selectedColor}`}
            {selectedColor && selectedVersion && " · "}
            {selectedVersion && `Phiên bản: ${selectedVersion}`}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="po-notes" className="text-sm font-medium text-gray-800">
          Ghi chú
        </label>
        <textarea
          id="po-notes"
          rows={3}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputClass}
          placeholder="Thời gian giao xe, địa chỉ, đăng ký lái thử..."
        />
      </div>

      {message && (
        <p
          className={`rounded px-3 py-2 text-sm ${
            status === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-700"
          }`}
          role="alert"
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className="yadea-config-cta disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading"
          ? "Đang gửi…"
          : status === "success"
            ? "Đã gửi ✓"
            : "Gửi đơn mua"}
      </button>
    </form>
  );
}
