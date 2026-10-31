import type { ReactNode } from "react";
import { ModuleGate } from "../components/ModuleGate";

export default function Layout({ children }: { children: ReactNode }) {
  return <ModuleGate module="catalog">{children}</ModuleGate>;
}
