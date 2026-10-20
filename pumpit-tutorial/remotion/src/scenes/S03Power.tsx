import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, EASE_IN_OUT, EASE_OUT, pop } from "../components/anim";
import { BatteryBox } from "../components/BatteryBox";
import { Fan } from "../components/Fan";
import { PowerBank } from "../components/PowerBank";
import { BrandBg, Callout, Headline, StepBadge } from "../components/ui";
import { C, f, HEEBO } from "../theme";

/**
 * 11.91–25.85s: AA batteries (right, read first in RTL) vs. power bank via USB (left).
 * "הכניסו סוללות AA חדשות לקופסת הסוללות, בהתאם להוראות הדגם, או השתמשו בסוללת גיבוי ניידת,
 *  Power Bank, דרך כבל ה-USB של המאוורר, אם הדגם תומך בכך."
 */
export const S03Power: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = f(25.85 - 11.91);
  const lid = interpolate(frame, [f(0.3), f(1.0)], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const lidBack = interpolate(frame, [f(4.9), f(5.4)], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const cells = [1.3, 1.7, 2.1, 2.5].map((s) =>
    interpolate(frame, [f(s), f(s) + 8], [0, 1], { ...clamp, easing: EASE_OUT }),
  );
  // split-screen move at "או השתמשו" (local 5.43s)
  const split = interpolate(frame, [f(5.3), f(5.9)], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const boxX = interpolate(split, [0, 1], [1180, 1440]);
  const boxW = interpolate(split, [0, 1], [380, 300]);
  const pb = pop(frame, fps, f(7.2), 14);
  const cable = interpolate(frame, [f(9.9), f(10.9)], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const fanIn = pop(frame, fps, f(9.6), 14);
  const spin = frame * 30;

  return (
    <AbsoluteFill>
      <BrandBg spot={{ x: 0.5, y: 0.5 }} />

      {/* right panel: AA */}
      <div style={{ position: "absolute", left: boxX, top: 560, translate: "-50% -50%" }}>
        <BatteryBox width={boxW} lidOpen={lid * (1 - lidBack)} cells={cells} />
      </div>
      <div style={{ position: "absolute", left: interpolate(split, [0, 1], [500, 1440]), top: interpolate(split, [0, 1], [430, 260]), translate: "-50% -50%" }}>
        <Headline text="סוללות AA" start={f(0.6)} size={interpolate(split, [0, 1], [140, 84])} highlight={["AA"]} />
      </div>
      <Callout text="4 סוללות AA חדשות" x={500} y={620} start={f(2.9)} end={f(5.3)} color={C.yellow} size={52} />
      <Callout text="בהתאם להוראות הדגם" x={500} y={740} start={f(4.4)} end={f(5.3)} size={44} />

      {/* center divider */}
      <div
        style={{
          position: "absolute",
          left: 960,
          top: 140,
          bottom: 140,
          width: 6,
          translate: "-50% 0",
          borderRadius: 3,
          background: "rgba(255,255,255,0.25)",
          scale: `1 ${split}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 960,
          top: 540,
          translate: "-50% -50%",
          width: 130,
          height: 130,
          borderRadius: "50%",
          background: C.pink,
          color: C.white,
          fontFamily: HEEBO,
          fontWeight: 900,
          fontSize: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 12px 36px rgba(0,0,0,0.4)",
          scale: `${pop(frame, fps, f(5.5), 10)}`,
        }}
      >
        או
      </div>

      {/* left panel: power bank + USB */}
      <div style={{ position: "absolute", left: 480, top: 260, translate: "-50% -50%" }}>
        <Headline text="Power Bank" start={f(7.3)} size={84} highlight={["Bank"]} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 600, translate: `-50% -50%`, scale: `${pb}` }}>
        <PowerBank width={190} leds={4} />
      </div>
      <div style={{ position: "absolute", left: 650, top: 520, translate: "-50% -50%", scale: `${fanIn}` }}>
        <Fan size={300} spin={spin} cable={false} />
      </div>
      {/* USB cable from fan to power bank port */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path
          d="M 700 680 C 700 820, 420 860, 380 760 C 340 660, 300 470, 300 432"
          stroke="#111"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - cable}
        />
        <rect x={286} y={398} width={28} height={36} rx={4} fill="#151515" opacity={cable > 0.95 ? 1 : 0} />
      </svg>
      <Callout text="דרך כבל ה-USB" x={780} y={800} start={f(10.2)} size={40} />
      <Callout text="רק אם הדגם תומך בכך" x={480} y={912} start={f(12.9)} color={C.pink} textColor={C.white} size={46} />

      <StepBadge n={2} title="מקור חשמל" start={f(0.2)} end={dur + 20} />
    </AbsoluteFill>
  );
};
