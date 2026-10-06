import { ImageResponse } from "next/og";
import { LogoMark } from "@/components/logo";
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
        <LogoMark gap="#ffffff" height={88} />
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: "#56608a", marginTop: 36 }}>
          {siteConfig.cities.join(" · ")}
        </div>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 800, marginTop: 20, lineHeight: 1.1, maxWidth: 950, color: "#141b3d" }}>
          {siteConfig.tagline}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 28 }}>
          <div style={{ display: "flex", fontSize: 32, color: "#2444b5", fontWeight: 700 }}>{siteConfig.name}</div>
          <div style={{ display: "flex", fontSize: 22, color: "#56608a", fontWeight: 500 }}>{siteConfig.slogan}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
