import { JetBrains_Mono, Manrope, Work_Sans } from "next/font/google";

export const fontDisplay = Manrope({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--tl-font-display-family",
  display: "swap",
});

export const fontBody = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--tl-font-body-family",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--tl-font-mono-family",
  display: "swap",
});
