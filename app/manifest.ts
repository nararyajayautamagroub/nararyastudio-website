import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NARARYA STUDIO",
    short_name: "Nararya Studio",
    description: "Digital Creative Studio, Digital Product Store & Custom Request.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6d28d9",
    lang: "id",
    dir: "ltr"
  };
}
