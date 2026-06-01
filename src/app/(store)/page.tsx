import { loadHome } from "@/lib/yadea-home";
import { HeroBanner } from "@/components/yadea/HeroBanner";
import { NewProductsBanner } from "@/components/yadea/NewProductsBanner";
import { HomeProductsSection } from "@/components/yadea/HomeProductsSection";
import { NewsCarousel } from "@/components/yadea/NewsCarousel";
import { InstagramGallery } from "@/components/yadea/InstagramGallery";

export const revalidate = 3600;

export default function HomePage() {
  const home = loadHome();

  return (
    <>
      <HeroBanner hero={home.hero} />
      <NewProductsBanner items={home.newProducts} />
      {home.xeMay && home.xeMay.length > 0 && (
        <HomeProductsSection title="XE MÁY ĐIỆN" items={home.xeMay} />
      )}
      {home.xeGan && home.xeGan.length > 0 && (
        <HomeProductsSection title="XE GẮN MÁY ĐIỆN" items={home.xeGan} />
      )}
      <NewsCarousel news={home.news} />
      <InstagramGallery images={home.instagram} />
    </>
  );
}
