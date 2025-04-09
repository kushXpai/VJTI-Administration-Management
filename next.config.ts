import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['xiezrkzofkyoaehocuff.supabase.co'],
    // If you have other image domains, add them here as well
  },
};

export default nextConfig;
