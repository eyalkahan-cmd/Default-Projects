import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, EASE_IN_OUT, EASE_OUT, pop } from "../components/anim";
import { BatteryBox, BatteryBoxBack } from "../components/BatteryBox";
import { Fan } from "../components/Fan";
import { BrandBg, Callout, Check, Headline, StepBadge } from "../components/ui";
import { C, f, HEEBO } from "../theme";

/** 25.85–31.41s: "לאחר מכן, ודאו שכבל המאוורר מחובר למקור החשמל," */
const Cable: React.FC = () => {
  const frame = useCurrentFrame();
  const plug = interpolate(frame, [f(1.4), f(2.6)], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const fanIn = pop(useCurrentFrame(), useVideoConfig().fps, 2, 14);
  const glow = interpolate(frame, [f(2.6), f(3.0), f(4.2)], [0, 1, 0.4], clamp);
  return (
    <AbsoluteFill>
      <BrandBg spot={{ x: 0.5, y: 0.55 }} />
      <div style={{ position: "absolute", left: 640, top: 560, translate: "-50% -50%", scale: `${fanIn}` }}>
        <Fan size={480} spin={frame * 4} cable={false} />
      </div>
      {/* cable from the blower over to the battery box port */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path
          d={`M 700 770 C 760 980, 1180 980, 1230 760 C 1260 620, 1300 ${360 + (1 - plug) * -90}, 1300 ${330 + (1 - plug) * -90}`}
          stroke="#111"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: "absolute", left: 1300, top: 640, translate: "-50% -50%" }}>
        <BatteryBox width={300} plug={plug} />
        <div
          style={{
            position: "absolute",
            left: 150,
            top: 70,
            width: 140,
            height: 140,
            translate: "-50% -50%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.yellow} 0%, rgba(255,224,0,0) 70%)`,
            opacity: glow,
          }}
        />
      </div>
      <Callout text="מחברים את כבל המאוורר" x={960} y={180} start={f(0.8)} color={C.yellow} size={54} />
      <Check size={110} start={f(2.8)} style={{ position: "absolute", left: 1420, top: 330 }} />
    </AbsoluteFill>
  );
};

/** 31.41–35.25s: "היכנסו לתוך התחפושת, והניחו את קופסת הסוללות או" */
const Enter: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.navyDeep }}>
      <Img
        src={staticFile("img/trex_studio_soft.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: `${interpolate(frame, [0, f(3.84)], [1.0, 1.12], clamp)}`,
          transformOrigin: "75% 40%",
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-start", paddingLeft: 130 }}>
        <div style={{ width: 900 }}>
          <Headline text="נכנסים לתחפושת" start={4} size={130} highlight={["לתחפושת"]} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 35.25–42.31s: "...סוללת הגיבוי בכיס הפנימי, או הצמידו אותה לחגורה בעזרת הקליפס, בהתאם לדגם." */
const PocketOrClip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inPocket = interpolate(frame, [f(1.1), f(1.9)], [0, 1], { ...clamp, easing: EASE_OUT });
  const onBelt = interpolate(frame, [f(2.8), f(3.6)], [0, 1], { ...clamp, easing: EASE_OUT });
  const leftIn = pop(frame, fps, f(2.4), 14);
  return (
    <AbsoluteFill>
      <BrandBg />
      {/* right: inner pocket */}
      <div style={{ position: "absolute", left: 1440, top: 610, translate: "-50% -50%", scale: "0.92" }}>
        <div
          style={{
            width: 620,
            height: 640,
            borderRadius: 40,
            background: "linear-gradient(160deg, #D9822B 0%, #B5651D 60%, #8A4A14 100%)",
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.35), 0 30px 60px rgba(0,0,0,0.4)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", left: 120, top: 300, width: 380, height: 300, borderRadius: "0 0 30px 30px", border: "6px dashed #4A2208", borderTop: "none" }} />
          <div style={{ position: "absolute", left: 310, top: 300, translate: `-50% ${interpolate(inPocket, [0, 1], [-420, -40])}px` }}>
            <BatteryBox width={200} />
          </div>
          {/* pocket front flap covering the lower part of the box */}
          <div style={{ position: "absolute", left: 126, top: 410, width: 368, height: 184, background: "linear-gradient(180deg, #C46F22, #9C5418)", borderRadius: "0 0 24px 24px", opacity: inPocket }} />
        </div>
        <div style={{ position: "absolute", top: -90, left: 0, right: 0, textAlign: "center", direction: "rtl", fontFamily: HEEBO, fontWeight: 900, fontSize: 64, color: C.white }}>
          בכיס הפנימי
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 960,
          top: 540,
          translate: "-50% -50%",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: C.pink,
          color: C.white,
          fontFamily: HEEBO,
          fontWeight: 900,
          fontSize: 58,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: `${pop(frame, fps, f(2.3), 10)}`,
        }}
      >
        או
      </div>

      {/* left: belt clip */}
      <div style={{ position: "absolute", left: 480, top: 610, translate: "-50% -50%", scale: `${leftIn * 0.92}` }}>
        <div style={{ width: 620, height: 640, position: "relative" }}>
          <div style={{ position: "absolute", left: -40, right: -40, top: 300, height: 110, background: "linear-gradient(180deg, #3B2A1E, #1E140D)", borderRadius: 12, boxShadow: "0 16px 30px rgba(0,0,0,0.45)" }} />
          <div style={{ position: "absolute", left: 310, top: 210, translate: `-50% ${interpolate(onBelt, [0, 1], [-260, 0])}px` }}>
            <BatteryBoxBack width={200} />
          </div>
        </div>
        <div style={{ position: "absolute", top: -90, left: 0, right: 0, textAlign: "center", direction: "rtl", fontFamily: HEEBO, fontWeight: 900, fontSize: 64, color: C.white }}>
          קליפס לחגורה
        </div>
      </div>
      <Check size={100} start={f(2.0)} style={{ position: "absolute", left: 1700, top: 330 }} />
      <Check size={100} start={f(3.7)} style={{ position: "absolute", left: 740, top: 330 }} />
      <Callout text="בהתאם לדגם" x={960} y={880} start={f(5.5)} color={C.yellow} size={48} />
    </AbsoluteFill>
  );
};

export const S04Wear: React.FC = () => {
  const dur = f(42.31 - 25.85);
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={f(5.56)} layout="absolute-fill">
        <Cable />
      </Sequence>
      <Sequence from={f(5.56)} durationInFrames={f(3.84)} layout="absolute-fill">
        <Enter />
      </Sequence>
      <Sequence from={f(9.4)} layout="absolute-fill">
        <PocketOrClip />
      </Sequence>
      <StepBadge n={3} title="חיבור ולבישה" start={f(0.2)} end={dur + 20} />
    </AbsoluteFill>
  );
};
