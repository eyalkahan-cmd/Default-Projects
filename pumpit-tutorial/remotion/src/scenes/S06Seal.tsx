import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, EASE_IN_OUT, EASE_OUT, pop } from "../components/anim";
import { BrandBg, Callout, Check, Headline, StepBadge } from "../components/ui";
import { C, f, HEEBO } from "../theme";

const FABRIC = "linear-gradient(160deg, #E08A30 0%, #C46F22 55%, #9C5418 100%)";

const Panel: React.FC<{ children: React.ReactNode; enter: number }> = ({ children, enter }) => (
  <div
    style={{
      position: "absolute",
      left: 560,
      top: 560,
      width: 760,
      height: 760,
      translate: "-50% -50%",
      borderRadius: 48,
      overflow: "hidden",
      background: FABRIC,
      boxShadow: "inset 0 0 80px rgba(0,0,0,0.35), 0 40px 80px rgba(0,0,0,0.5)",
      scale: `${enter}`,
    }}
  >
    {/* print stripes */}
    <svg width={760} height={760} style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={i} d={`M ${i * 110 - 60} 800 C ${i * 100} 500, ${i * 120 - 40} 300, ${i * 105 + 30} -40`} stroke="#4A2208" strokeWidth={8 + (i % 3) * 5} fill="none" />
      ))}
    </svg>
    {children}
  </div>
);

const TextSide: React.FC<{ title: string; start: number; hl: string[] }> = ({ title, start, hl }) => (
  <div style={{ position: "absolute", left: 1000, right: 80, top: 330 }}>
    <Headline text={title} start={start} size={104} highlight={hl} style={{ justifyContent: "flex-start" }} />
  </div>
);

/** 50.51–54.33s: "לכן, סגרו את הרוכסן עד הסוף," */
const Zip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = pop(frame, fps, 0, 14);
  const z = interpolate(frame, [f(1.0), f(3.0)], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const sliderY = interpolate(z, [0, 1], [700, 60]);
  const teeth = 30;
  return (
    <AbsoluteFill>
      <BrandBg />
      <Panel enter={enter}>
        {new Array(teeth).fill(0).map((_, i) => {
          const y = 40 + i * 23;
          const open = y < sliderY ? interpolate(sliderY - y, [0, 400], [6, 70], clamp) : 0;
          return (
            <React.Fragment key={i}>
              <div style={{ position: "absolute", left: 380 - 22 - open, top: y, width: 22, height: 12, background: "#2A2A2A", borderRadius: 2 }} />
              <div style={{ position: "absolute", left: 380 + open, top: y + 11, width: 22, height: 12, background: "#2A2A2A", borderRadius: 2 }} />
            </React.Fragment>
          );
        })}
        {/* slider */}
        <div style={{ position: "absolute", left: 380, top: sliderY, translate: "-50% -50%", width: 70, height: 90, borderRadius: 14, background: "linear-gradient(90deg, #8E959E, #E1E5EA, #8E959E)", boxShadow: "0 8px 16px rgba(0,0,0,0.5)" }}>
          <div style={{ position: "absolute", left: 22, top: 70, width: 26, height: 60, borderRadius: 8, background: "linear-gradient(90deg, #8E959E, #D3D8DE)" }} />
        </div>
      </Panel>
      <TextSide title="סוגרים את הרוכסן עד הסוף" start={f(0.9)} hl={["הרוכסן"]} />
      <Check size={130} start={f(3.0)} style={{ position: "absolute", left: 860, top: 200 }} />
    </AbsoluteFill>
  );
};

/** 54.33–59.77s: "ודאו שהגומיות סביב פתחי התחפושת יושבות בצורה צמודה ונוחה." */
const Elastic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = pop(frame, fps, 0, 14);
  const snug = interpolate(frame, [f(1.2), f(2.6)], [0, 1], { ...clamp, easing: EASE_OUT });
  const cuffGap = interpolate(snug, [0, 1], [70, 4]);
  return (
    <AbsoluteFill>
      <BrandBg />
      <Panel enter={enter}>
        {/* forearm (skin) entering from the left through the sleeve cuff */}
        <div style={{ position: "absolute", left: -40, top: 320, width: 560, height: 150, borderRadius: 75, background: "linear-gradient(180deg, #F2C29B, #D9A07A)" }} />
        <div style={{ position: "absolute", left: 470, top: 300, width: 140, height: 190, borderRadius: 60, background: "linear-gradient(180deg, #F2C29B, #D9A07A)" }} />
        {/* sleeve + elastic cuff ring */}
        <div style={{ position: "absolute", left: -40, top: 320 - cuffGap, width: 380, height: 150 + cuffGap * 2, borderRadius: 40, background: "linear-gradient(180deg, #E59440, #B5651D)", boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }} />
        <div
          style={{
            position: "absolute",
            left: 310,
            top: 320 - cuffGap,
            width: 54,
            height: 150 + cuffGap * 2,
            borderRadius: 24,
            background: "repeating-linear-gradient(180deg, #A0561A 0px, #A0561A 6px, #7E4012 6px, #7E4012 12px)",
          }}
        />
        {/* air leaking through the gap while loose */}
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: 380 + ((frame * 6 + i * 40) % 120), top: 300 - cuffGap * 0.6 + i * 6, width: 60, height: 8, borderRadius: 4, background: C.red, opacity: (1 - snug) * 0.8 }} />
        ))}
      </Panel>
      <TextSide title="גומיות צמודות ונוחות" start={f(0.4)} hl={["צמודות"]} />
      <Callout text="מוודאים אטימה נוחה" x={1420} y={700} start={f(2.4)} color={C.yellow} size={48} />
      <Check size={130} start={f(2.7)} style={{ position: "absolute", left: 860, top: 200 }} />
    </AbsoluteFill>
  );
};

/** 59.77–66.45s: "ואם קיימים שרוכים או רצועות הידוק, התאימו אותם בעדינות, בלי להדק יתר על המידה." */
const Straps: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = pop(frame, fps, 0, 14);
  const pull = interpolate(frame, [f(2.6), f(3.8)], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  // needle: loose (-60deg) → comfortable (0deg), never into the red zone
  const needle = interpolate(pull, [0, 1], [-62, 0]) + Math.sin(frame / 5) * 2 * pull;
  return (
    <AbsoluteFill>
      <BrandBg />
      <Panel enter={enter}>
        {/* drawstring channel around an opening */}
        <div style={{ position: "absolute", left: 160, top: 120, width: 440, height: 300, borderRadius: "50%", background: "#3A1E0A", boxShadow: "inset 0 0 40px rgba(0,0,0,0.6)", scale: `${1 - pull * 0.12}` }} />
        <div style={{ position: "absolute", left: 140, top: 100, width: 480, height: 340, borderRadius: "50%", border: "16px solid #F4F1EA", scale: `${1 - pull * 0.12}` }} />
        {/* cord ends + toggle */}
        <svg width={760} height={760} style={{ position: "absolute", inset: 0 }}>
          <path d={`M 360 430 C 350 520, ${330 - pull * 10} 600, ${320 - pull * 10} 700`} stroke="#F4F1EA" strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d={`M 400 430 C 410 520, ${430 + pull * 10} 600, ${440 + pull * 10} 700`} stroke="#F4F1EA" strokeWidth={14} fill="none" strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", left: 380, top: interpolate(pull, [0, 1], [640, 500]), translate: "-50% -50%", width: 70, height: 96, borderRadius: 20, background: "#1E1E1E", boxShadow: "0 8px 16px rgba(0,0,0,0.5)" }} />
      </Panel>
      <TextSide title="מהדקים בעדינות" start={f(0.4)} hl={["בעדינות"]} />
      {/* comfort gauge */}
      <div style={{ position: "absolute", left: 1420, top: 690, translate: "-50% -50%", scale: `${pop(frame, fps, f(1.6), 14)}` }}>
        <svg width={460} height={260} viewBox="0 0 460 260">
          <path d="M 40 230 A 190 190 0 0 1 135 65" stroke="#9AA4B2" strokeWidth={40} fill="none" />
          <path d="M 135 65 A 190 190 0 0 1 325 65" stroke={C.green} strokeWidth={40} fill="none" />
          <path d="M 325 65 A 190 190 0 0 1 420 230" stroke={C.red} strokeWidth={40} fill="none" />
          <g transform={`rotate(${needle} 230 230)`}>
            <line x1={230} y1={230} x2={230} y2={70} stroke={C.white} strokeWidth={10} strokeLinecap="round" />
          </g>
          <circle cx={230} cy={230} r={18} fill={C.white} />
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", direction: "rtl", fontFamily: HEEBO, fontWeight: 800, fontSize: 32, color: C.white, marginTop: 6 }}>
          <span style={{ color: C.red }}>הדוק מדי</span>
          <span style={{ color: C.green }}>נוח</span>
          <span style={{ color: "#C5CCD6" }}>רפוי</span>
        </div>
      </div>
      <Callout text="בלי להדק יתר על המידה" x={1420} y={935} start={f(4.0)} color={C.pink} textColor={C.white} size={42} />
    </AbsoluteFill>
  );
};

export const S06Seal: React.FC = () => {
  const dur = f(66.45 - 50.51);
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={f(3.82)} layout="absolute-fill">
        <Zip />
      </Sequence>
      <Sequence from={f(3.82)} durationInFrames={f(5.44)} layout="absolute-fill">
        <Elastic />
      </Sequence>
      <Sequence from={f(9.26)} layout="absolute-fill">
        <Straps />
      </Sequence>
      <StepBadge n={4} title="אטימה" start={f(0.2)} end={dur + 20} />
    </AbsoluteFill>
  );
};
