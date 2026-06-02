# YADEAKEY — Showroom YADEA Việt Nam

Website showroom clone layout [yadea.com.vn](https://www.yadea.com.vn/): trang chủ, danh sách sản phẩm, trang cấu hình từng xe, form đặt mua (Supabase + Telegram).

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS v4

## Chạy dự án

```bash
npm install
cp .env.example .env   # điền Supabase + Telegram (tùy chọn cho form đặt mua)
npm run dev:clean      # http://localhost:3002 (luôn dùng sau khi sửa code — tránh lỗi cache .next)
```

## Đồng bộ dữ liệu từ yadea.com.vn

```bash
npm run sync:yadea          # catalog sản phẩm → data/yadea-products.json
npm run sync:yadea-home     # trang chủ → data/yadea-home.json
npm run sync:configurator   # sidebar + màu + specs từng /san-pham/...
npm run sync:media          # tải & nén WebP → public/media (nhanh hơn khi xem web)
npm run sync:all            # chạy cả 4 bước trên
```

**Tốc độ tải:** ảnh listing ~480px WebP qua `/api/proxy-image` hoặc file `/media/…` sau `sync:media`. Trang store dùng ISR (`revalidate` 1h).

## Routes

| Route | Mô tả |
|-------|--------|
| `/` | Trang chủ |
| `/san-pham` | Danh sách sản phẩm |
| `/san-pham/[slug]` | Cấu hình sản phẩm (gallery, màu, phiên bản, đặt mua) |
| `/dat-hang` | Form đặt mua / tư vấn |
| `/admin` | **Quản trị** — header, footer, giá, thứ tự nhóm, quét Yadea |

### Admin

1. Tạo secret admin (không lưu mật khẩu thuần trong `.env`):
   ```bash
   npm run admin:hash-password -- "MatKhauAdmin-ManH-2026!"
   ```
   Copy `ADMIN_PASSWORD_HASH` và `ADMIN_SESSION_SECRET` vào `.env`.
2. Mở `http://localhost:3002/admin`
3. Tab **Quét Yadea** — cập nhật giá, ảnh, sản phẩm mới & trang chủ tự động
4. Các tab khác — chỉnh logo, menu, footer, giá, phân loại, thứ tự hiển thị

Cấu hình site lưu tại `data/site-settings.json`.

## Cấu trúc thư mục

- `src/components/yadea/` — UI components
- `src/lib/` — catalog, configurator, API helpers
- `data/` — JSON đã scrape (commit cùng repo)
- `scripts/` — sync từ yadea.com.vn
- `supabase/purchase_orders.sql` — schema bảng đơn hàng

## Biến môi trường

Xem `.env.example` — `SUPABASE_*`, `TELEGRAM_*`, `NEXT_PUBLIC_SITE_URL`.
