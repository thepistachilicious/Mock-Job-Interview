import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent server from even attempting to resolve it
      config.resolve.alias = {
        ...config.resolve.alias,
        "pdfjs-dist": false,
      };
    } else {
      // Tell webpack NOT to parse pdfjs internals — prevents the defineProperty crash
      config.module.noParse = [
        ...(Array.isArray(config.module.noParse) ? config.module.noParse : []),
        /pdfjs-dist/,
      ];
    }
    return config;
  },
  reactStrictMode: false, // test only
};

export default nextConfig;