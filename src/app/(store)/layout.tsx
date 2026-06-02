import { loadHome } from "@/lib/yadea-home";
import { loadSiteSettings } from "@/lib/site-settings";
import { YadeaHeader } from "@/components/yadea/YadeaHeader";
import { YadeaFooter } from "@/components/yadea/YadeaFooter";

export const revalidate = 3600;

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const home = loadHome();
  const settings = loadSiteSettings();

  return (
    <>
      <YadeaHeader topBar={home.topBar} settings={settings} />
      <main className="yadea-page-enter min-h-[60vh]">{children}</main>
      <YadeaFooter settings={settings} />
    </>
  );
}
