import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, EASE_IN_OUT, pop, rand } from "../components/anim";
import { BrandBg, Check, Headline } from "../components/ui";
import { C, f, HEEBO } from "../theme";

const Burst: React.FC<{ progress: number }> = ({ progress }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    {new Array(24).fill(0).map((_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const r1 = 200 + progress * 200;
      const r2 = 1400;
      return (
        <polygon
          key={i}
          points={`${960 + Math.cos(a - 0.06) * r1},${540 + Math.sin(a - 0.06) * r1} ${960 + Math.cos(a) * r2},${540 + Math.sin(a) * r2} ${960 + Math.cos(a + 0.06) * r1},${540 + Math.sin(a + 0.06) * r1}`}
          fill={i % 2 ? C.yellow : C.pink}
          opacity={0.25}
        />
      );
    })}
  </svg>
);

/** Air particles: escaping (leak=true) or swirling inside (contained). */
const Air: React.FC<{ cx: number; cy: number; leak: boolean; frame: number }> = ({ cx, cy, leak, frame }) => (
  <>
    {new Array(26).fill(0).map((_, i) => {
      const t = ((frame + i * 9) % 60) / 60;
      let x: number;
      let y: number;
      if (leak) {
        // stream out of the neck/collar gap to the upper side
        x = cx + 40 + t * (260 + rand(i) * 140);
        y = cy - 150 - t * (120 + rand(i + 4) * 160) + Math.sin(t * 9 + i) * 14;
      } else {
        const a = t * Math.PI * 2 + i;
        x = cx + Math.cos(a) * (90 + rand(i) * 40);
        y = cy + 40 + Math.sin(a) * (170 + rand(i + 2) * 40);
      }
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: leak ? C.red : "#8FE3FF",
            opacity: leak ? interpolate(t, [0, 0.15, 1], [0, 0.9, 0]) : 0.55,
            boxShadow: `0 0 12px ${leak ? C.red : "#8FE3FF"}`,
          }}
        />
      );
    })}
  </>
);

/** 42.31–50.51s: "עכשיו מגיע השלב החשוב ביותר! כדי שהתחפושת תתנפח כמו שצריך, חשוב לצמצם בריחת אוויר." */
export const S05Important: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cmp = f(3.3);
  const toCmp = interpolate(frame, [cmp - 6, cmp + 8], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const flash = interpolate(frame, [0, 6], [1, 0], clamp);
  const shake = frame < cmp ? Math.sin(frame * 2.1) * interpolate(frame, [0, 20], [10, 2], clamp) : 0;
  const leftIn = pop(frame, fps, cmp + 4, 13);
  const rightIn = pop(frame, fps, cmp + 10, 13);
  const sag = 1 - 0.08 * (0.5 + 0.5 * Math.sin(frame / 6));

  return (
    <AbsoluteFill>
      <BrandBg tint={C.navy} />
      {/* phase 1: the turning point */}
      <AbsoluteFill style={{ opacity: 1 - toCmp, scale: `${1 + toCmp * 0.3}` }}>
        <Burst progress={interpolate(frame, [0, cmp], [0, 1], clamp)} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", translate: `${shake}px 0px` }}>
          <Headline text="השלב החשוב ביותר!" start={f(1.4)} size={190} stagger={6} highlight={["החשוב"]} />
        </AbsoluteFill>
      </AbsoluteFill>

      {/* phase 2: leak vs sealed */}
      <AbsoluteFill style={{ opacity: toCmp }}>
        <div style={{ position: "absolute", top: 70, left: 0, right: 0 }}>
          <Headline text="מונעים בריחת אוויר" start={cmp + 2} size={104} highlight={["אוויר"]} />
        </div>
        {/* right (read first): leaking */}
        <div style={{ position: "absolute", left: 1380, top: 600, translate: "-50% -50%", scale: `${rightIn}` }}>
          <div style={{ width: 520, height: 640, borderRadius: 36, background: "rgba(255,59,59,0.12)", border: `4px solid ${C.red}` }} />
          <Img
            src={staticFile("cut/trex.png")}
            style={{
              position: "absolute",
              left: 260,
              bottom: 40,
              height: 520,
              translate: "-50% 0",
              transformOrigin: "50% 100%",
              scale: `${0.92 * sag} ${0.86 * sag}`,
              filter: "saturate(0.7) brightness(0.9)",
            }}
          />
          <Air cx={260} cy={330} leak frame={frame} />
          <div style={{ position: "absolute", top: -60, left: 0, right: 60, textAlign: "center", fontFamily: HEEBO, fontWeight: 900, fontSize: 42, color: C.red, direction: "rtl" }}>
            פתוח: האוויר בורח
          </div>
          <svg width={110} height={110} viewBox="0 0 100 100" style={{ position: "absolute", right: -30, top: -30 }}>
            <circle cx={50} cy={50} r={46} fill={C.red} />
            <path d="M 32 32 L 68 68 M 68 32 L 32 68" stroke="#fff" strokeWidth={11} strokeLinecap="round" />
          </svg>
        </div>
        {/* left: sealed */}
        <div style={{ position: "absolute", left: 540, top: 600, translate: "-50% -50%", scale: `${leftIn}` }}>
          <div style={{ width: 520, height: 640, borderRadius: 36, background: "rgba(43,212,107,0.12)", border: `4px solid ${C.green}` }} />
          <Img
            src={staticFile("cut/trex.png")}
            style={{
              position: "absolute",
              left: 260,
              bottom: 40,
              height: 560,
              translate: "-50% 0",
              transformOrigin: "50% 100%",
              scale: `${1 + 0.015 * Math.sin(frame / 8)}`,
            }}
          />
          <Air cx={260} cy={300} leak={false} frame={frame} />
          <div style={{ position: "absolute", top: -60, left: 0, right: 60, textAlign: "center", fontFamily: HEEBO, fontWeight: 900, fontSize: 42, color: C.green, direction: "rtl" }}>
            סגור: האוויר נשאר
          </div>
          <Check size={110} start={cmp + 20} style={{ position: "absolute", right: -30, top: -30 }} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ backgroundColor: C.white, opacity: flash }} />
    </AbsoluteFill>
  );
};
