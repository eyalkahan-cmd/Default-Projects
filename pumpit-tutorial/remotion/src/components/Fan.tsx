import React from "react";
import { C } from "../theme";

/**
 * The real costume blower (see data/fan_hardware_spec.md): an orange centrifugal
 * "snail-shell" housing with a scalloped rim, a round intake with a radial spoke
 * grille, a slotted rectangular outlet and a black USB cable.
 * Front view, viewBox 0 0 400 400.
 */
export const Fan: React.FC<{
  size: number;
  /** Impeller rotation behind the grille, in degrees. */
  spin?: number;
  cable?: boolean;
  /** Show the plastic body (false = intake grille only, as seen from outside a costume). */
  body?: boolean;
  style?: React.CSSProperties;
}> = ({ size, spin = 0, cable = true, body = true, style }) => {
  const cx = 210;
  const cy = 205;
  const spokes = 16;
  const bumps = 18;
  return (
    <svg width={size} height={size} viewBox="0 0 400 400" style={{ overflow: "visible", ...style }}>
      <defs>
        <radialGradient id="fanBody" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor={C.fanLight} />
          <stop offset="0.55" stopColor={C.fan} />
          <stop offset="1" stopColor={C.fanDeep} />
        </radialGradient>
        <radialGradient id="fanIntake" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#7A2604" />
          <stop offset="1" stopColor="#3A1202" />
        </radialGradient>
      </defs>
      {cable && body ? (
        <path
          d={`M ${cx + 40} ${cy + 150} C ${cx + 60} 420, ${cx + 160} 410, 420 380`}
          stroke="#111"
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
        />
      ) : null}
      {body ? (
        <g>
          {/* outlet nozzle (left, bottom tangent) */}
          <rect x={20} y={cy + 40} width={150} height={100} rx={14} fill={C.fanShade} />
          <rect x={20} y={cy + 40} width={40} height={100} rx={10} fill={C.fanDeep} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={30} y={cy + 56 + i * 20} width={22} height={8} rx={4} fill="#7A2604" opacity={0.8} />
          ))}
          {/* scalloped rim */}
          {new Array(bumps).fill(0).map((_, i) => {
            const a = (i / bumps) * Math.PI * 2;
            return (
              <circle key={i} cx={cx + Math.cos(a) * 158} cy={cy + Math.sin(a) * 158} r={16} fill={C.fanShade} />
            );
          })}
          <circle cx={cx} cy={cy} r={158} fill="url(#fanBody)" />
          {/* mounting tabs + screws */}
          <circle cx={cx + 120} cy={cy + 112} r={7} fill={C.fanDeep} />
          <circle cx={cx - 70} cy={cy - 138} r={7} fill={C.fanDeep} />
        </g>
      ) : null}
      {/* intake */}
      <circle cx={cx} cy={cy} r={112} fill={body ? C.fanShade : C.fan} />
      <circle cx={cx} cy={cy} r={100} fill="url(#fanIntake)" />
      {/* impeller blades behind the grille */}
      <g transform={`rotate(${spin} ${cx} ${cy})`}>
        {new Array(12).fill(0).map((_, i) => (
          <path
            key={i}
            transform={`rotate(${(i * 360) / 12} ${cx} ${cy})`}
            d={`M ${cx} ${cy - 24} Q ${cx + 30} ${cy - 60} ${cx + 18} ${cy - 96}`}
            stroke="#B9480D"
            strokeWidth={9}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </g>
      {/* radial spoke grille */}
      {new Array(spokes).fill(0).map((_, i) => {
        const a = (i / spokes) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * 26}
            y1={cy + Math.sin(a) * 26}
            x2={cx + Math.cos(a) * 101}
            y2={cy + Math.sin(a) * 101}
            stroke={C.fan}
            strokeWidth={7}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={62} fill="none" stroke={C.fan} strokeWidth={6} />
      <circle cx={cx} cy={cy} r={101} fill="none" stroke={C.fan} strokeWidth={8} />
      <circle cx={cx} cy={cy} r={26} fill={C.fan} />
      <circle cx={cx - 6} cy={cy - 6} r={9} fill={C.fanLight} opacity={0.8} />
    </svg>
  );
};
