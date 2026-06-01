import { loadHome } from "@/lib/yadea-home";
import { YadeaHeader } from "@/components/yadea/YadeaHeader";
import { YadeaFooter } from "@/components/yadea/YadeaFooter";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const home = loadHome();

  return (
    <>
      <YadeaHeader topBar={home.topBar} />
      <main className="yadea-page-enter min-h-[60vh]">{children}</main>
      <YadeaFooter />
    </>
  );
}
