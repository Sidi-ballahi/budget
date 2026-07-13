import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  /* config options here */
};

// Serwist's Next plugin injects a webpack() config function, which conflicts
// with Turbopack dev (`next dev` defaults to Turbopack in Next 16 and treats
// any webpack key as a misconfiguration). Only wrap the config for
// production builds, which run via `next build --webpack` (see package.json).
const isDev = process.env.NODE_ENV === "development";

export default isDev
  ? nextConfig
  : withSerwistInit({ swSrc: "src/app/sw.ts", swDest: "public/sw.js" })(nextConfig);
