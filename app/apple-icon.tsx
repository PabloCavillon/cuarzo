import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(160deg, #070e1f 0%, #050d1a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "40px",
          position: "relative",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            width: "130px",
            height: "130px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)",
          }}
        />
        {/* Crystal prism */}
        <svg
          width="80"
          height="107"
          viewBox="0 0 18 24"
          fill="none"
          stroke="#60a5fa"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path
            d="M9,1 L17,7 L17,23 L1,23 L1,7 Z"
            strokeWidth="1.5"
            fill="rgba(37,99,235,0.1)"
            fillOpacity="1"
          />
          <line x1="1" y1="7" x2="17" y2="7" strokeWidth="1" />
          <line x1="9" y1="1" x2="5" y2="7" strokeWidth="0.75" />
          <line x1="9" y1="1" x2="13" y2="7" strokeWidth="0.75" />
          <line x1="1" y1="13" x2="17" y2="13" strokeWidth="0.4" opacity="0.55" />
          <line x1="1" y1="18" x2="17" y2="18" strokeWidth="0.4" opacity="0.55" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
