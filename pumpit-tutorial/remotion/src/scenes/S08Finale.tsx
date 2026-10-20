import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, EASE_OUT, pop } from "../components/anim";
import { Fan } from "../components/Fan";
import { Confetti, Headline } from "../components/ui";
import { C, f, HEEBO } from "../theme";

const CAST = [
  { src: "cut/giraffe.png", x: 1640, h: 700, d: 6 },
  { src: "cut/alien_spotted.png", x: 1290, h: 560, d: 10 },
  { src: "cut/group_a.png", x: 820, h: 760, d: 0 },
  { src: "cut/alien_astro.png", x: 340, h: 560, d: 12 },
];

/**
 * 77.93–86.67s: "וזהו! אתם מוכנים לגנוב את ההצגה! רק זכרו להשאיר את המאוורר פועל כל זמן שאתם לובשים את התחפושת."
 */
export const S08Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flash = interpolate(frame, [0, 8], [1, 0], clamp);
  const remind = f(4.06); // "רק זכרו"
  const card = pop(frame, fps, remind, 13);
  const castOut = interpolate(frame, [remind - 4, remind + 10], [0, 1], { ...clamp, easing: EASE_OUT });

  return (
    <AbsoluteFill style={{ backgroundColor: C.navyDeep }}>
      <AbsoluteFill style={{ scale: `${interpolate(frame, [0, f(8.7)], [1.0, 1.08])}` }}>
        <Img src={staticFile("img/bg_stage.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,27,78,0.1) 0%, rgba(3,27,78,0.6) 100%)" }} />
      </AbsoluteFill>

      {/* the cast bounces in */}
      <AbsoluteFill style={{ filter: `blur(${castOut * 8}px)`, opacity: 1 - castOut * 0.55 }}>
        {CAST.map((c, i) => {
          const p = pop(frame, fps, c.d, 9);
          const bob = Math.sin((frame + i * 9) / 6) * 10;
          return (
            <Img
              key={c.src}
              src={staticFile(c.src)}
              style={{
                position: "absolute",
                left: c.x,
                bottom: 20,
                height: c.h,
                translate: `-50% ${interpolate(p, [0, 1], [600, 0]) + bob}px`,
                filter: "drop-shadow(0 24px 24px rgba(0,0,0,0.5))",
              }}
            />
          );
        })}
      </AbsoluteFill>
      <Confetti start={2} count={110} seed={3} />
      <Confetti start={f(1.8)} count={70} seed={7} />

      <div style={{ position: "absolute", top: 70, left: 0, right: 0, opacity: 1 - castOut }}>
        <Headline text="מוכנים לגנוב את ההצגה!" start={f(1.7)} size={112} stagger={5} highlight={["ההצגה!"]} />
      </div>

      {/* the key reminder */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            direction: "rtl",
            display: "flex",
            alignItems: "center",
            gap: 50,
            padding: "50px 80px",
            borderRadius: 56,
            background: C.yellow,
            boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
            scale: `${card}`,
            opacity: interpolate(card, [0, 0.2], [0, 1], clamp),
            rotate: `${interpolate(card, [0, 1], [-6, 0])}deg`,
          }}
        >
          <Fan size={260} spin={frame * 26} cable={false} />
          <div style={{ fontFamily: HEEBO, color: C.navyDeep }}>
            <div style={{ fontSize: 104, fontWeight: 900, lineHeight: 1.05 }}>משאירים את</div>
            <div style={{ fontSize: 104, fontWeight: 900, lineHeight: 1.05 }}>
              המאוורר <span style={{ color: C.pink }}>פועל!</span>
            </div>
            <div style={{ fontSize: 44, fontWeight: 700, marginTop: 14 }}>כל זמן שלובשים את התחפושת</div>
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ backgroundColor: C.white, opacity: flash }} />
    </AbsoluteFill>
  );
};
