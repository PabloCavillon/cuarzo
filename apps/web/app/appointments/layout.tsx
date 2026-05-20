import type { Metadata } from "next";
import TurneraLayoutClient from "./TurneraLayoutClient";

export const metadata: Metadata = {
  title: "Turnera | CUARZO",
  description: "Reservá tu turno online con CUARZO — rápido, simple y sin esperas.",
};

export default function TurneraLayout({ children }: { children: React.ReactNode }) {
  return <TurneraLayoutClient>{children}</TurneraLayoutClient>;
}
