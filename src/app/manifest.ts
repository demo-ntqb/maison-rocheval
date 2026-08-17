import { businessInfo } from "@/shared/constants/site.constant";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: businessInfo.name,
    short_name: businessInfo.name,
    start_url: "/",
    display: "standalone",
    background_color: "#16222e",
    theme_color: "#16222e",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
