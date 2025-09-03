// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Kanit, Noto_Sans_Thai } from "next/font/google";

const kanit = Kanit({ subsets: ["latin", "thai"], weight: ["600", "700"] });
const noto = Noto_Sans_Thai({ subsets: ["thai"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "GadeGlao — เล็บเสริมดวง",
  description: "แอปทาเล็บเสริมดวงแบบสนุก สดใส เป็นมิตร",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${noto.className} bg-gradient-to-br from-[#F8FAFF] to-[#FFF7FB] text-[#3a2e39]`}>
        <header className="w-full py-5 flex items-center justify-center">
          <div className={`text-xl font-bold bg-gradient-to-r from-[#FF8FB1] to-[#B79EE8] text-transparent bg-clip-text ${kanit.className}`}>
            GadeGlao • เล็บเสริมดวง
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-5">{children}</main>
      </body>
    </html>
  );
}