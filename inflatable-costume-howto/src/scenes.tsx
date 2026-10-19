import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import {
  Background,
  Chip,
  Confetti,
  Pop,
  Pulse,
  StepBadge,
} from "./components";
import {
  AABattery,
  BatteryBox,
  Check,
  Fan,
  PowerBank,
  Toggle,
  UsbPlug,
  Zipper,
} from "./illustrations";
import { C, ease, fadeInOut, fontFamily, s } from "./theme";


// ------------------------------------------------------------------ shared

/** Tight-cropped, background-removed dino costume. Size of the PNG crop. */
export const DINO = { w: 524, h: 669 };
/** Seal points as fractions of the dino crop (x, y). */
export const SEALS = {
  ankleL: [0.22, 0.87],
  ankleR: [0.57, 0.9],
  wristL: [0.14, 0.31],
  wristR: [0.37, 0.37],
  neck: [0.38, 0.25],
} as const;

const Dino: React.FC<{
  height: number;
  sx?: number;
  sy?: number;
  style?: React.CSSProperties;
  filter?: string;
}> = ({ height, sx = 1, sy = 1, style, filter }) => {
  const width = (DINO.w / DINO.h) * height;
  return (
    <div style={{ position: "absolute", width, height, ...style }}>
      <Img
        src={staticFile("dino_cut.png")}
        style={{
          width,
          height,
          scale: `${sx} ${sy}`,
          transformOrigin: "50% 100%",
          filter: filter ?? "drop-shadow(0 30px 40px rgba(0,0,0,0.45))",
        }}
      />
    </div>
  );
};

const Title: React.FC<{
  text: string;
  at?: number;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ text, at = 0, size = 96, color = C.white, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        direction: "rtl",
        fontFamily,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.1,
        color,
        display: "flex",
        flexWrap: "wrap",
        gap: `0 ${size * 0.25}px`,
        textShadow: "0 8px 30px rgba(0,0,0,0.35)",
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = spring({ frame: frame - at - i * 4, fps, config: { damping: 12 } });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: Math.min(1, p * 1.5),
              translate: `0 ${(1 - p) * 60}px`,
              scale: String(0.6 + 0.4 * p),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.5 }) => (
  <Sequence from={at} durationInFrames={s(4)} layout="none">
    <Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);

/** Phase wrapper: fades its content in/out over its window. */
const Phase: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({
  from,
  to,
  children,
}) => {
  const frame = useCurrentFrame();
  if (frame < from - 1 || frame > to + 1) return null;
  return (
    <AbsoluteFill style={{ opacity: fadeInOut(frame, from, to, 7) }}>{children}</AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 1. hook

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inflate = spring({ frame: frame - 2, fps, config: { damping: 7, mass: 0.9 } });
  return (
    <AbsoluteFill>
      <Background />
      <Dino
        height={900}
        sx={0.75 + 0.25 * inflate}
        sy={0.35 + 0.65 * inflate}
        style={{ left: 1160, top: 120, rotate: `${Math.sin(frame / 9) * 1.5}deg` }}
      />
      <Pulse x={1460} y={560} at={8} color={C.lime} size={700} />
      <Title text="קניתם תחפושת" at={4} size={120} style={{ right: 840, top: 250, width: 1000 }} />
      <Title text="מתנפחת?" at={12} size={180} color={C.lime} style={{ right: 840, top: 390, width: 1000 }} />
      <Pop at={s(1.8)} style={{ right: 840, top: 650 }}>
        <Chip text="כך תנפחו אותה בקלות" color={C.yellow} size={52} />
      </Pop>
      <Sfx at={2} src="pop.wav" volume={0.4} />
      <Sfx at={s(1.8)} src="whoosh.wav" volume={0.35} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 2. power

const SLOT_X = (i: number) => 64 + i * 74;

export const PowerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phaseB = s(3.5);
  // box move from centre stage to the left third
  const mv = ease(frame, [phaseB - 4, phaseB + 18], [0, 1]);
  const boxScale = interpolate(mv, [0, 1], [1.6, 1.05]);
  const boxLeft = interpolate(mv, [0, 1], [640, 170]);
  const boxTop = interpolate(mv, [0, 1], [300, 380]);
  const drops = [12, 21, 30, 39];
  const cableDraw = ease(frame, [s(6.0), s(7.2)], [0, 1]);
  const fanAngle = frame > s(7.2) ? (frame - s(7.2)) ** 1.5 * 2.2 : 0;
  const pb = spring({ frame: frame - phaseB - 8, fps, config: { damping: 13 } });
  return (
    <AbsoluteFill>
      <Background hue={C.purple} hue2={C.cyan} />
      <StepBadge n={1} title="מקור כוח" color={C.lime} />

      {/* battery box */}
      <div
        style={{
          position: "absolute",
          left: boxLeft,
          top: boxTop,
          scale: String(boxScale),
          transformOrigin: "0 0",
        }}
      >
        <BatteryBox slotGlow={ease(frame, [48, 60], [0, 1])}>
          {drops.map((d, i) => {
            const p = spring({ frame: frame - d, fps, config: { damping: 11 } });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: SLOT_X(i),
                  top: 74,
                  translate: `0 ${(1 - p) * -620}px`,
                  rotate: `${(1 - p) * (i % 2 ? 25 : -25)}deg`,
                  opacity: frame >= d ? 1 : 0,
                }}
              >
                <AABattery glow={ease(frame, [d + 8, d + 14], [0, 1]) - ease(frame, [d + 18, d + 34], [0, 1])} />
              </div>
            );
          })}
        </BatteryBox>
      </div>
      {drops.map((d) => (
        <Sfx key={d} at={d + 9} src="click.wav" volume={0.5} />
      ))}
      <div style={{ opacity: 1 - mv }}>
        <Pop at={50} style={{ left: 0, right: 0, top: 760, display: "flex", justifyContent: "center" }}>
          <Chip text="4 × סוללות AA חדשות" color={C.yellow} size={56} />
        </Pop>
      </div>

      {/* phase B: OR + power bank → USB → fan */}
      {frame > phaseB - 2 && (
        <>
          <Pop at={phaseB + 2} style={{ left: 760, top: 470 }}>
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: C.pink,
                color: C.white,
                fontFamily,
                fontWeight: 900,
                fontSize: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 0 14px ${C.pink}44`,
              }}
            >
              או
            </div>
          </Pop>
          <Pop at={phaseB + 10} style={{ left: 110, top: 760 }}>
            <Chip text="סוללות AA" color={C.yellow} size={44} />
          </Pop>
          <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
            <path
              d="M1290 395 C 1290 220, 1630 760, 1630 600"
              fill="none"
              stroke="#2b2b3d"
              strokeWidth={22}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - cableDraw}
            />
            <path
              d="M1290 395 C 1290 220, 1630 760, 1630 600"
              fill="none"
              stroke={C.cyan}
              strokeWidth={6}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="0.04 0.06"
              strokeDashoffset={-frame * 0.01}
              opacity={cableDraw >= 1 ? 1 : 0}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              left: 1180,
              top: 400,
              translate: `${(1 - pb) * 700}px 0`,
              rotate: `${(1 - pb) * 20}deg`,
            }}
          >
            <PowerBank charge={ease(frame, [phaseB + 20, phaseB + 50], [0, 1])} />
          </div>
          <Pop at={phaseB + 30} style={{ left: 1520, top: 380 }}>
            <Fan angle={fanAngle} size={220} />
          </Pop>
          <Pop at={phaseB + 26} style={{ left: 1150, top: 800 }}>
            <Chip text="Power Bank" color={C.cyan} size={46} />
          </Pop>
          <Pop at={s(6.2)} style={{ left: 1500, top: 270 }}>
            <Chip text="USB ← מאוורר" color={C.lime} size={44} />
          </Pop>
          <Sfx at={phaseB} src="whoosh.wav" volume={0.35} />
          <Sfx at={s(7.2)} src="pop.wav" volume={0.35} />
        </>
      )}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 3. connect & clip

export const ConnectScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const A_END = s(2.2);
  const B_END = s(3.85);
  const END = s(9.65);

  // phase A: plug drops into the box's USB port
  const plug = spring({ frame: frame - 6, fps, config: { damping: 15 } });
  const plugTop = interpolate(plug, [0, 1], [-260, 172]);
  const clickAt = 24;

  // phase B: push into the costume
  const push = ease(frame, [A_END, B_END], [0, 1], (t) => t * t * t);

  // phase C: clip onto belt
  const drop = spring({ frame: frame - B_END - 8, fps, config: { damping: 10 } });
  const walk = frame > s(7.2) ? Math.sin((frame - s(7.2)) / 6) : 0;
  const walkAmp = ease(frame, [s(7.2), s(7.8)], [0, 1]);

  return (
    <AbsoluteFill>
      <Background hue={C.pink} hue2={C.purple} />

      <Phase from={0} to={A_END + 4}>
        <div style={{ position: "absolute", left: 640, top: 340, scale: "1.6", transformOrigin: "0 0" }}>
          <BatteryBox slotGlow={0}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ position: "absolute", left: SLOT_X(i), top: 74 }}>
                <AABattery />
              </div>
            ))}
          </BatteryBox>
        </div>
        <div style={{ position: "absolute", left: 960 - 52, top: plugTop, scale: "1.3", transformOrigin: "50% 100%" }}>
          <div style={{ position: "absolute", left: 30, top: -1200, width: 20, height: 1200, background: "#2b2b3d", borderRadius: 10 }} />
          <UsbPlug />
        </div>
        <Pulse x={960} y={390} at={clickAt} color={C.cyan} size={220} />
        <Sfx at={clickAt} src="click.wav" volume={0.7} />
        <Pop at={clickAt + 4} style={{ left: 0, right: 0, top: 800, display: "flex", justifyContent: "center" }}>
          <Chip text="חברו את הכבל לקופסה" color={C.cyan} size={56} />
        </Pop>
      </Phase>

      <Phase from={A_END - 4} to={B_END + 6}>
        <Dino
          height={820}
          style={{
            left: 960 - (DINO.w / DINO.h) * 410,
            top: 140,
            scale: String(1 + push * 5),
            transformOrigin: "45% 55%",
            opacity: 1 - ease(frame, [B_END - 8, B_END], [0, 1]),
          }}
        />
        <Title text="היכנסו לתחפושת" at={A_END} size={110} style={{ right: 110, top: 160, width: 700 }} />
        <Sfx at={A_END + 10} src="whoosh.wav" volume={0.45} />
      </Phase>

      <Phase from={B_END} to={END}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, #2a7a12 0%, #0d3006 70%)" }} />
        <StepBadge n={2} title="חיבור והצמדה" color={C.pink} delay={4} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, translate: `${walk * 26 * walkAmp}px ${Math.abs(walk) * -10 * walkAmp}px` }}>
          {/* jeans + belt */}
          <div style={{ position: "absolute", left: -100, top: 690, width: 2120, height: 500, background: "linear-gradient(180deg,#2d4a86,#1b2d55)" }} />
          <div style={{ position: "absolute", left: -100, top: 600, width: 2120, height: 110, background: "linear-gradient(180deg,#7a4a2c,#4e2d18)", borderTop: "4px solid #9c6440", borderBottom: "4px solid #3a1f0f" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 14, borderTop: "4px dashed #d9a066", opacity: 0.7 }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, borderTop: "4px dashed #d9a066", opacity: 0.7 }} />
          </div>
          <div style={{ position: "absolute", left: 300, top: 584, width: 150, height: 140, border: "14px solid #d8d8e6", borderRadius: 18 }} />
          {/* box + cable */}
          <div style={{ position: "absolute", left: 760, top: 380, scale: "1.15", transformOrigin: "0 0", translate: `0 ${(1 - drop) * -900}px` }}>
            <div style={{ position: "absolute", left: 190, top: -900, width: 20, height: 930, background: "#2b2b3d", borderRadius: 10 }} />
            <BatteryBox>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ position: "absolute", left: SLOT_X(i), top: 74 }}>
                  <AABattery />
                </div>
              ))}
            </BatteryBox>
          </div>
        </div>
        <Pulse x={1220} y={560} at={B_END + 24} color={C.yellow} size={200} />
        <Sfx at={B_END + 20} src="click.wav" volume={0.7} />
        <Pop at={B_END + 30} style={{ left: 120, top: 260 }}>
          <Chip text="כיס פנימי" color={C.white} size={50} />
        </Pop>
        <Pop at={B_END + 40} style={{ left: 430, top: 266 }}>
          <Chip text="או" color={C.pink} textColor={C.white} size={44} />
        </Pop>
        <Pop at={B_END + 50} style={{ left: 600, top: 260 }}>
          <Chip text="חגורה" color={C.yellow} size={50} />
        </Pop>
        <Pop at={s(7.0)} style={{ left: 1300, top: 420 }}>
          <Chip text="← קליפס" color={C.lime} size={46} />
        </Pop>
        <Pop at={s(7.6)} style={{ left: 0, right: 0, top: 860, display: "flex", justifyContent: "center" }}>
          <Chip text="← תנועה חופשית →" color={C.cyan} size={56} />
        </Pop>
      </Phase>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 4. seal

const DINO_SEAL_H = 820;
const DINO_SEAL_LEFT = 1060;
const DINO_SEAL_TOP = 200;
const sealPos = (k: keyof typeof SEALS) => {
  const w = (DINO.w / DINO.h) * DINO_SEAL_H;
  return { x: DINO_SEAL_LEFT + SEALS[k][0] * w, y: DINO_SEAL_TOP + SEALS[k][1] * DINO_SEAL_H };
};

const AirLeak: React.FC<{ x: number; y: number; dir: number; seed: number }> = ({ x, y, dir, seed }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const t = ((frame + seed * 7 + i * 9) % 36) / 36;
        const dx = Math.cos(dir) * t * 160;
        const dy = Math.sin(dir) * t * 160;
        return (
          <svg key={i} width={80} height={40} style={{ position: "absolute", left: x + dx - 40, top: y + dy - 20, opacity: (1 - t) * 0.95, rotate: `${(dir * 180) / Math.PI}deg`, scale: String(0.6 + t) }}>
            <path d="M5 20 C 25 5, 45 35, 75 20" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
          </svg>
        );
      })}
    </>
  );
};

export const SealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const A1 = s(2.05);
  const A2 = s(5.5);
  const B = s(8.05);
  const END = s(13.2);
  const zip = ease(frame, [A2 + 8, B - 10], [0, 1], (t) => t);
  const shake = frame < A1 ? Math.sin(frame * 1.7) * 8 * ease(frame, [0, 10], [0, 1]) : 0;
  const leaking = frame < A1 + s(2.4);
  const items: { k: keyof typeof SEALS; k2?: keyof typeof SEALS; label: string; at: number }[] = [
    { k: "ankleL", k2: "ankleR", label: "קרסוליים", at: s(10.45) },
    { k: "wristL", k2: "wristR", label: "פרקי ידיים", at: s(11.45) },
    { k: "neck", label: "צוואר", at: s(12.35) },
  ];
  return (
    <AbsoluteFill>
      <Background hue={C.red} hue2={C.yellow} />

      <Phase from={0} to={A1 + 4}>
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #ff3b5c55, transparent 60%)" }} />
        {[90, 950].map((top) => (
          <div key={top} style={{ position: "absolute", left: -200, top, width: 2400, height: 46, background: `repeating-linear-gradient(-45deg, ${C.yellow} 0 40px, ${C.ink} 40px 80px)`, backgroundPosition: `${frame * 4}px 0` }} />
        ))}
        <Pop at={2} style={{ left: 810, top: 200, translate: `${shake}px 0` }}>
          <svg width={300} height={270} viewBox="0 0 300 270">
            <path d="M150 14 L288 252 L12 252 Z" fill={C.yellow} stroke={C.ink} strokeWidth={14} strokeLinejoin="round" />
            <rect x={136} y={90} width={28} height={100} rx={12} fill={C.ink} />
            <circle cx={150} cy={218} r={16} fill={C.ink} />
          </svg>
        </Pop>
        <Title text="השלב החשוב ביותר" at={8} size={130} style={{ left: 0, right: 0, top: 560, justifyContent: "center" }} />
        <Sfx at={2} src="pop.wav" volume={0.5} />
      </Phase>

      <Phase from={A1} to={A2 + 4}>
        <Dino height={DINO_SEAL_H} style={{ left: DINO_SEAL_LEFT, top: DINO_SEAL_TOP }} />
        {leaking && (
          <>
            <AirLeak {...sealPos("neck")} dir={-1.2} seed={1} />
            <AirLeak {...sealPos("wristL")} dir={-2.6} seed={2} />
            <AirLeak {...sealPos("wristR")} dir={-0.4} seed={3} />
            <AirLeak {...sealPos("ankleL")} dir={2.6} seed={4} />
            <AirLeak {...sealPos("ankleR")} dir={0.5} seed={5} />
          </>
        )}
        <Title text="אסור לאוויר" at={A1 + 6} size={120} style={{ right: 960, top: 300, width: 860 }} />
        <Title text="לברוח!" at={A1 + 14} size={170} color={C.red} style={{ right: 960, top: 450, width: 860 }} />
        <Pop at={A1 + s(2.4)} style={{ left: 1080, top: 260 }} damping={9}>
          <svg width={560} height={560} viewBox="0 0 100 100" style={{ opacity: 0.9 }}>
            <circle cx={50} cy={50} r={44} fill="none" stroke={C.red} strokeWidth={8} />
            <line x1={19} y1={19} x2={81} y2={81} stroke={C.red} strokeWidth={8} />
          </svg>
        </Pop>
        <Sfx at={A1 + s(2.4)} src="pop.wav" volume={0.6} />
      </Phase>

      <Phase from={A2} to={B + 4}>
        <StepBadge n={3} title="אוטמים את התחפושת" color={C.yellow} delay={2} />
        <div style={{ position: "absolute", left: 1150, top: 200, scale: "1.05" }}>
          <Zipper progress={zip} height={720} />
        </div>
        <Title text="רכסו את כל הרוכסנים" at={A2 + 4} size={96} style={{ right: 860, top: 340, width: 900 }} />
        <Pop at={A2 + 18} style={{ right: 860, top: 580 }}>
          <Chip text={`עד הסוף · ${Math.round(zip * 100)}%`} color={zip >= 1 ? C.lime : C.yellow} size={60} />
        </Pop>
        <Sfx at={A2 + 8} src="whoosh.wav" volume={0.4} />
        <Sfx at={B - 10} src="click.wav" volume={0.6} />
      </Phase>

      <Phase from={B} to={END}>
        <StepBadge n={3} title="אוטמים את התחפושת" color={C.yellow} delay={-20} />
        <Dino height={DINO_SEAL_H} style={{ left: DINO_SEAL_LEFT, top: DINO_SEAL_TOP }} />
        <Title text="הדקו גומיות ושרוכים" at={B + 4} size={84} style={{ right: 920, top: 260, width: 900 }} />
        {items.map((it, i) => {
          const p = spring({ frame: frame - it.at, fps, config: { damping: 12 } });
          const pts = [it.k, it.k2].filter(Boolean) as (keyof typeof SEALS)[];
          return (
            <React.Fragment key={it.label}>
              {pts.map((k) => {
                const { x, y } = sealPos(k);
                return (
                  <React.Fragment key={k}>
                    <Pulse x={x} y={y} at={it.at} color={C.lime} size={130} />
                    <div style={{ position: "absolute", left: x - 30, top: y - 30, scale: String(p) }}>
                      <Check size={60} draw={ease(frame, [it.at + 4, it.at + 16], [0, 1])} />
                    </div>
                  </React.Fragment>
                );
              })}
              <div
                style={{
                  position: "absolute",
                  right: 960,
                  top: 440 + i * 130,
                  display: "flex",
                  alignItems: "center",
                  gap: 26,
                  direction: "rtl",
                  opacity: Math.min(1, p * 1.5),
                  translate: `${(1 - p) * 120}px 0`,
                }}
              >
                <Check size={84} draw={ease(frame, [it.at + 4, it.at + 16], [0, 1])} />
                <div style={{ fontFamily, fontWeight: 900, fontSize: 80, color: C.white }}>{it.label}</div>
              </div>
              <Sfx at={it.at} src="pop.wav" volume={0.45} />
            </React.Fragment>
          );
        })}
      </Phase>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 5. switch on

export const SwitchScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const FLIP = s(2.05);
  const B = s(2.95);
  const on = ease(frame, [FLIP, FLIP + 7], [0, 1]);
  const burst = ease(frame, [FLIP, FLIP + 20], [0, 1]);
  const fanSpeed = ease(frame, [B, B + 40], [2, 38], (t) => t);
  // integrate speed for a smooth spin-up
  let angle = 0;
  for (let f = B; f < frame; f++) angle += ease(f, [B, B + 40], [2, 38], (t) => t);
  void fanSpeed;
  const fanIn = spring({ frame: frame - B, fps, config: { damping: 13 } });
  return (
    <AbsoluteFill>
      <Background hue={C.lime} hue2={C.purple} />
      <StepBadge n={4} title="הפעלה" color={C.cyan} />
      <Phase from={0} to={B + 6}>
        <div
          style={{
            position: "absolute",
            left: 960 - 500,
            top: 540 - 500,
            width: 1000,
            height: 1000,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.lime}aa, transparent 65%)`,
            scale: String(0.3 + burst * 1.2),
            opacity: (1 - burst) * (frame >= FLIP ? 1 : 0),
          }}
        />
        <Pop at={4} style={{ left: 960 - 308, top: 400, scale: "1.4" }}>
          <Toggle on={on} />
        </Pop>
        <Title text="העבירו את המתג" at={6} size={100} style={{ left: 0, right: 0, top: 200, justifyContent: "center" }} />
        <Sfx at={FLIP} src="click.wav" volume={0.8} />
        <Sfx at={FLIP} src="ding.wav" volume={0.35} />
      </Phase>
      <Phase from={B} to={s(4.75)}>
        {new Array(16).fill(0).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const t = ((frame * 1.6 + i * 17) % 60) / 60;
          const r = 900 * (1 - t) + 180;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 960 + Math.cos(a) * r - 70,
                top: 560 + Math.sin(a) * r - 4,
                width: 140,
                height: 8,
                borderRadius: 4,
                background: C.white,
                opacity: Math.sin(t * Math.PI) * 0.7,
                rotate: `${(a * 180) / Math.PI}deg`,
              }}
            />
          );
        })}
        <div style={{ position: "absolute", left: 960 - 230, top: 560 - 230, scale: String(fanIn) }}>
          <Fan angle={angle} size={460} />
        </div>
        <Title text="המאוורר שואב אוויר" at={B + 4} size={84} style={{ left: 0, right: 0, top: 180, justifyContent: "center" }} />
        <Sfx at={B} src="whoosh.wav" volume={0.4} />
      </Phase>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 6. inflate

export const InflateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = ease(frame, [6, s(3.0)], [0, 1], (t) => 1 - Math.pow(1 - t, 2));
  const settle = spring({ frame: frame - s(3.0), fps, config: { damping: 6, mass: 0.8 } });
  const wobble = frame < s(3.0) ? Math.sin(frame / 2.2) * 0.03 * grow : (1 - settle) * 0.08;
  const sx = 0.55 + 0.45 * grow + wobble;
  const sy = 0.22 + 0.78 * grow - wobble;
  const ring = ease(frame, [6, s(3.0)], [0, 1], (t) => t);
  const mins = ring * 2;
  const DONE = s(3.2);
  const end = interpolate(frame, [s(7.3), s(7.9)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let fanA = 0;
  for (let f = 0; f < frame; f++) fanA += 30;
  return (
    <AbsoluteFill style={{ opacity: end }}>
      <Background hue={C.lime} hue2={C.pink} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 70% 60%, rgba(155,226,45,0.28), transparent 55%)" }} />
      {/* progress ring */}
      <div style={{ position: "absolute", left: 300, top: 560, opacity: 1 - ease(frame, [DONE, DONE + 10], [0, 1]) }}>
        <svg width={260} height={260} viewBox="0 0 260 260">
          <circle cx={130} cy={130} r={110} stroke="rgba(255,255,255,0.15)" strokeWidth={22} fill="none" />
          <circle cx={130} cy={130} r={110} stroke={C.lime} strokeWidth={22} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} transform="rotate(-90 130 130)" />
          <text x={130} y={148} textAnchor="middle" fontSize={56} fontWeight={900} fill="#fff" fontFamily={fontFamily}>
            {`${Math.floor(mins)}:${String(Math.floor((mins % 1) * 60)).padStart(2, "0")}`}
          </text>
        </svg>
      </div>
      <Dino height={880} sx={sx} sy={sy} style={{ left: 1160, top: 110 }} />
      <Pop at={6} style={{ left: 1660, top: 760 }}>
        <Fan angle={fanA} size={150} />
      </Pop>
      <Title text="תוך דקה–שתיים" at={4} size={92} style={{ right: 880, top: 220, width: 960 }} />
      <Title text="מתנפחת למלוא הגודל!" at={14} size={92} color={C.lime} style={{ right: 880, top: 340, width: 960 }} />
      <Pop at={s(3.3)} style={{ right: 880, top: 520 }}>
        <Chip text="ונשארת כך כל עוד המאוורר דולק" color={C.yellow} size={50} />
      </Pop>
      <Pop at={s(5.2)} style={{ right: 880, top: 660 }} damping={9}>
        <div style={{ fontFamily, fontWeight: 900, fontSize: 120, color: C.white, direction: "rtl", textShadow: `0 0 40px ${C.pink}` }}>
          תהנו!
        </div>
      </Pop>
      <Confetti at={DONE} cx={1450} cy={420} count={110} />
      <Confetti at={s(5.2)} cx={600} cy={700} count={70} />
      <Sfx at={6} src="inflate.wav" volume={0.5} />
      <Sfx at={DONE} src="ding.wav" volume={0.45} />
      <Sfx at={DONE} src="pop.wav" volume={0.5} />
    </AbsoluteFill>
  );
};
