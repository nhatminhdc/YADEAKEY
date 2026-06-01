"use client";

import Link from "next/link";
import { Facebook, Youtube, Instagram } from "lucide-react";
import { ProxiedImage } from "./ProxiedImage";
import type { SiteSettings } from "@/lib/site-settings";

export function YadeaFooter({ settings }: { settings: SiteSettings }) {
  const f = settings.footer;

  return (
    <footer className="bg-[#1a1a1a] text-gray-400">
      <div className="container-main grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-2">
          <div className="relative mb-6 h-10 w-32">
            <ProxiedImage
              src={f.logoUrl}
              alt="YADEA"
              fill
              className="object-contain object-left"
            />
          </div>
          <p className="text-sm font-semibold uppercase text-white">{f.companyName}</p>
          <p className="mt-3 text-sm leading-relaxed">
            {f.addressLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < f.addressLines.length - 1 && <br />}
              </span>
            ))}
          </p>
          <p className="mt-3 text-sm">
            HOTLINE:{" "}
            <a href={`tel:${f.hotline}`} className="yadea-link-light">
              {f.hotline}
            </a>
          </p>
          <p className="text-sm">
            CSKH:{" "}
            <a href={`tel:${f.cskh}`} className="yadea-link-light">
              {f.cskh}
            </a>
          </p>
          <p className="text-sm">
            Email:{" "}
            <a href={`mailto:${f.email}`} className="yadea-link-light">
              {f.email}
            </a>
          </p>
        </div>

        {f.columns.map((col) => (
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
              href={f.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="yadea-social-icon"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href={f.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="yadea-social-icon"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href={f.social.instagram}
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
            <button type="submit" className="yadea-btn-brand">
              Gửi
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container-main flex flex-col items-center justify-between gap-3 py-6 text-[11px] text-gray-500 sm:flex-row">
          <p>{f.copyright}</p>
          <div className="flex gap-4">
            {f.bottomLinks.map((link) => (
              <Link key={link.href} href={link.href} className="yadea-link">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
