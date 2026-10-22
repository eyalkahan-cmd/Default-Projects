import React from "react";
import { Img, staticFile, useVideoConfig } from "remotion";
import { CamState, project } from "../three/rig";
import { breathe } from "./motion";
import { useFrame } from "./time";

/**
 * Framing rules for every costume in the film (broadcast safe):
 * - a character's height never exceeds MAX_H of the composition height,
 * - head and feet always stay inside the SAFE_V margin at the top and bottom,
 * - all scaling happens around the feet (transformOrigin: bottom center), so the costume grows
 *   upward from the floor and its legs can never be pushed out of the bottom of the frame.
 */
export const MAX_H = 0.85;
export const SAFE_V = 0.075;

type Layout = { left: number; top: number; width: number; height: number; floor: number; scale: number };

/**
 * Where a costume photo sits for a requested size. `scale` is the creative scale (push-in,
 * appear spring…); the returned `scale` is the one actually applied after the safety cap.
 */
export const characterLayout = (o: { aspect: number; height: number; cx: number; floor?: number; scale?: number; compH: number; breathing?: boolean }): Layout => {
  const floor = Math.min(o.floor ?? o.compH * (1 - SAFE_V), o.compH * (1 - SAFE_V));
  // room above the floor line, inside the top safe margin, and never more than 85 % of the frame
  const room = Math.min(MAX_H * o.compH, floor - SAFE_V * o.compH) / (o.breathing ? 1.015 : 1);
  const wanted = o.height * (o.scale ?? 1);
  const scale = Math.min(wanted, room) / o.height;
  const width = o.height * o.aspect;
  return { left: o.cx - width / 2, top: floor - o.height, width, height: o.height, floor, scale };
};

/** map a point given as a fraction of the photo (u: 0 left → 1 right, v: 0 top → 1 bottom) to the screen */
export const characterPoint = (l: Layout, u: number, v: number, extraScale = 1) => {
  const s = l.scale * extraScale;
  const cx = l.left + l.width / 2;
  return { x: cx + (l.left + u * l.width - cx) * s, y: l.floor + (l.top + v * l.height - l.floor) * s };
};

/**
 * A real costume photograph standing on the floor: soft contact shadow, feet-anchored scale,
 * optional idle breathing. Containers are overflow-visible so nothing is clipped by a wrapper —
 * only the frame edge could clip, and the layout keeps the whole costume inside it.
 */
export const Character: React.FC<{
  src: string;
  aspect: number;
  height: number;
  cx: number;
  floor?: number;
  scale?: number;
  appear?: number;
  breathing?: boolean;
  phase?: number;
  shadow?: number;
  opacity?: number;
}> = ({ src, aspect, height, cx, floor, scale = 1, appear = 1, breathing = true, phase = 0, shadow = 1, opacity = 1 }) => {
  const frame = useFrame();
  const { height: compH } = useVideoConfig();
  const l = characterLayout({ aspect, height, cx, floor, scale, compH, breathing });
  const b = breathing ? breathe(frame + phase) : { y: 0, s: 1 };
  const s = l.scale * appear * b.s;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none", opacity }}>
      <div
        style={{
          position: "absolute",
          left: cx - l.width * 0.34 * l.scale,
          top: l.floor - 20 * l.scale,
          width: l.width * 0.68 * l.scale,
          height: 44 * l.scale,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(11,31,77,0.32), rgba(11,31,77,0))",
          opacity: shadow * Math.min(1, appear),
          // the shadow tightens a touch as the costume floats up
          transform: `scale(${Math.min(1, appear) * (1 + b.y / 120)})`,
        }}
      />
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          left: l.left,
          top: l.top,
          height: l.height,
          width: l.width,
          transform: `translateY(${b.y}px) scale(${s})`,
          transformOrigin: "50% 100%",
        }}
      />
    </div>
  );
};

/**
 * Full-body guard for the 3D costume shots. Given the projected top and bottom of the costume
 * (px), returns the correction that keeps it ≤ 85 % of the frame and inside the safe margins,
 * scaled around its feet. Close-ups (costume ≥ 2× the frame) are left alone — a macro on the
 * fan or a cuff is meant to be close — with a smooth blend in between so a camera move that
 * crosses from macro to wide never jumps.
 */
export const fullBodyFit = ({ top, bottom }: { top: number; bottom: number }, compW: number, compH: number) => {
  const h = Math.max(1, bottom - top);
  const w = Math.min(1, Math.max(0, (2.0 * compH - h) / (0.6 * compH)));
  const sFit = Math.min(1, (MAX_H * compH) / h);
  const s = 1 + w * (sFit - 1);
  // after scaling around the feet, lift the feet above the bottom margin and keep the head below the top one
  let dy = Math.min(0, compH * (1 - SAFE_V) - bottom);
  const newTop = bottom + dy - h * s;
  if (newTop < SAFE_V * compH) dy += SAFE_V * compH - newTop;
  dy *= w;
  const ox = compW / 2;
  const oy = bottom;
  return {
    style: { transform: `translateY(${dy}px) scale(${s})`, transformOrigin: `${ox}px ${oy}px`, overflow: "visible" as const },
    /** apply the same correction to a projected point (for callouts drawn outside the guard) */
    map: (p: { x: number; y: number }) => ({ x: ox + (p.x - ox) * s, y: oy + (p.y - oy) * s + dy }),
  };
};

/**
 * Projected screen-space top and bottom of a standing costume (a box of `width` × `height` whose
 * feet are at `floorY`, centred on x = 0), sampled at the front and back of its footprint so a
 * low camera's perspective on the feet is included.
 */
export const costumeExtent = (cam: CamState, compW: number, compH: number, floorY: number, height: number, width: number) => {
  let top = Infinity;
  let bottom = -Infinity;
  for (const x of [-width / 2, 0, width / 2])
    for (const z of [-0.25, 0.3])
      for (const y of [floorY, floorY + height]) {
        const p = project([x, y, z], cam, compW, compH);
        top = Math.min(top, p.y);
        bottom = Math.max(bottom, p.y);
      }
  return { top, bottom };
};
