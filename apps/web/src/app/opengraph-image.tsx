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
            borderRadius: 24,
            background: "#3552ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              border: "6px solid #ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#ff6b45" }} />
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: "#666b80", marginTop: 36 }}>
          {siteConfig.cities.join(" · ")}
        </div>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 800, marginTop: 20, lineHeight: 1.1, maxWidth: 950, color: "#14161f" }}>
          {siteConfig.tagline}
        </div>
        <div style={{ display: "flex", fontSize: 32, marginTop: 28, color: "#3552ff", fontWeight: 700 }}>{siteConfig.name}</div>
      </div>
    ),
    { ...size },
  );
}
