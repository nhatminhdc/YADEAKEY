import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "@/styles/globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Yadea Vietnam",
    template: "%s | Yadea Vietnam",
  },
  description:
    "Xe máy điện Yadea chính hãng — trải nghiệm lái thông minh, tiết kiệm và thân thiện môi trường.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002",
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={montserrat.variable}>
      <body className="min-h-screen bg-yadea-bg font-sans text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
