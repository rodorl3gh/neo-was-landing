import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wasito · Neo Was",
    short_name: "Wasito",
    description: "Panel de operación de Neo Was: metas, clientes, calendario y notificaciones.",
    start_url: "/panel",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0c",
    theme_color: "#0a0a0c",
    lang: "es-MX",
    icons: [
      { src: "/logo-mark.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo-mark.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/logo-mark.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
