import React, { useMemo } from "react";
import * as THREE from "three";
import { METAL_NICKEL, RUBBER_BLACK } from "../materials";

/** A USB-A male plug: overmoulded black boot + nickel shell with the plastic tongue. Points along +Y. */
export const UsbPlug: React.FC<{ position?: THREE.Vector3; quaternion?: THREE.Quaternion; shadow?: boolean }> = ({ position, quaternion, shadow = true }) => (
  <group position={position} quaternion={quaternion}>
    <mesh position={[0, 0.09, 0]} castShadow={shadow}>
      <boxGeometry args={[0.16, 0.18, 0.09]} />
      <meshPhysicalMaterial {...RUBBER_BLACK} />
    </mesh>
    <mesh position={[0, 0.03, 0]}>
      <cylinderGeometry args={[0.03, 0.05, 0.08, 16]} />
      <meshPhysicalMaterial {...RUBBER_BLACK} />
    </mesh>
    <mesh position={[0, 0.25, 0]} castShadow={shadow}>
      <boxGeometry args={[0.12, 0.14, 0.045]} />
      <meshStandardMaterial {...METAL_NICKEL} />
    </mesh>
    <mesh position={[0, 0.26, 0.004]}>
      <boxGeometry args={[0.1, 0.12, 0.016]} />
      <meshStandardMaterial color="#f2f2ef" roughness={0.5} />
    </mesh>
  </group>
);

/**
 * Flexible cable along a centripetal Catmull-Rom path. `reveal` (0..1) grows the cable
 * along its length so the camera can follow it being "drawn" into the next shot.
 */
export const Cable: React.FC<{ points: [number, number, number][]; radius?: number; reveal?: number; plug?: boolean; shadow?: boolean }> = ({
  points,
  radius = 0.022,
  reveal = 1,
  plug = false,
  shadow = true,
}) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "centripetal"), [points]);
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 240, radius, 14, false), [curve, radius]);
  const total = geo.index ? geo.index.count : 0;
  const count = Math.max(0, Math.floor((total * Math.min(1, Math.max(0, reveal))) / 6) * 6);
  const end = curve.getPoint(Math.min(1, reveal));
  const tan = curve.getTangent(Math.min(1, Math.max(0.001, reveal)));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
  // grow the tube along its length (frame-driven)
  geo.setDrawRange(0, count);
  return (
    <group>
      <mesh geometry={geo} castShadow={shadow} receiveShadow>
        <meshPhysicalMaterial {...RUBBER_BLACK} />
      </mesh>
      {plug && reveal >= 0.999 ? <UsbPlug position={end} quaternion={q} /> : null}
    </group>
  );
};
