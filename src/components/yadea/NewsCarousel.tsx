"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { YadeaHome } from "@/lib/yadea-home";
import { ProxiedImage } from "./ProxiedImage";

export function NewsCarousel({ news }: { news: YadeaHome["news"] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  if (!news.length) return null;

  return (
    <section id="tin-tuc" className="scroll-mt-24 bg-white py-14 md:py-20">
      <div className="container-main">
        <h2 className="section-title mb-10 md:mb-12">Tin tức &amp; sự kiện</h2>
        <div className="relative">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="yadea-carousel-btn absolute -left-1 top-[42%] z-10 -translate-y-1/2 md:-left-6"
            aria-label="Trước"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            ref={ref}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {news.map((item, i) => (
              <Link
                key={i}
                href="/dat-hang"
                className="yadea-news-card w-[300px] shrink-0 md:w-[320px]"
              >
                <div className="relative aspect-[16/10] bg-gray-100">
                  {item.imageUrl ? (
                    <ProxiedImage
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      YADEA
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-brand">
                    {item.category}
                  </span>
                  {item.date && (
                    <p className="mt-1 text-xs text-gray-500">{item.date}</p>
                  )}
                  <h3 className="mt-3 line-clamp-3 text-sm font-bold leading-snug text-gray-900">
                    {item.title}
                  </h3>
                  <span className="mt-4 inline-block text-xs font-semibold text-brand">
                    Xem thêm →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll(1)}
            className="yadea-carousel-btn absolute -right-1 top-[42%] z-10 -translate-y-1/2 md:-right-6"
            aria-label="Sau"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
