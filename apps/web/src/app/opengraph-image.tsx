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
          background: "linear-gradient(135deg, #3552ff, #1f2e99)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", opacity: 0.8 }}>
          {siteConfig.cities.join(" · ")}
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, marginTop: 24, lineHeight: 1.1, maxWidth: 900 }}>
          {siteConfig.tagline}
        </div>
        <div style={{ fontSize: 32, marginTop: 32, opacity: 0.9 }}>{siteConfig.name}</div>
      </div>
    ),
    { ...size },
  );
}
