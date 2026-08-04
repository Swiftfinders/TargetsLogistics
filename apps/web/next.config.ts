import type { NextConfig } from "next";

const API_BACKEND =
  process.env.API_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@targets/shared"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_BACKEND}/:path*`,
      },
    ];
  },
};

export default nextConfig;
