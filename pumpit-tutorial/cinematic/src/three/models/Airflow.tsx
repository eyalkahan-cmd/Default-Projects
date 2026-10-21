import React, { useMemo } from "react";
import * as THREE from "three";
import { look } from "../../theme";

/**
 * Restrained airflow visualisation: a few streamlines from the intake into the envelope and
 * along the tail, each carrying evenly spaced pulses that travel with `t` (seconds).
 * Cyan is reserved for air/technical information across the whole film.
 */
export const Airflow: React.FC<{ paths: THREE.Vector3[][]; t: number; opacity: number; color?: string; pulse?: string }> = ({ paths, t, opacity, color, pulse }) => {
  const curves = useMemo(() => paths.map((pts) => new THREE.CatmullRomCurve3(pts, false, "centripetal")), [paths]);
  const lineGeos = useMemo(() => curves.map((c) => new THREE.TubeGeometry(c, 160, 0.005, 6, false)), [curves]);
  const pulseGeo = useMemo(() => new THREE.CapsuleGeometry(0.014, 0.1, 4, 8), []);
  if (opacity <= 0.001) return null;
  const L = look();
  const blending = L.airAdditive ? THREE.AdditiveBlending : THREE.NormalBlending;
  return (
    <group>
      {lineGeos.map((g, i) => (
        <mesh key={`l${i}`} geometry={g}>
          <meshBasicMaterial color={color ?? L.air} transparent opacity={(L.airAdditive ? 0.28 : 0.45) * opacity} depthWrite={false} blending={blending} />
        </mesh>
      ))}
      {curves.map((c, i) =>
        new Array(6).fill(0).map((_, k) => {
          const u = (t * 0.32 + k / 6 + i * 0.13) % 1;
          const p = c.getPoint(u);
          const tan = c.getTangent(u);
          const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
          const fade = Math.sin(Math.PI * u);
          return (
            <mesh key={`p${i}-${k}`} geometry={pulseGeo} position={p} quaternion={q}>
              <meshBasicMaterial color={pulse ?? L.airPulse} transparent opacity={0.75 * opacity * fade} depthWrite={false} blending={blending} />
            </mesh>
          );
        }),
      )}
    </group>
  );
};
