import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.yadea.com.vn",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
