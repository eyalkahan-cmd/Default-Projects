import React from "react";

/** A generic white power bank with charge LEDs and a USB-A port on the short edge. viewBox 0 0 200 360. */
export const PowerBank: React.FC<{ width: number; leds?: number; style?: React.CSSProperties }> = ({
  width,
  leds = 4,
  style,
}) => {
  const h = (width * 360) / 200;
  return (
    <svg width={width} height={h} viewBox="0 0 200 360" style={{ overflow: "visible", ...style }}>
      <defs>
        <linearGradient id="pbBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E9EDF2" />
          <stop offset="0.5" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#D5DBE3" />
        </linearGradient>
      </defs>
      <rect x={6} y={14} width={188} height={340} rx={30} fill="#B9C1CC" />
      <rect x={6} y={6} width={188} height={340} rx={30} fill="url(#pbBody)" />
      <rect x={78} y={0} width={44} height={16} rx={3} fill="#2A2A2A" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={64 + i * 24} cy={300} r={6} fill={i < leds ? "#1099EA" : "#C5CCD6"} />
      ))}
    </svg>
  );
};
