"use client";

import dynamic from "next/dynamic";
import CrystalSvg from "./CrystalSvg";

function canRun3D() {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (memory !== undefined && memory <= 2) return false;
  if (navigator.hardwareConcurrency <= 2) return false;
  return Boolean(document.createElement("canvas").getContext("webgl2"));
}

// Three.js bundle loads lazily after the page text is painted.
// The SVG crystal holds the place, and stays on phones that can't run the 3D one.
const Crystal = dynamic(
  () => canRun3D()
    ? import("./CrystalScene").catch(() => ({ default: CrystalSvg }))
    : Promise.resolve({ default: CrystalSvg }),
  { ssr: false, loading: () => <CrystalSvg /> }
);

export default Crystal;
