import React, { useMemo } from "react";
import * as THREE from "three";
import { getTex } from "../materials";

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
/** Smooth 2D value noise. */
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

/** Costume nylon in the real T-Rex print: woven ripstop normal, soft sheen, satin highlights. */
export const useNylon = (clip: THREE.Plane[] = [], repeat = 1.6) => {
  return useMemo(() => {
    const print = getTex("tex/trex_print.jpg", repeat);
    const weave = getTex("tex/ripstop_normal.png", repeat * 9, false);
    return new THREE.MeshPhysicalMaterial({
      map: print,
      normalMap: weave,
      normalScale: new THREE.Vector2(0.28, 0.28),
      roughness: 0.52,
      sheen: 0.22,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color("#ffc58a"),
      envMapIntensity: 0.6,
      side: THREE.DoubleSide,
      clippingPlanes: clip,
      clipShadows: true,
    });
  }, [clip, repeat]);
};

/**
 * A panel of costume fabric with the blower opening: gentle folds everywhere, radial
 * pleats gathered by the elastic around the hole, and a clean hole edge (alpha mask).
 */
export const FabricPanel: React.FC<{
  width?: number;
  height?: number;
  hole?: number;
  clip?: THREE.Plane[];
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** < 1 ghosts the nylon ("x-ray") to show what sits behind it; the elastic binding stays solid */
  opacity?: number;
}> = ({ width = 5.6, height = 3.6, hole = 0.315, clip = [], position = [0, 0, 0], rotation = [0, 0, 0], opacity = 1 }) => {
  // one print tile across the panel: the seam stays at the panel edges, never in shot
  const mat = useNylon(clip, 1);
  mat.transparent = opacity < 0.999;
  mat.opacity = opacity;
  mat.depthWrite = opacity >= 0.999;
  const alpha = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = Math.round((2048 * height) / width);
    const g = c.getContext("2d")!;
    g.fillStyle = "#fff";
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#000";
    g.beginPath();
    g.arc(c.width / 2, c.height / 2, (hole / width) * c.width, 0, Math.PI * 2);
    g.fill();
    const t = new THREE.CanvasTexture(c);
    return t;
  }, [height, hole, width]);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height, 320, 210);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const r = Math.hypot(x, y);
      const a = Math.atan2(y, x);
      // broad folds
      let z = (noise(x * 1.3 + 3, y * 1.3) - 0.5) * 0.16 + (noise(x * 3.1, y * 3.1 + 7) - 0.5) * 0.05;
      // body curvature: the panel wraps away like the costume's hip, so no edge is ever seen
      z -= x * x * 0.09 + y * y * 0.05;
      // elastic gathers: irregular radial pleats near the opening, fading outward
      const near = Math.exp(-Math.pow((r - hole) / 0.13, 2));
      const pleatAmp = 0.35 + 0.65 * noise(Math.cos(a) * 3 + 11, Math.sin(a) * 3 + 5);
      z += Math.sin(a * 19 + noise(a * 2, 1) * 4) * 0.011 * near * pleatAmp;
      // fabric pulled slightly toward the blower around the rim
      z -= 0.05 * Math.exp(-Math.pow((r - hole) / 0.09, 2));
      p.setZ(i, z);
    }
    g.computeVertexNormals();
    return g;
  }, [height, hole, width]);
  mat.alphaMap = alpha;
  mat.alphaTest = 0.5 * opacity; // scales with ghosting so the hole mask still cuts but the ghosted nylon survives
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} material={mat} castShadow receiveShadow />
      {/* elastic binding around the opening */}
      <mesh position={[0, 0, -0.035]}>
        <torusGeometry args={[hole + 0.012, 0.022, 16, 160]} />
        <meshPhysicalMaterial color="#6e3a12" roughness={0.75} sheen={0.4} clippingPlanes={clip} />
      </mesh>
    </group>
  );
};
