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

export const RINGS = 180;
export const SEG = 72;
/** Spine: rear body at x = -3 → tail tip at x = 8. */
export const spineX = (u: number) => -3 + u * 11;
/** Tube radius along the spine (body → tapering tail). */
export const radiusAt = (u: number) => 0.06 + 2.0 * Math.pow(1 - u, 1.15);

/**
 * The costume's rear body and tail as one inflatable nylon envelope.
 * `p` (0..1) is the internal pressure: at 0 the fabric lies on the floor flattened and
 * deeply wrinkled; as p rises the cross-section rounds out, the folds pull smooth and the
 * tail lifts off the floor — the way thin ripstop actually fills (no uniform scaling).
 * `xray` (0..1) makes the envelope translucent to show the airflow inside.
 */
export const InflatableBody: React.FC<{ p: number; xray?: number; floorY: number }> = ({ p, xray = 0, floorY }) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array((RINGS + 1) * (SEG + 1) * 3);
    const uv = new Float32Array((RINGS + 1) * (SEG + 1) * 2);
    const idx: number[] = [];
    for (let i = 0; i <= RINGS; i++) {
      for (let j = 0; j <= SEG; j++) {
        const k = i * (SEG + 1) + j;
        uv[k * 2] = (i / RINGS) * 5.5;
        uv[k * 2 + 1] = (j / SEG) * 2.2;
        if (i < RINGS && j < SEG) {
          const a = k;
          const b = k + SEG + 1;
          idx.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
  }, []);

  // reshape every frame from the pressure value
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const empty = Math.pow(1 - p, 1.4);
  for (let i = 0; i <= RINGS; i++) {
    const u = i / RINGS;
    const r = radiusAt(u);
    const x = spineX(u);
    const sy = 0.3 + 0.7 * Math.pow(p, 0.8); // flattened when empty
    const sz = 1.25 - 0.25 * Math.pow(p, 0.8); // spreads sideways on the floor when empty
    // tail lifts as it fills (tip rises), body sits on the floor
    const lift = Math.pow(p, 1.3) * Math.pow(u, 1.6) * 1.1;
    const cy = floorY + r * sy + lift;
    for (let j = 0; j <= SEG; j++) {
      const th = (j / SEG) * Math.PI * 2;
      const wr =
        empty *
        ((noise(u * 26, j * 0.35) - 0.5) * 0.5 + Math.sin(u * 140 + Math.sin(th * 3) * 2) * 0.12 + (noise(u * 70 + 5, j * 0.9) - 0.5) * 0.18);
      const rr = r * (1 + wr * 0.35);
      let y = cy + Math.sin(th) * rr * sy;
      const z = Math.cos(th) * rr * sz;
      if (y < floorY + 0.005) y = floorY + 0.005; // fabric rests on the floor
      const k = i * (SEG + 1) + j;
      pos.setXYZ(k, x + wr * 0.05, y, z);
    }
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: getTex("tex/trex_print.jpg", 1),
        normalMap: getTex("tex/ripstop_normal.png", 14, false),
        normalScale: new THREE.Vector2(0.25, 0.25),
        roughness: 0.48,
        sheen: 0.25,
        sheenRoughness: 0.45,
        sheenColor: new THREE.Color("#ffc58a"),
        clearcoat: 0.12,
        clearcoatRoughness: 0.5,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: true,
      }),
    [],
  );
  mat.opacity = 1 - 0.72 * xray;
  mat.depthWrite = xray < 0.05;
  return <mesh geometry={geo} material={mat} castShadow={xray < 0.5} receiveShadow />;
};

/** Point on the body surface (for mounting the blower and anchoring callouts). */
export const surfacePoint = (u: number, th: number, p: number, floorY: number) => {
  const r = radiusAt(u);
  const sy = 0.3 + 0.7 * Math.pow(p, 0.8);
  const sz = 1.25 - 0.25 * Math.pow(p, 0.8);
  const lift = Math.pow(p, 1.3) * Math.pow(u, 1.6) * 1.1;
  const cy = floorY + r * sy + lift;
  return new THREE.Vector3(spineX(u), cy + Math.sin(th) * r * sy, Math.cos(th) * r * sz);
};
