import React, { useMemo } from "react";
import * as THREE from "three";
import { PLASTIC_DARK, PLASTIC_ORANGE } from "../materials";

/**
 * The costume blower, modelled from the user's product photos (data/fan_hardware_spec.md):
 * ~10 cm centrifugal "snail" housing in orange plastic, scalloped/ribbed rim, round intake
 * with a 16-spoke radial grille and a hub, impeller visible behind the grille, rectangular
 * outlet nozzle with horizontal vents at the lower left, domed motor cover at the back.
 * Units: 1 = 10 cm. Intake faces +Z.
 */
export const Blower: React.FC<{ spin?: number; position?: [number, number, number]; rotation?: [number, number, number]; scale?: number }> = ({
  spin = 0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  const ring = useMemo(() => {
    const s = new THREE.Shape();
    s.absarc(0, 0, 0.42, 0, Math.PI * 2, false);
    const h = new THREE.Path();
    h.absarc(0, 0, 0.3, 0, Math.PI * 2, true);
    s.holes.push(h);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.26, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 4, curveSegments: 96 });
    g.translate(0, 0, -0.13);
    return g;
  }, []);
  const volute = useMemo(() => {
    // the snail bulge: an offset, slightly larger disc fused to the body toward the outlet
    const s = new THREE.Shape();
    s.absarc(-0.035, -0.045, 0.43, 0, Math.PI * 2, false);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 96 });
    g.translate(0, 0, -0.14);
    return g;
  }, []);
  const outlet = useMemo(() => {
    const w = 0.34;
    const h = 0.2;
    const r = 0.04;
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 });
    g.translate(0, 0, -0.11);
    return g;
  }, []);
  const blade = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0.06, 0, 0), new THREE.Vector3(0.17, 0.07, 0), new THREE.Vector3(0.27, 0.03, 0));
    return new THREE.TubeGeometry(curve, 16, 0.012, 6, false);
  }, []);

  const orange = <meshPhysicalMaterial {...PLASTIC_ORANGE} />;
  const shade = <meshPhysicalMaterial {...PLASTIC_ORANGE} color="#D9560C" />;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={ring} castShadow receiveShadow>
        {orange}
      </mesh>
      <mesh geometry={volute} castShadow receiveShadow>
        {shade}
      </mesh>
      {/* scalloped / ribbed rim */}
      {new Array(22).fill(0).map((_, i) => {
        const a = (i / 22) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.435, Math.sin(a) * 0.435 - 0.02, 0.075]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <capsuleGeometry args={[0.026, 0.07, 6, 12]} />
            {shade}
          </mesh>
        );
      })}
      {/* outlet nozzle, lower left, with horizontal vents */}
      <mesh geometry={outlet} position={[-0.42, -0.3, 0]} castShadow receiveShadow>
        {shade}
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.615, -0.37 + i * 0.045, 0]}>
          <boxGeometry args={[0.01, 0.022, 0.2]} />
          <meshStandardMaterial {...PLASTIC_DARK} color="#5a2306" />
        </mesh>
      ))}
      {/* back plate + domed motor cover */}
      <mesh position={[0, 0, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.03, 96]} />
        {shade}
      </mesh>
      <mesh position={[0, 0, -0.17]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.45, 1]} castShadow>
        <sphereGeometry args={[0.26, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {orange}
      </mesh>
      {/* dark interior seen through the intake */}
      <mesh position={[0, 0, -0.11]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.01, 64]} />
        <meshStandardMaterial color="#3b1503" roughness={0.8} />
      </mesh>
      {/* impeller (spins) */}
      <group position={[0, 0, -0.04]} rotation={[0, 0, spin]}>
        {new Array(14).fill(0).map((_, i) => (
          <mesh key={i} geometry={blade} rotation={[0, 0, (i / 14) * Math.PI * 2]}>
            <meshPhysicalMaterial {...PLASTIC_ORANGE} color="#B9480D" />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.06, 32]} />
          <meshPhysicalMaterial {...PLASTIC_ORANGE} color="#C7520D" />
        </mesh>
      </group>
      {/* intake grille: outer ring, inner ring, 16 radial spokes, hub */}
      <mesh position={[0, 0, 0.15]}>
        <torusGeometry args={[0.3, 0.022, 16, 96]} />
        {orange}
      </mesh>
      <mesh position={[0, 0, 0.14]}>
        <torusGeometry args={[0.18, 0.012, 12, 72]} />
        {orange}
      </mesh>
      {new Array(16).fill(0).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.17, Math.sin(a) * 0.17, 0.14]} rotation={[0, 0, a]} castShadow>
            <boxGeometry args={[0.27, 0.016, 0.022]} />
            {orange}
          </mesh>
        );
      })}
      <mesh position={[0, 0, 0.145]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.03, 32]} />
        {orange}
      </mesh>
      {/* screw bosses */}
      {[
        [0.33, -0.3],
        [-0.25, 0.36],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.02, 20]} />
          <meshStandardMaterial color="#8b3a08" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};
