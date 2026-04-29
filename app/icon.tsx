import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#050d1a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Crystal prism — bold stroke for legibility at 16×16 */}
        <svg
          width="16"
          height="22"
          viewBox="0 0 18 24"
          fill="none"
          stroke="#60a5fa"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path d="M9,1 L17,7 L17,23 L1,23 L1,7 Z" strokeWidth="2" />
          <line x1="1" y1="7" x2="17" y2="7" strokeWidth="1.5" />
          <line x1="9" y1="1" x2="5" y2="7" strokeWidth="1" />
          <line x1="9" y1="1" x2="13" y2="7" strokeWidth="1" />
          <line x1="1" y1="13" x2="17" y2="13" strokeWidth="0.5" opacity="0.6" />
          <line x1="1" y1="18" x2="17" y2="18" strokeWidth="0.5" opacity="0.6" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
