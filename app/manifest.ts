import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cuarzo",
    short_name: "Cuarzo",
    description: "Desarrollo web y diseño de marca para pequeños negocios",
    start_url: "/",
    display: "standalone",
    background_color: "#050d1a",
    theme_color: "#050d1a",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
