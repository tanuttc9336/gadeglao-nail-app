// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "เกศเกล้า บึงสามพัน — เล็บเสริมดวง · เมนูราคา · จองคิว",
  description: "แอปทาเล็บเสริมดวงแบบสนุก สดใส เป็นมิตร",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@600;700&family=Noto+Sans+Thai:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-gradient-to-br from-[#F8FAFF] to-[#FFF7FB] text-[#3a2e39]"
        style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}
      >
        <header className="w-full py-5 flex flex-col items-center justify-center">
          <div
            className="text-xl font-bold bg-gradient-to-r from-[#FF8FB1] to-[#B79EE8] text-transparent bg-clip-text"
            style={{ fontFamily: "'Kanit', sans-serif" }}
          >
            เกศเกล้า บึงสามพัน
          </div>
          <div className="text-[11px] opacity-60 mt-0.5">🔮 เล็บเสริมดวง · 📖 เมนูราคา · 💬 จองคิว</div>
        </header>
        <main className="max-w-5xl mx-auto px-5">{children}</main>
      </body>
    </html>
  );
}
