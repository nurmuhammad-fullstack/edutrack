import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Wrap client-side <Link> navigations in document.startViewTransition so
  // route changes animate smoothly (tuned CSS lives in app/globals.css).
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
