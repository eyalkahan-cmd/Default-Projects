import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, EASE_IN_OUT, pop, rand } from "../components/anim";
import { BatteryBox } from "../components/BatteryBox";
import { Fan } from "../components/Fan";
import { BrandBg, Callout, Headline, StepBadge } from "../components/ui";
import { C, f, HEEBO } from "../theme";
import { FAN_SPOT } from "./S02Fan";

/** 66.45–69.19s: "לבסוף, הפעילו את המאוורר." */
const SwitchOn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = frame >= f(0.8);
  const ramp = interpolate(frame, [f(0.8), f(2.2)], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  // integrate spin speed so the impeller spins up smoothly
  const spin = interpolate(frame, [f(0.8), f(2.74)], [0, 900], { ...clamp, easing: Easing2 });
  const press = interpolate(frame, [f(0.55), f(0.8), f(1.0)], [0, 1, 0], clamp);
  return (
    <AbsoluteFill>
      <BrandBg />
      <div style={{ position: "absolute", top: 90, left: 0, right: 0 }}>
        <Headline text="מפעילים את המאוורר" start={4} size={110} highlight={["מפעילים"]} />
      </div>
      <div style={{ position: "absolute", left: 1260, top: 620, translate: "-50% -50%", scale: `${pop(frame, fps, 0, 14)}` }}>
        <BatteryBox width={330} switchOn={on} />
        {/* switch highlight + press ring */}
        <div style={{ position: "absolute", left: 165, top: 455, width: 120, height: 120, translate: "-50% -50%", borderRadius: "50%", border: `6px solid ${on ? C.green : C.yellow}`, opacity: 0.9, scale: `${1 + press * 0.3}` }} />
      </div>
      <div style={{ position: "absolute", left: 620, top: 600, translate: "-50% -50%", scale: `${pop(frame, fps, 4, 14)}` }}>
        <Fan size={460} spin={spin} cable={false} />
        {/* outflow lines once running */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 30 - ((frame * 14 + i * 50) % 200),
              top: 300 + i * 22,
              width: 90,
              height: 8,
              borderRadius: 4,
              background: "#8FE3FF",
              opacity: ramp * 0.8,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ease-in for the impeller spin-up
const Easing2 = (t: number) => t * t;

/** 69.19–77.93s: "הוא יתחיל להזרים אוויר אל תוך התחפושת, ובדרך כלל תוך כחצי דקה עד דקה, או מעט יותר, היא תתנפח למלוא גודלה!" */
const Inflate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = f(77.93 - 69.19);
  // The soft costume swells while air flows in; a short "puff" covers the swap to the full shape.
  const grow = interpolate(frame, [f(0.6), f(5.6)], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const p = interpolate(frame, [f(5.6), f(6.0)], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const puff = interpolate(frame, [f(5.45), f(5.8), f(6.3)], [0, 1, 0], clamp);
  const settleBounce = interpolate(frame, [f(6.0), f(6.4), f(6.9)], [1.04, 0.99, 1], clamp);
  const breathe = Math.sin(frame / 3.2) * 0.006 * (1 - p);
  const camera = interpolate(frame, [0, dur], [1.1, 1.0], clamp);
  const sx = FAN_SPOT.x * 1920;
  const sy = FAN_SPOT.y * 1080;
  const ring = interpolate(frame, [f(0.6), f(6.0)], [0, 1], clamp);
  const secs = Math.round(interpolate(ring, [0, 1], [0, 45]));
  return (
    <AbsoluteFill style={{ backgroundColor: C.navyDeep }}>
      <AbsoluteFill style={{ scale: `${camera + breathe}`, transformOrigin: "78% 60%" }}>
        <Img
          src={staticFile("img/trex_studio_soft.jpg")}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transformOrigin: "80% 95%",
            scale: `${interpolate(grow, [0, 1], [1, 1.05])} ${interpolate(grow, [0, 1], [1, 1.03])}`,
            opacity: 1 - p,
          }}
        />
        <Img
          src={staticFile("img/trex_studio_inflated.jpg")}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: p,
            transformOrigin: "80% 95%",
            scale: `${settleBounce}`,
          }}
        />
        {/* air "puff" over the swap */}
        <div
          style={{
            position: "absolute",
            left: "78%",
            top: "52%",
            width: 1400,
            height: 1400,
            translate: "-50% -50%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(189,241,255,0.6) 35%, rgba(189,241,255,0) 65%)",
            opacity: puff,
            scale: `${interpolate(puff, [0, 1], [0.4, 1.1])}`,
          }}
        />
        {/* air flowing in through the intake */}
        {new Array(22).fill(0).map((_, i) => {
          const t = ((frame + i * 7) % 40) / 40;
          const a = rand(i) * Math.PI * 2;
          const r = (1 - t) * (160 + rand(i + 3) * 120);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: sx + Math.cos(a) * r,
                top: sy + Math.sin(a) * r,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#BDF1FF",
                boxShadow: "0 0 14px #8FE3FF",
                opacity: interpolate(t, [0, 0.2, 0.9, 1], [0, 0.9, 0.9, 0]) * (1 - p * 0.6),
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* progress ring */}
      <div style={{ position: "absolute", left: 360, top: 470, translate: "-50% -50%", scale: `${pop(frame, fps, f(0.8), 14)}` }}>
        <svg width={360} height={360} viewBox="0 0 360 360">
          <circle cx={180} cy={180} r={150} stroke="rgba(255,255,255,0.18)" strokeWidth={26} fill="rgba(3,27,78,0.55)" />
          <circle
            cx={180}
            cy={180}
            r={150}
            stroke={C.yellow}
            strokeWidth={26}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - ring}
            transform="rotate(-90 180 180)"
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: HEEBO, color: C.white, direction: "rtl" }}>
          <div style={{ fontSize: 110, fontWeight: 900, lineHeight: 1 }}>{secs}</div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>שניות</div>
        </div>
      </div>
      <Callout text="30–60 שניות בערך" x={360} y={740} start={f(3.9)} color={C.yellow} size={50} />
      <Callout text="משתנה לפי הדגם" x={360} y={840} start={f(5.4)} size={38} />
      <Callout text="המאוורר מזרים אוויר פנימה" x={1250} y={160} start={f(0.9)} end={f(4.8)} size={42} />
    </AbsoluteFill>
  );
};

export const S07Inflate: React.FC = () => {
  const dur = f(77.93 - 66.45);
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={f(2.74)} layout="absolute-fill">
        <SwitchOn />
      </Sequence>
      <Sequence from={f(2.74)} layout="absolute-fill">
        <Inflate />
      </Sequence>
      <StepBadge n={5} title="ניפוח" start={f(0.2)} end={dur + 10} />
    </AbsoluteFill>
  );
};

