import React, { useMemo } from "react";
import * as THREE from "three";
import { getTex } from "../materials";

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const noise = (x: number, y: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const ss = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
const bump = (c: number, w: number, x: number) => Math.exp(-Math.pow((x - c) / w, 2));

/**
 * Deflation field over the real product image (u: 0 left → 1 right, v: 0 feet → 1 head),
 * scaled by e = 1 - pressure. It encodes how this costume collapses on a standing wearer:
 * head and neck fold forward and down onto the chest, the belly narrows, the arms hang,
 * the tail drops to the floor and shortens, the legs hug the wearer's legs.
 * Returns the displaced (u, v) and a crease depth for shading.
 */
export const deflate = (u: number, v: number, e: number) => {
  let du = 0;
  let dv = 0;
  // head + neck: drop toward the chest and swing back over the body
  const top = ss(0.48, 1.0, v);
  dv -= e * 0.32 * top * top;
  du += e * 0.09 * top;
  // whole upper body narrows toward the wearer's axis
  const axis = 0.47;
  du += (axis - u) * e * 0.38 * ss(0.22, 0.6, v) * (1 - 0.4 * top);
  // belly: empties and narrows
  du += (axis - u) * e * 0.3 * bump(0.38, 0.12, v);
  // arms hang down
  dv -= e * 0.05 * bump(0.3, 0.1, u) * bump(0.38, 0.08, v);
  // legs hug the wearer
  du += (axis - u) * e * 0.12 * (1 - ss(0.12, 0.3, v));
  // tail drops to the floor and shortens
  const tail = ss(0.62, 0.95, u) * (1 - ss(0.18, 0.34, v));
  dv -= e * tail * Math.max(0, v - 0.02) * 0.85;
  du -= e * tail * 0.12;
  // creases: mostly horizontal drapes, warped by noise
  // soft drapes: a few broad horizontal folds, warped by noise (not stripes)
  const warp = noise(u * 3, v * 3) * 2.2;
  const crease = 0.65 * Math.pow(Math.abs(Math.sin(v * 17 + warp + u * 3)), 3) + 0.35 * noise(u * 9, v * 9);
  return { u: u + du, v: v + dv, crease: e * crease };
};

// clean GrabCut cutout with the full feet and claws (scripts/cutout_trex.py)
export const IMG_W = 914;
export const IMG_H = 1311;

/**
 * The real, fully inflated T-Rex (alpha cutout) on a dense mesh, deformed by `deflate`.
 * Lit with a key light so creases read as real folds; at full pressure the mesh is flat and
 * the lighting neutral, so the last frame is the untouched product photograph.
 */
export const DeflatingCostume: React.FC<{ pressure: number; height?: number; position?: [number, number, number] }> = ({
  pressure,
  height = 3,
  position = [0, 0, 0],
}) => {
  const width = (height * IMG_W) / IMG_H;
  const geo = useMemo(() => new THREE.PlaneGeometry(width, height, 180, 230), [height, width]);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  const colors = useMemo(() => {
    const c = new Float32Array(geo.attributes.position.count * 3);
    geo.setAttribute("color", new THREE.BufferAttribute(c, 3));
    return c;
  }, [geo]);
  const e = 1 - Math.min(1, pressure);
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const u = base[i * 3] / width + 0.5;
    const v = base[i * 3 + 1] / height + 0.5;
    const d = deflate(u, v, e);
    // small overshoot when the fabric snaps taut (pressure slightly > 1)
    const over = Math.max(0, pressure - 1) * 0.6;
    const uu = 0.47 + (d.u - 0.47) * (1 + over);
    p.setXYZ(i, (uu - 0.5) * width, (d.v - 0.5) * height, d.crease * 0.12);
    const shade = 1 - d.crease * 0.36;
    colors[i * 3] = shade;
    colors[i * 3 + 1] = shade;
    colors[i * 3 + 2] = shade;
  }
  p.needsUpdate = true;
  (geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <mesh geometry={geo} position={position}>
      <meshBasicMaterial map={getTex("img/trex_cutout_v2.png")} transparent alphaTest={0.02} vertexColors toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
};
