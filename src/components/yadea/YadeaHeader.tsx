"use client";

import Link from "next/link";
import { Search, MapPin, Phone, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ProxiedImage } from "./ProxiedImage";
import type { YadeaHome } from "@/lib/yadea-home";
import { opensInNewTab, resolveSiteHref } from "@/lib/site-links";

const LOGO =
  "https://www.yadea.com.vn/wp-content/uploads/2023/09/logo-yadea.svg";

const MAIN_NAV = [
  { label: "Sản phẩm", href: "/san-pham" },
  { label: "Đặt mua / Tư vấn", href: "/dat-hang" },
  { label: "Tin tức", href: "/#tin-tuc" },
];

export function YadeaHeader({ topBar }: { topBar: YadeaHome["topBar"] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar đen */}
      <div className="hidden bg-[#0a0a0a] text-[11px] text-gray-300 md:block">
        <div className="container-main flex h-9 items-center justify-between">
          <div className="flex items-center gap-6">
            {topBar.map((item) => {
              const href = resolveSiteHref(item.href);
              const external = opensInNewTab(href);
              return external ? (
                <a
                  key={item.href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="yadea-top-link"
                >
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} href={href} className="yadea-top-link">
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:1900636803" className="yadea-top-link flex items-center gap-1">
              <Phone className="h-3 w-3" />
              1900 636 803
            </a>
            <span className="text-gray-600">|</span>
            <button type="button" className="font-semibold text-white">
              VN
            </button>
            <button type="button" className="yadea-top-link">
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Nav trắng */}
      <div
        className={`border-b border-gray-100 bg-white transition-shadow duration-300 ${
          scrolled ? "yadea-header-scrolled" : "shadow-sm"
        }`}
      >
        <div className="container-main flex h-[72px] items-center justify-between gap-6">
          <Link href="/" className="relative h-9 w-[120px] shrink-0 lg:w-[140px]">
            <ProxiedImage
              src={LOGO}
              alt="YADEA"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-10 lg:flex">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="yadea-nav-link"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button type="button" aria-label="Tìm kiếm" className="yadea-icon-btn">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link
              href="/dat-hang"
              aria-label="Đặt mua"
              className="yadea-icon-btn hidden sm:flex"
            >
              <MapPin className="h-[18px] w-[18px]" />
            </Link>
            <Link
              href="/dat-hang"
              aria-label="Liên hệ"
              className="yadea-icon-btn hidden md:flex"
            >
              <Phone className="h-[18px] w-[18px]" />
            </Link>
            <button
              type="button"
              className="yadea-icon-btn lg:hidden"
              aria-label="Menu"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav className="border-b bg-white px-4 py-4 lg:hidden">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="yadea-nav-link block py-3 after:hidden"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
