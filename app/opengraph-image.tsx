import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Cuarzo — Desarrollo Web & Diseño de Marca";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#050d1a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Central ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.13) 0%, transparent 65%)",
          }}
        />
        {/* Top-left secondary glow */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "-120px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)",
          }}
        />

        {/* Crystal prism mark */}
        <svg
          width="68"
          height="91"
          viewBox="0 0 18 24"
          fill="none"
          stroke="#60a5fa"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ marginBottom: "30px" }}
        >
          <path
            d="M9,1 L17,7 L17,23 L1,23 L1,7 Z"
            strokeWidth="1.5"
            fill="#1e3a6e"
            fillOpacity="0.35"
          />
          <line x1="1" y1="7" x2="17" y2="7" strokeWidth="1" />
          <line x1="9" y1="1" x2="5" y2="7" strokeWidth="0.75" />
          <line x1="9" y1="1" x2="13" y2="7" strokeWidth="0.75" />
          <line x1="1" y1="13" x2="17" y2="13" strokeWidth="0.5" opacity="0.5" />
          <line x1="1" y1="18" x2="17" y2="18" strokeWidth="0.5" opacity="0.5" />
        </svg>

        {/* Brand name */}
        <div
          style={{
            color: "#ffffff",
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: "-3px",
            lineHeight: 1,
          }}
        >
          Cuarzo
        </div>

        {/* Gradient divider */}
        <div
          style={{
            width: "200px",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.55), transparent)",
            margin: "26px 0",
          }}
        />

        {/* Tagline */}
        <div
          style={{
            color: "#93c5fd",
            fontSize: 24,
            letterSpacing: "4px",
            fontWeight: 500,
          }}
        >
          DESARROLLO WEB · DISEÑO DE MARCA
        </div>
        <div
          style={{
            color: "#2d4263",
            fontSize: 17,
            marginTop: 12,
            letterSpacing: "1.5px",
          }}
        >
          Pablo Cavillon · Argentina
        </div>
      </div>
    ),
    { ...size }
  );
}
