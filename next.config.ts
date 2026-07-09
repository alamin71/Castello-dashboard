import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "http", hostname: "16.16.81.100", port: "5000" },
      { protocol: "https", hostname: "castello-restaurants.s3.eu-north-1.amazonaws.com" },
    ],
  },
};

export default nextConfig;
