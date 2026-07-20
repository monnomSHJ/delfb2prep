import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DELF B2 · Atelier",
    short_name: "Atelier B2",
    description: "DELF B2 준비를 위한 쓰기 연습과 복습 노트",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f6f5f9",
    theme_color: "#6935b8",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
