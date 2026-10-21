import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { Backdrop, LensFinish } from "../../overlay/Overlay";
import { C, HEEBO, look } from "../../theme";
import { BEAT, clamp, deflateOut, KineticWord, puff, PuffyBlob, STEPS } from "../motion";
import { useFrame } from "../time";

const CARDS = ["cut/astronaut.png", "cut/dino_blue.png", "cut/giraffe.png", "cut/unicorn.png", "cut/horse.png", "cut/peacock.png"];
const R = 600; // carousel radius (px, CSS 3D)
const CARD_W = 500;
const CARD_H = 650;

/** step the carousel one card per beat: quick move (55% of the beat), then a hold */
const carouselAngle = (frame: number, start: number) => {
  const t = Math.max(0, frame - start) / BEAT;
  const k = Math.floor(t);
  const f = t - k;
  const move = f < 0.55 ? f / 0.55 : 1;
  const e = move < 0.5 ? 4 * move ** 3 : 1 - Math.pow(-2 * move + 2, 3) / 2;
  return -(k + e) * (360 / CARDS.length);
};

/**
 * OPENING v2 (0–6.4 s): a 3D carousel of real Pumpit costumes stepping on the beat, kinetic lines
 * over it ("קניתם תחפושת מתנפחת?" / "מוכנים לגנוב את ההצגה?") → zoom-through → the T-Rex hero on
 * a puffy brand blob with the title puffing in word by word and the five steps previewed.
 */
export const OpeningV2: React.FC = () => {
  const frame = useFrame();
  const L = look();
  const HERO = 116;
  const ang = carouselAngle(frame, 8);
  const zoomOut = interpolate(frame, [HERO - 12, HERO], [0, 1], { ...clamp, easing: (t) => t * t });
  const hero = puff(frame, HERO);
  const blob = puff(frame, HERO - 2, 120);
  return (
    <AbsoluteFill>
      <Backdrop x={0.5} y={0.45} />
      {/* brand blobs drifting at the edges: playful, low-key */}
      <PuffyBlob x={150 + Math.sin(frame / 40) * 12} y={900} r={120} color={C.yellow} scale={puff(frame, 2, 120)} rot={frame * 0.2} />
      <PuffyBlob x={1790} y={760 + Math.cos(frame / 35) * 12} r={140} color={C.blue} scale={puff(frame, 5, 120)} rot={-frame * 0.15} />
      <PuffyBlob x={1840} y={430} r={55} color={C.pink} scale={puff(frame, 8, 120)} />

      {frame < HERO ? (
        <AbsoluteFill style={{ perspective: 1900, transform: `scale(${1 + zoomOut * 0.9})`, filter: zoomOut > 0.02 ? `blur(${zoomOut * 16}px)` : undefined, opacity: 1 - zoomOut * 0.6 }}>
          <div style={{ position: "absolute", left: 960, top: 640, transformStyle: "preserve-3d", transform: `translateZ(${-R * 0.25}px) rotateX(-5deg) rotateY(${ang}deg)` }}>
            {CARDS.map((src, i) => {
              const a = (i * 360) / CARDS.length;
              const ap = puff(frame, 2 + i * 2, 150);
              return (
                <div
                  key={src}
                  style={{
                    position: "absolute",
                    width: CARD_W,
                    height: CARD_H,
                    left: -CARD_W / 2,
                    top: -CARD_H / 2,
                    transform: `rotateY(${a}deg) translateZ(${R}px) scale(${ap})`,
                    backfaceVisibility: "hidden",
                    borderRadius: 36,
                    background: "linear-gradient(170deg, #ffffff 0%, #eef5fe 100%)",
                    boxShadow: "0 30px 60px rgba(11,31,77,0.18), inset 0 0 0 2px rgba(255,255,255,0.9)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ position: "absolute", left: "50%", top: "52%", width: 330, height: 330, transform: "translate(-50%,-50%)", borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, ${["#d7ecff", "#ffe9f1", "#fff6c9"][i % 3]} 0%, rgba(255,255,255,0) 70%)` }} />
                  <Img src={staticFile(src)} style={{ position: "absolute", left: "50%", bottom: 18, height: CARD_H - 40, transform: "translateX(-50%)" }} />
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      ) : null}

      <KineticWord text="קניתם תחפושת מתנפחת?" start={14} end={58} x={960} y={140} size={96} />
      <KineticWord text="מוכנים לגנוב את ההצגה?" start={60} end={HERO - 6} x={960} y={140} size={96} color={C.blue} />

      {frame >= HERO - 2 ? (
        <>
          <PuffyBlob x={640} y={560} r={360} color="#d9ecff" scale={blob} squash={1 + Math.sin(frame / 7) * 0.012} />
          <Img
            src={staticFile("img/trex_cutout_v2.png")}
            style={{ position: "absolute", left: 640, bottom: 70, height: 900, transform: `translateX(-50%) scale(${hero})`, transformOrigin: "50% 100%" }}
          />
          <div style={{ position: "absolute", right: 140, top: 300, direction: "rtl", fontFamily: HEEBO, color: L.text }}>
            {["איך מנפחים", "תחפושת מתנפחת"].map((w, i) => (
              <div key={w} style={{ fontSize: 112, fontWeight: 900, lineHeight: 1.04, letterSpacing: -1, transform: `scale(${puff(frame, HERO + 6 + i * BEAT)})`, transformOrigin: "100% 60%" }}>
                {w}
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 30, transform: `scale(${puff(frame, HERO + 6 + 2 * BEAT)})`, transformOrigin: "100% 50%" }}>
              <div style={{ fontSize: 40, fontWeight: 700, color: C.blue }}>ב-5 שלבים פשוטים</div>
              <div style={{ display: "flex", gap: 10, marginRight: 8 }}>
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      background: `radial-gradient(circle at 35% 30%, #8fd0ff 0%, ${C.blue} 60%)`,
                      transform: `scale(${puff(frame, HERO + 10 + 2 * BEAT + i * 3, 220) * deflateOut(frame, 9999)})`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
      <LensFinish />
    </AbsoluteFill>
  );
};
