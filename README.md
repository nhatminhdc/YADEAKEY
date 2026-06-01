# YADEAKEY — Showroom YADEA Việt Nam

Website showroom clone layout [yadea.com.vn](https://www.yadea.com.vn/): trang chủ, danh sách sản phẩm, trang cấu hình từng xe, form đặt mua (Supabase + Telegram).

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS v4

## Chạy dự án

```bash
npm install
cp .env.example .env   # điền Supabase + Telegram (tùy chọn cho form đặt mua)
npm run dev:clean      # http://localhost:3002
```

## Đồng bộ dữ liệu từ yadea.com.vn

```bash
npm run sync:yadea          # catalog sản phẩm → data/yadea-products.json
npm run sync:yadea-home     # trang chủ → data/yadea-home.json
npm run sync:configurator   # sidebar + màu + specs từng /san-pham/...
```

## Routes

| Route | Mô tả |
|-------|--------|
| `/` | Trang chủ |
| `/san-pham` | Danh sách sản phẩm |
| `/san-pham/[slug]` | Cấu hình sản phẩm (gallery, màu, phiên bản, đặt mua) |
| `/dat-hang` | Form đặt mua / tư vấn |

## Cấu trúc thư mục

- `src/components/yadea/` — UI components
- `src/lib/` — catalog, configurator, API helpers
- `data/` — JSON đã scrape (commit cùng repo)
- `scripts/` — sync từ yadea.com.vn
- `supabase/purchase_orders.sql` — schema bảng đơn hàng

## Biến môi trường

Xem `.env.example` — `SUPABASE_*`, `TELEGRAM_*`, `NEXT_PUBLIC_SITE_URL`.
