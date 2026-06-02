"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { YadeaHome } from "@/lib/yadea-home";
import { resolveSiteHref } from "@/lib/site-links";
import { ProxiedImage } from "./ProxiedImage";

export function HeroBanner({ hero }: { hero: YadeaHome["hero"] }) {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const slides = hero.slides.length ? hero.slides : [];

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const next = useCallback(() => {
    if (slides.length < 2) return;
    setIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [slides.length, next]);

  const slide = slides[index] ?? slides[0];
  const href = resolveSiteHref(slide?.link ?? "/san-pham/yadea-osta-2026");

  return (
    <section className="relative w-full overflow-hidden bg-neutral-900">
      <Link href={href} className="group relative block w-full">
        <div className="relative aspect-[750/946] w-full md:aspect-[2560/1120] md:max-h-[720px]">
          {slides.length > 0 ? (
            slides.map((s, i) => {
              const src =
                isMobile && s.mobile ? s.mobile : s.desktop ?? "";
              return (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                    i === index
                      ? "z-[1] opacity-100"
                      : "z-0 opacity-0"
                  }`}
                  aria-hidden={i !== index}
                >
                  {src && (
                    <ProxiedImage
                      src={src}
                      alt="YADEA"
                      fill
                      preset="hero"
                      className="yadea-img-zoom-hero object-cover"
                      priority={i === 0}
                    />
                  )}
                </div>
              );
            })
          ) : null}
          <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/50 via-black/10 to-transparent md:bg-gradient-to-r md:from-black/40 md:via-transparent md:to-transparent" />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-10 pt-16 text-center md:inset-auto md:bottom-16 md:left-16 md:max-w-md md:p-0 md:text-left">
          <p
            className="text-5xl font-normal italic leading-none text-white md:text-7xl lg:text-8xl"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {hero.title}
          </p>
          <p className="mt-2 text-lg font-light tracking-wide text-white/95 md:text-2xl">
            {hero.subtitle}
          </p>
          {hero.tagline && (
            <p className="mt-3 text-sm text-white/80 md:text-base">{hero.tagline}</p>
          )}
        </div>
      </Link>

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col gap-2 rounded-full bg-white px-2.5 py-3 shadow-md md:right-8 md:left-auto md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:translate-x-0">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              aria-current={i === index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIndex(i);
              }}
              className={
                i === index ? "yadea-hero-dot yadea-hero-dot-active" : "yadea-hero-dot yadea-hero-dot-inactive"
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
