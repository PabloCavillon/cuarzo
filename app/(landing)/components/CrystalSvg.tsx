// Same silhouette as the 3D crystal, for loading and for phones without WebGL or with little memory.
export default function CrystalSvg() {
  return (
    <div className="h-full flex items-center justify-center">
      <svg aria-hidden viewBox="0 0 200 400" className="crystal-float h-[78%]">
        <polygon points="100,6 44,116 96,132" fill="#7dd3fc" />
        <polygon points="100,6 96,132 156,112" fill="#e0f2fe" />
        <polygon points="44,116 96,132 92,322 34,296" fill="#1d4ed8" />
        <polygon points="96,132 156,112 168,292 92,322" fill="#38bdf8" />
        <polygon points="34,296 92,322 100,394" fill="#312e81" />
        <polygon points="92,322 168,292 100,394" fill="#0369a1" />
        <path d="M100 6 44 116 34 296 100 394 168 292 156 112ZM44 116 96 132 156 112M96 132 92 322M34 296 92 322 168 292M100 6 96 132M92 322 100 394" fill="none" stroke="#e0f2fe" strokeWidth="1" />
      </svg>
    </div>
  );
}
