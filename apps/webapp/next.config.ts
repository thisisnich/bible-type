import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disabling Next.js' built-in ESLint integration as we're using Biome
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
