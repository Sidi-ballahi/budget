import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dépenses — Suivi de dépenses personnelles",
    short_name: "Dépenses",
    description: "Suivi de dépenses personnelles, budgets et insights, hors-ligne.",
    start_url: "/",
    display: "standalone",
    background_color: "#1c1a16",
    theme_color: "#1c1a16",
    lang: "fr",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
