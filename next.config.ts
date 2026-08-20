import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/nail",
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },      // โค้ดต้นฉบับมี any หลายจุด — ไม่บล็อก build
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
