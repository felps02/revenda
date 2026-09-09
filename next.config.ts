import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Fontes das fotos de demonstracao. Ao conectar um CMS/API proprio,
    // basta adicionar aqui o dominio do bucket de imagens da revenda.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
  },
  poweredByHeader: false,
};

export default nextConfig;
