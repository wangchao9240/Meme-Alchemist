import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",

  // Cloudflare Pages doesn't support Image Optimization
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787",
  },

  // PWA support (add later with next-pwa)
  reactStrictMode: true,

  // Optimize bundle
  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
}

export default nextConfig
