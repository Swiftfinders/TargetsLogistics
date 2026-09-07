import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "#1c1b46",
            border: "5px solid #f5a623",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", width: 46, height: 13, borderRadius: 4, background: "#f5a623" }} />
          <div style={{ position: "absolute", width: 13, height: 46, borderRadius: 4, background: "#6a54e6" }} />
        </div>
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: "#5c6088", marginTop: 36 }}>
          {siteConfig.cities.join(" · ")}
        </div>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 800, marginTop: 20, lineHeight: 1.1, maxWidth: 950, color: "#191a3d" }}>
          {siteConfig.tagline}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 28 }}>
          <div style={{ display: "flex", fontSize: 32, color: "#5b46d9", fontWeight: 700 }}>{siteConfig.name}</div>
          <div style={{ display: "flex", fontSize: 22, color: "#5c6088", fontWeight: 500 }}>{siteConfig.slogan}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
