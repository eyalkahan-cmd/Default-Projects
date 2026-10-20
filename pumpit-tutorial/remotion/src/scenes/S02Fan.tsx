import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, EASE_IN_OUT, pop } from "../components/anim";
import { Fan } from "../components/Fan";
import { Callout, StepBadge } from "../components/ui";
import { C, f } from "../theme";

// Fan intake position on the hero still (normalized), lower back above the tail base,
// matching the user's placement reference (fan_placement_trex_exterior.png).
export const FAN_SPOT = { x: 0.815, y: 0.66 };

/** 6.35–11.91s: "תחילה, ודאו שהמאוורר מותקן היטב בפתח הייעודי של התחפושת." */
export const S02Fan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = f(11.91 - 6.35);
  const push = interpolate(frame, [0, f(1.6)], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const scale = interpolate(push, [0, 1], [1.04, 1.45]);
  const bubble = pop(frame, fps, f(1.2), 13);
  const spin = interpolate(frame, [0, dur], [0, 1400]);
  const spotX = FAN_SPOT.x * 1920;
  const spotY = FAN_SPOT.y * 1080;
  // where the spot lands after the push (transform-origin = spot)
  const bx = 640;
  const by = 520;
  const br = 290;

  return (
    <AbsoluteFill style={{ backgroundColor: C.navyDeep }}>
      <AbsoluteFill style={{ transformOrigin: `${FAN_SPOT.x * 100}% ${FAN_SPOT.y * 100}%`, scale: `${scale}` }}>
        <Img src={staticFile("img/trex_studio_inflated.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {/* the intake grille on the costume */}
        <div style={{ position: "absolute", left: spotX, top: spotY, translate: "-50% -50%" }}>
          <Fan size={78} body={false} spin={spin} cable={false} />
        </div>
        {/* pulse ring on the spot */}
        <div
          style={{
            position: "absolute",
            left: spotX,
            top: spotY,
            width: 120,
            height: 120,
            translate: "-50% -50%",
            borderRadius: "50%",
            border: `5px solid ${C.yellow}`,
            opacity: interpolate((frame % 30) / 30, [0, 1], [0.9, 0]) * push,
            scale: `${interpolate((frame % 30) / 30, [0, 1], [0.6, 1.6])}`,
          }}
        />
      </AbsoluteFill>

      {/* pointer line from spot to magnifier */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: bubble }}>
        <line
          x1={spotX}
          y1={spotY}
          x2={bx + br * 0.92}
          y2={by + br * 0.35}
          stroke={C.yellow}
          strokeWidth={6}
          strokeDasharray="14 10"
        />
        <circle cx={spotX} cy={spotY} r={12} fill={C.yellow} />
      </svg>

      {/* magnifier bubble with the real blower look */}
      <div
        style={{
          position: "absolute",
          left: bx - br,
          top: by - br,
          width: br * 2,
          height: br * 2,
          borderRadius: "50%",
          overflow: "hidden",
          border: `12px solid ${C.white}`,
          boxShadow: `0 0 0 10px ${C.yellow}, 0 30px 60px rgba(0,0,0,0.5)`,
          scale: `${bubble}`,
          background: `radial-gradient(circle at 50% 50%, #D9822B 0%, #B5651D 55%, #8A4A14 100%)`,
        }}
      >
        {/* costume fabric stripes */}
        <svg width={br * 2} height={br * 2} style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path
              key={i}
              d={`M ${-40 + i * 90} ${br * 2 + 20} C ${40 + i * 80} ${br * 1.2}, ${i * 95} ${br * 0.8}, ${90 + i * 85} -20`}
              stroke="#4A2208"
              strokeWidth={10 + (i % 3) * 6}
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div style={{ position: "absolute", left: br, top: br, translate: "-50% -50%" }}>
          <Fan size={460} body={false} spin={spin} cable={false} />
        </div>
      </div>

      <Callout text="בפתח הייעודי" x={bx} y={by + br + 70} start={f(2.6)} color={C.yellow} size={46} />

      <StepBadge n={1} title="התקנת המאוורר" start={f(0.4)} end={dur + 20} />
    </AbsoluteFill>
  );
};
