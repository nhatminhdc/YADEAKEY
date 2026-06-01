import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | YADEA",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-gray-900">
      {children}
    </div>
  );
}
