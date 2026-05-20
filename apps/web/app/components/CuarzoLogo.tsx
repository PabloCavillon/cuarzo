export function CuarzoIsotype({
  height = 80,
  className,
}: {
  height?: number;
  className?: string;
}) {
  const width = height * (48 / 114);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 114"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left outer face */}
      <polygon points="24,2 2,30 7,104 24,110" fill="#0A1C3A" />
      {/* Left-center upper triangle */}
      <polygon points="24,2 2,30 24,24" fill="#1A3A6E" />
      {/* Right-center upper triangle */}
      <polygon points="24,2 46,30 24,24" fill="#2255A8" />
      {/* Right outer face */}
      <polygon points="24,2 46,30 41,104 24,110" fill="#112040" />
      {/* Inner upper-left quad */}
      <polygon points="2,30 24,24 24,68 7,74" fill="#0D2448" />
      {/* Inner upper-right quad */}
      <polygon points="46,30 24,24 24,68 41,74" fill="#1A4A90" />
      {/* Lower left quad */}
      <polygon points="7,74 24,68 24,104 7,104" fill="#091C38" />
      {/* Lower right quad */}
      <polygon points="41,74 24,68 24,104 41,104" fill="#142E5A" />
      {/* Top highlight facet */}
      <polygon points="24,2 16,18 24,24 32,18" fill="#4B7FDB" />
      {/* Base shadow */}
      <polygon points="7,104 41,104 38,110 10,110" fill="#040A14" />
    </svg>
  );
}
