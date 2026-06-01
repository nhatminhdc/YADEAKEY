"use client";

import Link from "next/link";
import { Facebook, Youtube, Instagram } from "lucide-react";
import { ProxiedImage } from "./ProxiedImage";

const WHITE_LOGO =
  "https://www.yadea.com.vn/wp-content/uploads/2023/09/white-logo.svg";

const FOOTER_COLS = [
  {
    title: "Sản phẩm",
    links: [
      { label: "Xe máy điện", href: "/san-pham?loai=xe-may-dien" },
      { label: "Xe gắn máy điện", href: "/san-pham?loai=xe-gan-may-dien" },
      { label: "Sản phẩm mới", href: "/san-pham" },
    ],
  },
  {
    title: "Dịch vụ",
    links: [
      { label: "Đặt mua / Tư vấn", href: "/dat-hang" },
      { label: "Hỗ trợ & Bảo hành", href: "/dat-hang" },
      { label: "Liên hệ", href: "/dat-hang" },
    ],
  },
  {
    title: "Về YADEA",
    links: [
      { label: "Sản phẩm", href: "/san-pham" },
      { label: "Tin tức", href: "/#tin-tuc" },
      { label: "Đăng ký nhận tin", href: "/dat-hang" },
    ],
  },
];

export function YadeaFooter() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-400">
      <div className="container-main grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-2">
          <div className="relative mb-6 h-10 w-32">
            <ProxiedImage
              src={WHITE_LOGO}
              alt="YADEA"
              fill
              className="object-contain object-left"
            />
          </div>
          <p className="text-sm font-semibold uppercase text-white">
            Công ty TNHH Khoa học Kỹ thuật YADEA (Việt Nam)
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            Lô CN-02, Khu công nghiệp Tân Hưng,
            <br />
            Xã Lạng Giang, Tỉnh Bắc Ninh, Việt Nam
          </p>
          <p className="mt-3 text-sm">
            HOTLINE:{" "}
            <a href="tel:02043886699" className="yadea-link-light">
              0204 3886699
            </a>
          </p>
          <p className="text-sm">
            CSKH:{" "}
            <a href="tel:1900636803" className="yadea-link-light">
              1900636803
            </a>
          </p>
          <p className="text-sm">
            Email:{" "}
            <a href="mailto:market@yadea.com.vn" className="yadea-link-light">
              market@yadea.com.vn
            </a>
          </p>
        </div>

        {FOOTER_COLS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-white">
              {col.title}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="yadea-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-white">
            Theo dõi YADEA
          </h3>
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/yadeabrand/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="yadea-social-icon"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://www.youtube.com/channel/UCwNqzgb1QFon3ZP2jbI71Tg"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="yadea-social-icon"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/yadeavietnam/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="yadea-social-icon"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
          <p className="mt-6 mb-2 text-xs font-bold uppercase tracking-wide text-white">
            Đăng ký nhận tin
          </p>
          <form className="flex gap-0" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Email của bạn"
              className="min-w-0 flex-1 border-0 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <button
              type="submit"
              className="yadea-btn-brand"
            >
              Gửi
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container-main flex flex-col items-center justify-between gap-3 py-6 text-[11px] text-gray-500 sm:flex-row">
          <p>© 2026 – Bản quyền thuộc về Công ty TNHH khoa học kỹ thuật Yadea (Việt Nam)</p>
          <div className="flex gap-4">
            <Link href="/dat-hang" className="yadea-link">
              Liên hệ / Đặt mua
            </Link>
            <Link href="/san-pham" className="yadea-link">
              Sản phẩm
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
