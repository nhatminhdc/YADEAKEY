import { Instagram } from "lucide-react";
import type { YadeaHome } from "@/lib/yadea-home";
import { ProxiedImage } from "./ProxiedImage";

export function InstagramGallery({ images }: { images: YadeaHome["instagram"] }) {
  if (!images.length) return null;

  return (
    <section className="bg-[#f5f5f5] py-14 md:py-16">
      <div className="container-main">
        <div className="mb-8 flex flex-col items-center gap-2 text-center md:mb-10">
          <div className="flex items-center gap-2 text-gray-900">
            <Instagram className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-bold uppercase tracking-[0.2em] md:text-xl">
              Yadea Vietnam
            </h2>
          </div>
          <a
            href="https://www.instagram.com/yadeavietnam/"
            target="_blank"
            rel="noopener noreferrer"
            className="yadea-link text-sm font-medium text-gray-600"
          >
            @yadeavietnam
          </a>
        </div>
        <div className="grid grid-cols-3 gap-1 md:grid-cols-6 md:gap-2">
          {images.map((src, i) => (
            <a
              key={i}
              href="https://www.instagram.com/yadeavietnam/"
              target="_blank"
              rel="noopener noreferrer"
              className="yadea-instagram-tile relative aspect-square bg-gray-200"
            >
              <ProxiedImage
                src={src}
                alt={`Instagram YADEA ${i + 1}`}
                fill
                preset="card"
                className="object-cover"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
