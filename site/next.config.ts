import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: true,
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  ...(isGitHubPages
    ? { basePath: "/ChainLyrics", assetPrefix: "/ChainLyrics/" }
    : {}),
};

export default nextConfig;




