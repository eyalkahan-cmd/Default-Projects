import React from "react";
import { C } from "./theme";

/** One AA cell, drawn upright in a 56x130 box. */
export const AABattery: React.FC<{ glow?: number }> = ({ glow = 0 }) => (
  <svg width={56} height={130} viewBox="0 0 56 130" style={{ overflow: "visible" }}>
    <defs>
      <linearGradient id="aaBody" x1="0" x2="1">
        <stop offset="0" stopColor="#c99a10" />
        <stop offset="0.35" stopColor={C.yellow} />
        <stop offset="1" stopColor="#b8860b" />
      </linearGradient>
      <linearGradient id="aaBase" x1="0" x2="1">
        <stop offset="0" stopColor="#111" />
        <stop offset="0.35" stopColor="#3a3a3a" />
        <stop offset="1" stopColor="#0a0a0a" />
      </linearGradient>
    </defs>
    {glow > 0 && <rect x={-6} y={-4} width={68} height={138} rx={18} fill={C.lime} opacity={0.35 * glow} />}
    <rect x={19} y={0} width={18} height={9} rx={3} fill="#d9d9d9" />
    <rect x={2} y={8} width={52} height={120} rx={12} fill="url(#aaBase)" />
    <rect x={2} y={8} width={52} height={62} rx={12} fill="url(#aaBody)" />
    <rect x={2} y={58} width={52} height={12} fill="url(#aaBody)" />
    <text x={28} y={48} textAnchor="middle" fontSize={22} fontWeight={900} fill={C.ink} fontFamily="sans-serif">
      AA
    </text>
    <text x={28} y={102} textAnchor="middle" fontSize={22} fontWeight={900} fill={C.yellow} fontFamily="sans-serif">
      +
    </text>
  </svg>
);

/** Battery box: 400x260, with 4 slots, USB port on top, belt clip and switch. */
export const BatteryBox: React.FC<{
  switchOn?: number; // 0..1
  slotGlow?: number;
  children?: React.ReactNode; // rendered inside the compartment layer
}> = ({ switchOn = 0, slotGlow = 0, children }) => (
  <div style={{ position: "relative", width: 400, height: 260 }}>
    <svg width={400} height={260} viewBox="0 0 400 260" style={{ position: "absolute", overflow: "visible" }}>
      <defs>
        <linearGradient id="boxBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b3b52" />
          <stop offset="1" stopColor="#15151f" />
        </linearGradient>
      </defs>
      {/* belt clip */}
      <rect x={366} y={80} width={30} height={130} rx={10} fill="#2a2a3c" stroke="#55557a" strokeWidth={3} />
      {/* usb port */}
      <rect x={160} y={22} width={80} height={26} rx={6} fill="#2b2b3d" />
      <rect x={174} y={28} width={52} height={10} rx={2} fill="#9a9ab5" />
      <rect x={20} y={40} width={360} height={200} rx={30} fill="url(#boxBody)" stroke="#5a5a7a" strokeWidth={3} />
      <rect x={46} y={64} width={308} height={150} rx={16} fill="#0c0c14" stroke={C.lime} strokeOpacity={slotGlow} strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={62 + i * 74} y={72} width={60} height={134} rx={12} fill="#16161f" stroke="#2c2c3d" strokeWidth={2} />
      ))}
      {/* switch */}
      <rect x={150} y={222} width={100} height={30} rx={15} fill={switchOn > 0.5 ? C.lime : "#4a4a60"} />
      <circle cx={165 + 70 * switchOn} cy={237} r={12} fill="#fff" />
    </svg>
    <div style={{ position: "absolute", left: 0, top: 0, width: 400, height: 260 }}>{children}</div>
  </div>
);

/** Power bank: 220x360, LEDs light up with `charge` 0..1. */
export const PowerBank: React.FC<{ charge?: number }> = ({ charge = 1 }) => (
  <svg width={220} height={360} viewBox="0 0 220 360" style={{ overflow: "visible" }}>
    <defs>
      <linearGradient id="pbBody" x1="0" x2="1">
        <stop offset="0" stopColor="#dcdce8" />
        <stop offset="0.4" stopColor="#ffffff" />
        <stop offset="1" stopColor="#c7c7d6" />
      </linearGradient>
    </defs>
    <rect x={70} y={0} width={80} height={22} rx={6} fill="#8a8aa0" />
    <rect x={84} y={6} width={52} height={8} rx={2} fill="#2b2b3d" />
    <rect x={0} y={16} width={220} height={344} rx={40} fill="url(#pbBody)" />
    <rect x={20} y={36} width={180} height={304} rx={28} fill="none" stroke="#e8e8f2" strokeWidth={3} />
    {[0, 1, 2, 3].map((i) => (
      <circle key={i} cx={62 + i * 32} cy={300} r={9} fill={charge > i / 4 ? C.cyan : "#b8b8c8"} />
    ))}
    <path d="M118 120 L92 190 L114 190 L100 250 L134 170 L112 170 L126 120 Z" fill={C.lime} />
  </svg>
);

/** Round fan with rotating blades. */
export const Fan: React.FC<{ angle: number; size?: number; color?: string }> = ({
  angle,
  size = 220,
  color = C.cyan,
}) => (
  <svg width={size} height={size} viewBox="-110 -110 220 220" style={{ overflow: "visible" }}>
    <circle r={104} fill="#1c1c2a" stroke={color} strokeWidth={8} />
    <circle r={90} fill="#11111a" />
    <g transform={`rotate(${angle})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path
          key={a}
          transform={`rotate(${a})`}
          d="M0 -10 C 30 -30, 70 -40, 80 -12 C 60 -6, 30 0, 0 10 Z"
          fill={color}
          opacity={0.9}
        />
      ))}
    </g>
    <circle r={18} fill="#fff" />
    {[0, 45, 90, 135].map((a) => (
      <line key={a} x1={-100} y1={0} x2={100} y2={0} transform={`rotate(${a})`} stroke="#ffffff" strokeOpacity={0.12} strokeWidth={3} />
    ))}
  </svg>
);

/** USB-A plug, pointing down; 80x150. */
export const UsbPlug: React.FC = () => (
  <svg width={80} height={150} viewBox="0 0 80 150" style={{ overflow: "visible" }}>
    <rect x={10} y={0} width={60} height={90} rx={14} fill="#2a2a3c" stroke="#6a6a8a" strokeWidth={3} />
    <rect x={18} y={88} width={44} height={56} rx={3} fill="#c9c9d6" />
    <rect x={26} y={100} width={10} height={10} fill="#2a2a3c" />
    <rect x={44} y={100} width={10} height={10} fill="#2a2a3c" />
    <path d="M40 22 L40 66 M40 22 l-8 10 M40 22 l8 10 M40 44 l-12 -8 M40 54 l12 -8" stroke={C.cyan} strokeWidth={4} fill="none" strokeLinecap="round" />
  </svg>
);

/** Zipper: `progress` 0..1 closes it from bottom to top. */
export const Zipper: React.FC<{ progress: number; height?: number }> = ({ progress, height = 700 }) => {
  const teeth = 26;
  const step = height / teeth;
  const sliderY = height - progress * height;
  return (
    <svg width={520} height={height + 80} viewBox={`-260 -40 520 ${height + 80}`} style={{ overflow: "visible" }}>
      {/* fabric halves */}
      {[-1, 1].map((side) => {
        const pts: string[] = [];
        for (let i = 0; i <= teeth; i++) {
          const y = i * step;
          const open = y < sliderY ? Math.min(1, (sliderY - y) / 260) : 0;
          pts.push(`${side * (14 + open * 110)},${y}`);
        }
        const outer = side * 260;
        const d = `M${outer},0 L${pts.join(" L")} L${outer},${height} Z`;
        return <path key={side} d={d} fill={C.lime} stroke={C.limeDark} strokeWidth={4} />;
      })}
      {/* teeth */}
      {new Array(teeth).fill(0).map((_, i) => {
        const y = i * step + step / 2;
        const open = y < sliderY ? Math.min(1, (sliderY - y) / 260) : 0;
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (open * 110) + (side < 0 ? -24 : 0);
        return <rect key={i} x={x} y={y - step * 0.32} width={24} height={step * 0.64} rx={4} fill="#e9e9f2" stroke="#9a9ab0" strokeWidth={2} />;
      })}
      {/* slider + pull tab */}
      <g transform={`translate(0 ${sliderY})`}>
        <rect x={-38} y={-34} width={76} height={68} rx={16} fill="#f2f2f8" stroke="#8a8aa0" strokeWidth={4} />
        <rect x={-18} y={20} width={36} height={90} rx={14} fill="#d0d0de" stroke="#8a8aa0" strokeWidth={4} />
        <rect x={-7} y={62} width={14} height={34} rx={7} fill="#8a8aa0" />
      </g>
    </svg>
  );
};

/** Big toggle switch, 440x200; `on` 0..1. */
export const Toggle: React.FC<{ on: number }> = ({ on }) => {
  const track = on > 0.5 ? C.lime : "#4a4a62";
  return (
    <svg width={440} height={200} viewBox="0 0 440 200" style={{ overflow: "visible" }}>
      <rect x={0} y={0} width={440} height={200} rx={100} fill={track} />
      <rect x={10} y={10} width={420} height={180} rx={90} fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={4} />
      <text x={on > 0.5 ? 120 : 320} y={124} textAnchor="middle" fontSize={64} fontWeight={900} fill={on > 0.5 ? C.ink : "#c8c8dc"} fontFamily="sans-serif">
        {on > 0.5 ? "ON" : "OFF"}
      </text>
      <circle cx={100 + 240 * on} cy={100} r={78} fill="#ffffff" />
      <circle cx={100 + 240 * on} cy={100} r={78} fill="none" stroke="#000" strokeOpacity={0.08} strokeWidth={6} />
    </svg>
  );
};

/** Check mark in a circle. */
export const Check: React.FC<{ size?: number; color?: string; draw?: number }> = ({
  size = 64,
  color = C.lime,
  draw = 1,
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle cx={32} cy={32} r={30} fill={color} />
    <path
      d="M18 33 L28 43 L47 22"
      fill="none"
      stroke={C.ink}
      strokeWidth={7}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={50}
      strokeDashoffset={50 * (1 - draw)}
    />
  </svg>
);
