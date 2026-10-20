import React, { useMemo } from "react";
import * as THREE from "three";
import { useNylon } from "./FabricPanel";

/**
 * A costume opening closed by a drawstring: a stitched channel hem around the opening,
 * a flat cord leaving through two metal eyelets and a spring cord lock. `tighten` (0..1)
 * slides the cord lock up and gathers the hem gently (radius shrinks ~15%, never to a
 * tight closure) — the instruction is "gently, not over-tightened".
 */
export const LOCK_X = 0.72;
/** Yoke panel around the opening (relative to its centre): its bottom edge is the seam to the zipper panels. */
export const PANEL_HALF_W = 2.4;
export const PANEL_DOWN = 1.45;
export const PANEL_UP = 1.8;
export const lockYFor = (tighten: number) => -0.98 + 0.3 * tighten;

export const Drawstring: React.FC<{ tighten: number; center: [number, number, number] }> = ({ tighten, center }) => {
  const nylon = useNylon([], 1.2);
  const R = 0.62 - 0.1 * tighten;
  const ring = useMemo(() => new THREE.RingGeometry(0.5, 1.45, 260, 48), []);
  const base = useMemo(() => Float32Array.from(ring.attributes.position.array as Float32Array), [ring]);
  {
    const p = ring.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x0 = base[i * 3];
      const y0 = base[i * 3 + 1];
      const r0 = Math.hypot(x0, y0);
      const a = Math.atan2(y0, x0);
      // map the ring between the hem and a rectangular yoke panel (seam at the bottom edge)
      const t = (r0 - 0.5) / 0.95;
      const ca = Math.abs(Math.cos(a)) || 1e-6;
      const sa = Math.abs(Math.sin(a)) || 1e-6;
      const d = Math.min(PANEL_HALF_W / ca, (Math.sin(a) < 0 ? PANEL_DOWN : PANEL_UP) / sa);
      const r = R + 0.04 + t * (d - R - 0.04);
      const near = Math.exp(-t * 5);
      const pleat = Math.sin(a * 30 + Math.sin(a * 5) * 2) * 0.016 * tighten * near + Math.sin(a * 9 + 1) * 0.006 * near;
      const x = Math.cos(a) * r;
      // match the zipper panels' body curvature so the two surfaces read as one garment
      const z = 0.014 + pleat - x * x * 0.05;
      p.setXYZ(i, x, Math.sin(a) * r, z);
    }
    p.needsUpdate = true;
    ring.computeVertexNormals();
  }
  // channel hem: a tube around the opening, pleated as it gathers
  const hem = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 240; i++) {
      const a = (i / 240) * Math.PI * 2;
      const rr = R + Math.sin(a * 30 + Math.sin(a * 5) * 2) * 0.006 * tighten;
      pts.push(new THREE.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, 0.03));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 480, 0.038, 12, true);
  }, [R, tighten]);
  // cord from the two eyelets down into the cord lock, then two loose ends
  const A0 = -Math.PI / 2 + 0.85;
  const eyeA = new THREE.Vector3(Math.cos(A0 - 0.11) * R, Math.sin(A0 - 0.11) * R, 0.06);
  const eyeB = new THREE.Vector3(Math.cos(A0 + 0.11) * R, Math.sin(A0 + 0.11) * R, 0.06);
  const lockY = lockYFor(tighten);
  const lock = new THREE.Vector3(LOCK_X, lockY, 0.1);
  const strand = (from: THREE.Vector3, side: number) =>
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(
        [from, new THREE.Vector3(LOCK_X + side * 0.04, (from.y + lockY) / 2, 0.11), lock.clone().add(new THREE.Vector3(side * 0.012, 0.06, 0)), lock.clone().add(new THREE.Vector3(side * 0.012, -0.08, 0)), new THREE.Vector3(LOCK_X + side * 0.06, lockY - 0.42, 0.07)],
        false,
        "centripetal",
      ),
      120,
      0.016,
      8,
      false,
    );
  const strands = [strand(eyeA, -1), strand(eyeB, 1)];
  const cordMat = <meshPhysicalMaterial color="#e8e6e0" roughness={0.8} sheen={0.6} sheenColor="#ffffff" />;
  const metal = <meshPhysicalMaterial color="#b8bec8" metalness={1} roughness={0.28} />;
  return (
    <group position={center}>
      {nylon ? <mesh geometry={ring} material={nylon} castShadow receiveShadow /> : null}
      {/* horizontal seam binding where the yoke meets the zipper panels */}
      <mesh position={[0, -PANEL_DOWN, 0.012]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, PANEL_HALF_W * 2, 24]} />
        <meshPhysicalMaterial color="#a65a1a" roughness={0.65} sheen={0.3} sheenColor="#ffc58a" />
      </mesh>
      <mesh geometry={hem} castShadow receiveShadow>
        <meshPhysicalMaterial color="#b9661f" roughness={0.6} sheen={0.3} sheenColor="#ffc58a" />
      </mesh>
      {/* opening interior */}
      <mesh position={[0, 0, -0.12]}>
        <circleGeometry args={[R + 0.02, 96]} />
        <meshStandardMaterial color="#0d0704" roughness={1} />
      </mesh>
      {[eyeA, eyeB].map((e, i) => (
        <mesh key={i} position={e}>
          <torusGeometry args={[0.03, 0.011, 10, 24]} />
          {metal}
        </mesh>
      ))}
      {strands.map((g, i) => (
        <mesh key={i} geometry={g} castShadow>
          {cordMat}
        </mesh>
      ))}
      {/* spring cord lock */}
      <group position={lock}>
        <mesh castShadow>
          <cylinderGeometry args={[0.055, 0.06, 0.15, 28]} />
          <meshPhysicalMaterial color="#17181c" roughness={0.42} clearcoat={0.4} />
        </mesh>
        <mesh position={[0, 0.095, 0]} castShadow>
          <cylinderGeometry args={[0.042, 0.042, 0.04, 24]} />
          <meshPhysicalMaterial color="#2a2c32" roughness={0.38} clearcoat={0.4} />
        </mesh>
      </group>
      {/* aglets on the cord ends */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[LOCK_X + s * 0.06, lockY - 0.44, 0.07]}>
          <cylinderGeometry args={[0.02, 0.02, 0.07, 12]} />
          <meshStandardMaterial color="#1b1c20" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};
