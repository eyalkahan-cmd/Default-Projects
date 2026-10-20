import React, { useMemo } from "react";
import * as THREE from "three";
import { getTex } from "../materials";
import { useNylon } from "./FabricPanel";

/**
 * A costume zipper in macro: two nylon panels in the T-Rex print, woven tapes, moulded
 * plastic teeth that interlock below the slider and separate into a "V" above it,
 * a gunmetal slider with its pull tab, and two rows of top-stitching.
 * The chain runs along +Y on the surface z = 0. `slider` is the slider's Y position.
 */
const PITCH = 0.034;
const Y0 = -2.2;
const Y1 = 2.1;
const N = Math.floor((Y1 - Y0) / PITCH);

/** How far each side has moved apart at height y (0 below the slider). */
export const gapAt = (y: number, slider: number) => Math.min(0.32, Math.max(0, y - slider) * 0.16);

export const Zipper: React.FC<{ slider: number; clip?: THREE.Plane[] }> = ({ slider, clip = [] }) => {
  const nylon = useNylon(clip, 1.2);
  const tapeMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#22252b",
        roughness: 0.78,
        normalMap: getTex("tex/tape_normal.png", 10, false),
        normalScale: new THREE.Vector2(0.6, 0.6),
        sheen: 0.3,
        sheenColor: new THREE.Color("#8a93a3"),
        side: THREE.DoubleSide,
      }),
    [],
  );
  const toothMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#141518", roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.3 }), []);
  const stitchMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e9e2d2", roughness: 0.7 }), []);

  // Panels: a single geometry per side, re-shaped every frame to open above the slider.
  const panels = useMemo(() => {
    const make = () => new THREE.PlaneGeometry(1.7, Y1 - Y0 + 0.4, 90, 240);
    return [make(), make()];
  }, []);
  const base = useMemo(() => panels.map((g) => Float32Array.from(g.attributes.position.array as Float32Array)), [panels]);
  panels.forEach((g, side) => {
    const sgn = side === 0 ? -1 : 1;
    const p = g.attributes.position;
    const b = base[side];
    for (let i = 0; i < p.count; i++) {
      const lx = b[i * 3];
      const y = b[i * 3 + 1];
      const x = sgn * (0.13 + 0.85 + lx * 1); // inner edge at |x| = 0.13
      const gap = gapAt(y, slider);
      const inner = Math.exp(-Math.abs(x - sgn * 0.13) * 2.2);
      const xx = x + sgn * gap * inner;
      // gentle body curvature + fabric drape
      const z = -xx * xx * 0.05 + Math.sin(y * 2.3 + sgn) * 0.012 + Math.sin(xx * 6 + y) * 0.006 - gap * inner * 0.08;
      p.setXYZ(i, xx, y, z);
    }
    p.needsUpdate = true;
    g.computeVertexNormals();
  });

  // Teeth + tapes + stitches as instanced meshes, re-laid out each frame.
  const toothGeo = useMemo(() => {
    const g = new THREE.CapsuleGeometry(0.011, 0.034, 4, 10);
    g.rotateZ(Math.PI / 2);
    g.scale(1, 1, 0.55);
    return g;
  }, []);
  const teeth = useMemo(() => new THREE.InstancedMesh(toothGeo, toothMat, N * 2), [toothGeo, toothMat]);
  const stitchGeo = useMemo(() => new THREE.CapsuleGeometry(0.0035, 0.02, 3, 6), []);
  const stitches = useMemo(() => new THREE.InstancedMesh(stitchGeo, stitchMat, N * 4), [stitchGeo, stitchMat]);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sc = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < N; i++) {
    for (let side = 0; side < 2; side++) {
      const sgn = side === 0 ? -1 : 1;
      const y = Y0 + i * PITCH + (side ? PITCH / 2 : 0);
      const gap = gapAt(y, slider);
      // closed: teeth reach across the centre line and interleave; open: they ride on their tape
      const x = sgn * (0.015 + gap) - sgn * 0.003;
      const z = -(0.015 + gap) * (0.015 + gap) * 0.05 + 0.009 - gap * 0.08;
      m.compose(new THREE.Vector3(x, y, z), q.setFromEuler(new THREE.Euler(0, 0, sgn * gap * 0.6)), sc);
      teeth.setMatrixAt(i * 2 + side, m);
      for (let row = 0; row < 2; row++) {
        const sx = sgn * (0.07 + row * 0.05 + gap);
        m.compose(new THREE.Vector3(sx, y, z + 0.006), q.identity(), sc);
        stitches.setMatrixAt(i * 4 + side * 2 + row, m);
      }
    }
  }
  teeth.instanceMatrix.needsUpdate = true;
  stitches.instanceMatrix.needsUpdate = true;

  // Tapes: two ribbon strips following the gap.
  const tapes = useMemo(() => [new THREE.PlaneGeometry(0.12, Y1 - Y0, 1, 240), new THREE.PlaneGeometry(0.12, Y1 - Y0, 1, 240)], []);
  const tapeBase = useMemo(() => tapes.map((g) => Float32Array.from(g.attributes.position.array as Float32Array)), [tapes]);
  tapes.forEach((g, side) => {
    const sgn = side === 0 ? -1 : 1;
    const p = g.attributes.position;
    const b = tapeBase[side];
    for (let i = 0; i < p.count; i++) {
      const lx = b[i * 3];
      const y = b[i * 3 + 1];
      const gap = gapAt(y, slider);
      const x = sgn * (0.07 + lx * 1 + gap);
      p.setXYZ(i, x, y, -x * x * 0.05 + 0.004 - gap * 0.08);
    }
    p.needsUpdate = true;
    g.computeVertexNormals();
  });

  return (
    <group>
      {nylon ? panels.map((g, i) => <mesh key={i} geometry={g} material={nylon} castShadow receiveShadow />) : null}
      {tapes.map((g, i) => (
        <mesh key={i} geometry={g} material={tapeMat} receiveShadow />
      ))}
      <primitive object={teeth} castShadow />
      <primitive object={stitches} />
      {/* dark costume interior visible where the chain is open */}
      <mesh position={[0, 0, -0.09]}>
        <planeGeometry args={[1.2, Y1 - Y0]} />
        <meshStandardMaterial color="#120a06" roughness={1} />
      </mesh>
      <Slider y={slider} />
      {[-1, 1].map((sg) => (
        <mesh key={sg} position={[sg * 0.02, Y1 + 0.02, 0.012]} castShadow>
          <boxGeometry args={[0.02, 0.03, 0.016]} />
          <meshPhysicalMaterial color="#5d6470" metalness={1} roughness={0.32} />
        </mesh>
      ))}
    </group>
  );
};

/** Gunmetal slider with a hinged pull tab. */
const Slider: React.FC<{ y: number }> = ({ y }) => {
  const body = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.055, 0.05);
    s.lineTo(0.055, 0.05);
    s.lineTo(0.036, -0.065);
    s.lineTo(-0.036, -0.065);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: true, bevelSize: 0.009, bevelThickness: 0.009, bevelSegments: 4 });
  }, []);
  const tab = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.024, 0);
    s.lineTo(0.024, 0);
    s.lineTo(0.032, -0.14);
    s.quadraticCurveTo(0, -0.165, -0.032, -0.14);
    s.closePath();
    const hole = new THREE.Path();
    hole.absellipse(0, -0.12, 0.012, 0.02, 0, Math.PI * 2, true, 0);
    s.holes.push(hole);
    return new THREE.ExtrudeGeometry(s, { depth: 0.014, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 3 });
  }, []);
  const metal = <meshPhysicalMaterial color="#5d6470" metalness={1} roughness={0.32} clearcoat={0.2} />;
  return (
    <group position={[0, y, 0.02]}>
      <mesh geometry={body} castShadow>
        {metal}
      </mesh>
      <mesh position={[0, -0.015, 0.055]} rotation={[0.35, 0, 0]} geometry={tab} castShadow>
        {metal}
      </mesh>
      <mesh position={[0, -0.008, 0.05]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.014, 0.004, 8, 20]} />
        {metal}
      </mesh>
    </group>
  );
};
