

import type { NextConfig } from "next";

const backendBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.REMOTE_API_BASE_URL ||
  "http://localhost:8080";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // backend upload image serve support
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
    ],
  },

  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: "http://localhost:8080/api/:path*",
  //     },
  //     {
  //       source: "/uploads/:path*",
  //       destination: "http://localhost:8080/uploads/:path*",
  //     },
  //   ];
  // },


    async rewrites() {
    return [
      // ✅ Backend API ကို /backend နဲ့သီးသန့်ထား
      { source: "/backend/:path*", destination: `${backendBase}/:path*` },

      // ✅ serve uploaded images from Spring Boot
      { source: "/uploads/:path*", destination: `${backendBase}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
