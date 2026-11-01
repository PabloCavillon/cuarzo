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
      stroke="#38bdf8"
      strokeWidth={3}
      strokeLinejoin="bevel"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M24 2 46 30 41 104 24 112 7 104 2 30Z" />
      <path d="M2 30 24 24 46 30M24 2V112M7 74 24 68 41 74" />
    </svg>
  );
}
