import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { Backdrop, LensFinish } from "../../overlay/Overlay";
import { C, HEEBO, look } from "../../theme";
import { Photo } from "../Opening";
import { BEAT, clamp, KineticWord, puff, PuffyBlob } from "../motion";
import { useFrame } from "../time";

const LINEUP: { src: string; h: number; cx: number }[] = [
  { src: "cut/unicorn.png", h: 600, cx: 330 },
  { src: "cut/dino_blue.png", h: 660, cx: 640 },
  { src: "img/trex_cutout_v2.png", h: 760, cx: 960 },
  { src: "cut/astronaut.png", h: 650, cx: 1280 },
  { src: "cut/giraffe.png", h: 640, cx: 1590 },
];

/** "אתם מוכנים לגנוב את ההצגה!" — costumes puff up into a line-up, one per half-beat, centre out. */
export const LineupV2: React.FC = () => {
  const frame = useFrame();
  return (
    <AbsoluteFill>
      <Backdrop x={0.5} y={0.5} />
      <PuffyBlob x={960} y={640} r={520} color="#dcedff" scale={puff(frame, 0, 110)} />
      <PuffyBlob x={150} y={250} r={70} color={C.yellow} scale={puff(frame, 6, 140)} />
      <PuffyBlob x={1780} y={300} r={90} color={C.pink} scale={puff(frame, 9, 140)} />
      {LINEUP.map((p, i) => {
        const st = Math.abs(i - 2) * (BEAT / 2);
        const e = puff(frame, st, 160);
        return <Photo key={p.src} src={p.src} h={p.h} cx={p.cx} floor={1010} push={e * (1 + 0.0006 * frame)} shadow={Math.min(1, e)} />;
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
  const p = puff(frame, 4, 140);
  const wob = Math.sin(Math.max(0, frame - 18) / 4) * Math.exp(-Math.max(0, frame - 18) / 18) * 0.03;
  const sub = puff(frame, 22, 200);
  const blob = puff(frame, 0, 100);
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
