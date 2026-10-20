import React from "react";
import { C } from "../theme";

/**
 * The orange battery pack from the product photos: ~9×7 cm box, 4 × AA in a row,
 * USB-A port on the top edge, slide switch, belt clip on the back.
 * viewBox 0 0 240 340 (box occupies y 60..340; the space above is for the USB plug).
 */
export const BatteryBox: React.FC<{
  width: number;
  /** 0 = lid closed, 1 = lid fully removed (shows the tray). */
  lidOpen?: number;
  /** Per-battery insertion progress 0..1 (4 entries). */
  cells?: number[];
  /** 0..1: the blower's USB plug descending into the top port. */
  plug?: number;
  switchOn?: boolean;
  style?: React.CSSProperties;
}> = ({ width, lidOpen = 0, cells = [1, 1, 1, 1], plug = 0, switchOn = false, style }) => {
  const h = (width * 340) / 240;
  return (
    <svg width={width} height={h} viewBox="0 0 240 340" style={{ overflow: "visible", ...style }}>
      <defs>
        <linearGradient id="bbBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.fanLight} />
          <stop offset="0.5" stopColor={C.fan} />
          <stop offset="1" stopColor={C.fanShade} />
        </linearGradient>
        <linearGradient id="aaCell" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1A1A1A" />
          <stop offset="0.45" stopColor="#3A3A3A" />
          <stop offset="1" stopColor="#111" />
        </linearGradient>
      </defs>
      {/* USB plug + cable coming from above */}
      {plug > 0 ? (
        <g transform={`translate(0 ${(1 - plug) * -90})`}>
          <path d="M 120 -200 L 120 20" stroke="#111" strokeWidth={8} />
          <rect x={104} y={10} width={32} height={34} rx={4} fill="#151515" />
          <rect x={108} y={42} width={24} height={26} fill="#C9CED6" />
        </g>
      ) : null}
      {/* body */}
      <rect x={10} y={60} width={220} height={280} rx={26} fill={C.fanDeep} />
      <rect x={10} y={56} width={220} height={276} rx={26} fill="url(#bbBody)" />
      {/* USB-A port on top edge */}
      <rect x={104} y={56} width={32} height={14} rx={2} fill="#2A2A2A" />
      {/* tray */}
      <rect x={30} y={86} width={180} height={222} rx={12} fill={C.fanDeep} />
      <rect x={34} y={90} width={172} height={214} rx={10} fill="#8A3307" />
      {[0, 1, 2, 3].map((i) => {
        const p = cells[i] ?? 0;
        const x = 42 + i * 41;
        const up = i % 2 === 0; // alternating orientation, as in a real holder
        return (
          <g key={i}>
            {/* springs and contacts */}
            <rect x={x + 8} y={up ? 92 : 290} width={20} height={8} fill="#C9CED6" />
            <g opacity={p > 0 ? 1 : 0} transform={`translate(0 ${(1 - p) * -260})`}>
              <rect x={x} y={104} width={36} height={186} rx={8} fill="url(#aaCell)" />
              <rect x={x} y={up ? 104 : 250} width={36} height={40} rx={8} fill="#C58A2B" />
              <rect x={x + 12} y={up ? 98 : 288} width={12} height={8} rx={2} fill="#D9DDE3" />
              <text
                x={x + 18}
                y={up ? 135 : 278}
                fill="#fff"
                fontSize={22}
                fontWeight={900}
                textAnchor="middle"
                fontFamily="Arial"
              >
                {up ? "+" : "−"}
              </text>
              <text
                x={x + 18}
                y={200}
                fill="#fff"
                fontSize={16}
                fontWeight={800}
                textAnchor="middle"
                fontFamily="Arial"
                transform={`rotate(-90 ${x + 18} 200)`}
              >
                AA
              </text>
            </g>
          </g>
        );
      })}
      {/* lid */}
      <g transform={`translate(${lidOpen * 260} ${lidOpen * 40}) rotate(${lidOpen * 14} 120 200)`} opacity={1 - lidOpen * 0.2}>
        <rect x={22} y={80} width={196} height={236} rx={16} fill={C.fan} />
        <rect x={22} y={80} width={196} height={236} rx={16} fill="url(#bbBody)" opacity={0.6} />
        <rect x={100} y={96} width={40} height={6} rx={3} fill={C.fanDeep} />
        <rect x={100} y={294} width={40} height={6} rx={3} fill={C.fanDeep} />
      </g>
      {/* slide switch on the lower edge */}
      <rect x={96} y={326} width={48} height={14} rx={7} fill="#2A2A2A" />
      <rect x={switchOn ? 122 : 98} y={324} width={20} height={18} rx={5} fill={switchOn ? C.green : "#888"} />
    </svg>
  );
};

/** Back view: the same box with its vertical belt clip. */
export const BatteryBoxBack: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => {
  const h = (width * 340) / 240;
  return (
    <svg width={width} height={h} viewBox="0 0 240 340" style={{ overflow: "visible", ...style }}>
      <rect x={10} y={60} width={220} height={280} rx={26} fill={C.fanDeep} />
      <rect x={10} y={56} width={220} height={276} rx={26} fill={C.fan} />
      <rect x={92} y={70} width={56} height={230} rx={14} fill={C.fanShade} />
      <rect x={98} y={76} width={44} height={218} rx={11} fill={C.fanLight} opacity={0.7} />
      <rect x={104} y={56} width={32} height={14} rx={2} fill="#2A2A2A" />
    </svg>
  );
};
