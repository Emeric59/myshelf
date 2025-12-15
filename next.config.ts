import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Désactiver l'optimisation d'images (non supportée sur Cloudflare Pages)
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
        pathname: "/b/**",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
};

export default nextConfig;
