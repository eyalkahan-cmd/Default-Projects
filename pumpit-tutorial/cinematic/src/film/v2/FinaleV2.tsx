import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { Backdrop, LensFinish } from "../../overlay/Overlay";
import { C, HEEBO, look } from "../../theme";
import { IMG_H, IMG_W } from "../../three/models/DeflatingCostume";
import { Character } from "../Character";
import { BEAT, clamp, KineticWord, puff, PuffyBlob, settle, SPRING_OBJECT } from "../motion";
import { useFrame } from "../time";

// photo aspect ratios (width / height) of the cut-outs
const ASPECT = { unicorn: 0.7192, dino_blue: 0.7, trex: IMG_W / IMG_H, astronaut: 0.6987, giraffe: 0.6959 };

const LINEUP: { src: string; h: number; cx: number; aspect: number }[] = [
  { src: "cut/unicorn.png", h: 600, cx: 330, aspect: ASPECT.unicorn },
  { src: "cut/dino_blue.png", h: 660, cx: 640, aspect: ASPECT.dino_blue },
  { src: "img/trex_cutout_v2.png", h: 760, cx: 960, aspect: ASPECT.trex },
  { src: "cut/astronaut.png", h: 650, cx: 1280, aspect: ASPECT.astronaut },
  { src: "cut/giraffe.png", h: 640, cx: 1590, aspect: ASPECT.giraffe },
];

/** "אתם מוכנים לגנוב את ההצגה!" — costumes puff up into a line-up, one per half-beat, centre out. */
export const LineupV2: React.FC = () => {
  const frame = useFrame();
  return (
    <AbsoluteFill>
      <Backdrop x={0.5} y={0.5} />
      <PuffyBlob x={960} y={640} r={520} color="#dcedff" scale={puff(frame, 0, SPRING_OBJECT)} />
      <PuffyBlob x={150} y={250} r={70} color={C.yellow} scale={puff(frame, 6, SPRING_OBJECT)} />
      <PuffyBlob x={1780} y={300} r={90} color={C.pink} scale={puff(frame, 9, SPRING_OBJECT)} />
      {LINEUP.map((p, i) => {
        const st = Math.abs(i - 2) * (BEAT / 2);
        return <Character key={p.src} src={p.src} aspect={p.aspect} height={p.h} cx={p.cx} floor={1010} scale={1 + 0.0006 * frame} appear={settle(frame, st)} phase={i * 11} />;
      })}
      <KineticWord text="מוכנים לגנוב את ההצגה!" start={8} end={200} x={960} y={150} size={104} />
      <LensFinish />
    </AbsoluteFill>
  );
};

/** End card: the Pumpit logo inflates (overshoot with squash, settles with a soft wobble). */
export const EndCardV2: React.FC = () => {
  const frame = useFrame();
  const L = look();
  const p = settle(frame, 4);
  const wob = Math.sin(Math.max(0, frame - 18) / 4) * Math.exp(-Math.max(0, frame - 18) / 18) * 0.03;
  const sub = puff(frame, 22);
  const blob = puff(frame, 0, SPRING_OBJECT);
  return (
    <AbsoluteFill>
      <Backdrop x={0.5} y={0.45} />
      <PuffyBlob x={960} y={500} r={480} color="#dcedff" scale={blob} />
      <Img
        src={staticFile("img/logo.png")}
        style={{
          position: "absolute",
          left: 960,
          top: 470,
          width: 900,
          transform: `translate(-50%, -50%) scale(${p * (1 + wob)}, ${p * (1 - wob)})`,
          filter: "drop-shadow(0 18px 30px rgba(11,31,77,0.18))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 720,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: HEEBO,
          fontSize: 48,
          fontWeight: 700,
          color: L.text,
          letterSpacing: 1,
          transform: `scale(${sub})`,
          opacity: interpolate(frame, [22, 26], [0, 1], clamp),
        }}
      >
        pumpit.co.il
      </div>
      <LensFinish />
    </AbsoluteFill>
  );
};
