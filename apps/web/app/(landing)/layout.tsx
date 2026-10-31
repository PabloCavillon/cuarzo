import { Hanken_Grotesk, Jost } from "next/font/google";
import "./glass.css";

const body = Hanken_Grotesk({
  variable: "--font-landing",
  subsets: ["latin"],
  display: "swap",
});

const display = Jost({
  variable: "--font-landing-display",
  subsets: ["latin"],
  display: "swap",
});

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <div className={`landing flex-1 ${body.variable} ${display.variable}`}>{children}</div>;
}
