import { Sora } from "next/font/google";
import PageLang from "./PageLang";
import "./cv.css";

const display = Sora({
  variable: "--font-cv",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export default function CVLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="es" className={`cv ${display.variable}`}>
      <PageLang />
      {children}
    </div>
  );
}
