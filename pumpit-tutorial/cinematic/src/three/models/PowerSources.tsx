import React, { useMemo } from "react";
import * as THREE from "three";
import { GRAIN_NORMAL, labelTex, METAL_NICKEL, PLASTIC_ORANGE, PLASTIC_ORANGE_MATTE } from "../materials";

const roundedRect = (w: number, h: number, r: number) => {
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
  return s;
};

/** One AA cell (14.5 × 50 mm): steel can, sleeve, raised + terminal. Points +Y at `up`. */

const AACell: React.FC<{ position: [number, number, number]; up: boolean }> = ({ position, up }) => (
  <group position={position} rotation={[0, 0, up ? 0 : Math.PI]}>
    <mesh castShadow>
      <cylinderGeometry args={[0.072, 0.072, 0.47, 32]} />
      {/* printed sleeve: "AA 1.5V" wrapping around the can */}
      <meshPhysicalMaterial
        map={labelTex([{ text: "AA  1.5V    AA  1.5V", size: 92, weight: 800, color: "#e9edf5" }], { w: 1024, h: 256, bg: "#1c2230", radius: 0 })}
        roughness={0.35}
        clearcoat={0.6}
      />
    </mesh>
    <mesh position={[0, 0.17, 0]}>
      <cylinderGeometry args={[0.0725, 0.0725, 0.12, 32]} />
      <meshPhysicalMaterial color="#c4892f" metalness={0.6} roughness={0.35} clearcoat={0.5} />
    </mesh>
    <mesh position={[0, 0.245, 0]}>
      <cylinderGeometry args={[0.028, 0.028, 0.025, 20]} />
      <meshStandardMaterial {...METAL_NICKEL} />
    </mesh>
    <mesh position={[0, -0.237, 0]}>
      <cylinderGeometry args={[0.066, 0.066, 0.006, 32]} />
      <meshStandardMaterial {...METAL_NICKEL} />
    </mesh>
  </group>
);

/**
 * The orange battery pack from the product photos and the shark reference video:
 * ~9 × 7 cm body, a tray for 4 × AA in alternating orientation with spring/flat contacts,
 * a removable lid, a USB-A socket on the top edge and a slide switch at the bottom.
 * `explode` (0..1) lifts the lid off toward the camera and raises the cells slightly.
 */
export const BatteryPack: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
  explode?: number;
  switchOn?: boolean;
  /** per-cell insertion 0 (lifted out, in front of the tray) → 1 (seated); default all seated */
  cells?: number[];
  /** show the spring belt clip on the back (only where the clip is the subject) */
  clip?: boolean;
}> = ({ position = [0, 0, 0], rotation = [0, 0, 0], explode = 0, switchOn = false, cells = [1, 1, 1, 1], clip = false }) => {
  const body = useMemo(() => {
    const s = roundedRect(0.7, 0.9, 0.09);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.0001, 0, Math.PI * 2, true);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 5, curveSegments: 20 });
    g.translate(0, 0, -0.1);
    return g;
  }, []);
  const seam = useMemo(() => {
    const outer = roundedRect(0.762, 0.962, 0.115);
    outer.holes.push(roundedRect(0.748, 0.948, 0.108) as unknown as THREE.Path);
    return new THREE.ExtrudeGeometry(outer, { depth: 0.008, bevelEnabled: false, curveSegments: 20 });
  }, []);
  const lid = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(0.66, 0.86, 0.08), { depth: 0.03, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 4, curveSegments: 20 });
    return g;
  }, []);
  const springGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      pts.push(new THREE.Vector3(Math.cos(t * Math.PI * 10) * 0.035, t * 0.05, Math.sin(t * Math.PI * 10) * 0.035));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.006, 6, false);
  }, []);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial {...PLASTIC_ORANGE_MATTE} />
      </mesh>
      {/* mould parting line: a fine dark groove around the sides */}
      <mesh geometry={seam} position={[0, 0, -0.004]}>
        <meshStandardMaterial color="#8a3a08" roughness={0.8} />
      </mesh>
      {/* four screws on the back */}
      {[
        [-0.27, 0.37],
        [0.27, 0.37],
        [-0.27, -0.37],
        [0.27, -0.37],
      ].map(([x, y], i) => (
        <group key={`sc${i}`} position={[x, y, -0.127]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.022, 0.022, 0.012, 20]} />
            <meshStandardMaterial {...METAL_NICKEL} roughness={0.35} />
          </mesh>
          <mesh position={[0, -0.007, 0]}>
            <boxGeometry args={[0.03, 0.004, 0.006]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0, -0.007, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.03, 0.004, 0.006]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      ))}
      {/* raised tray rim: the cells sit inside the pack, below the lid */}
      {[
        [0, 0.43, 0.66, 0.04],
        [0, -0.43, 0.66, 0.04],
        [0.31, 0, 0.04, 0.9],
        [-0.31, 0, 0.04, 0.9],
      ].map(([x, y, w, h], i) => (
        <mesh key={`rim${i}`} position={[x, y, 0.2]} castShadow>
          <boxGeometry args={[w, h, 0.16]} />
          <meshPhysicalMaterial {...PLASTIC_ORANGE_MATTE} />
        </mesh>
      ))}
      {/* tray recess */}
      <mesh position={[0, 0, 0.126]}>
        <boxGeometry args={[0.62, 0.8, 0.004]} />
        <meshStandardMaterial color="#7a2f06" roughness={0.75} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const up = i % 2 === 0;
        const x = -0.225 + i * 0.15;
        return (
          <group key={i}>
            {cells[i] > 0.001 ? (
              <AACell position={[x, (1 - cells[i]) * 0.12, 0.2 + explode * 0.12 + (1 - cells[i]) * 0.6]} up={up} />
            ) : null}
            {/* spring at the negative end, flat tab at the positive end */}
            <mesh geometry={springGeo} position={[x, up ? -0.36 : 0.31, 0.2]} rotation={[0, 0, 0]}>
              <meshStandardMaterial {...METAL_NICKEL} />
            </mesh>
            <mesh position={[x, up ? 0.36 : -0.36, 0.2]}>
              <boxGeometry args={[0.07, 0.012, 0.08]} />
              <meshStandardMaterial {...METAL_NICKEL} />
            </mesh>
          </group>
        );
      })}
      {/* lid lifts off toward the camera (exploded view) */}
      <group position={[-explode * 0.95, -explode * 0.05, 0.28 + explode * 0.3]} rotation={[0, explode * 0.55, -explode * 0.05]}>
        <mesh geometry={lid} castShadow>
          <meshPhysicalMaterial {...PLASTIC_ORANGE_MATTE} color="#F07A22" />
        </mesh>
        {/* pad-printed spec on the lid + thumb grip ribs */}
        <mesh position={[0, 0.12, 0.0445]}>
          <planeGeometry args={[0.46, 0.23]} />
          <meshBasicMaterial map={labelTex([{ text: "4 × AA", size: 84, weight: 800, color: "#5a2304" }, { text: "1.5V  ·  OFF / ON", size: 34, weight: 600, color: "#7a3410" }], { w: 512, h: 256 })} transparent toneMapped={false} />
        </mesh>
        {[0, 1, 2, 3, 4].map((k) => (
          <mesh key={k} position={[0, -0.18 - k * 0.035, 0.046]}>
            <boxGeometry args={[0.22, 0.012, 0.008]} />
            <meshPhysicalMaterial {...PLASTIC_ORANGE} color="#d85f10" />
          </mesh>
        ))}
      </group>
      {/* USB-A socket on the top edge */}
      <group position={[0, 0.47, 0]}>
        <mesh>
          <boxGeometry args={[0.14, 0.03, 0.065]} />
          <meshStandardMaterial {...METAL_NICKEL} />
        </mesh>
        <mesh position={[0, 0.006, 0]}>
          <boxGeometry args={[0.12, 0.03, 0.045]} />
          <meshStandardMaterial color="#0b0b0d" roughness={0.6} />
        </mesh>
      </group>
      {/* spring belt clip on the back: a flat tongue hinged near the top, its tip curling away */}
      <group position={[0, 0.3, -0.135]} visible={clip}>
        <mesh position={[0, -0.27, -0.02]} castShadow>
          <boxGeometry args={[0.3, 0.56, 0.022]} />
          <meshPhysicalMaterial color="#2a2c32" roughness={0.45} clearcoat={0.3} />
        </mesh>
        <mesh position={[0, 0.0, 0.0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 0.32, 20]} />
          <meshPhysicalMaterial color="#2a2c32" roughness={0.45} clearcoat={0.3} />
        </mesh>
        <mesh position={[0, -0.56, -0.05]} rotation={[0.6, 0, 0]}>
          <boxGeometry args={[0.3, 0.08, 0.022]} />
          <meshPhysicalMaterial color="#2a2c32" roughness={0.45} clearcoat={0.3} />
        </mesh>
      </group>
      {/* slide switch on the bottom edge */}
      <mesh position={[switchOn ? 0.04 : -0.04, -0.475, 0.03]}>
        <boxGeometry args={[0.07, 0.03, 0.05]} />
        <meshStandardMaterial color={switchOn ? "#2BD46B" : "#2a2c32"} roughness={0.5} />
      </mesh>
    </group>
  );
};

/** A generic white power bank with a USB-A port on its short edge and four charge LEDs. */
export const PowerBank: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number] }> = ({ position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const body = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(0.72, 1.36, 0.14), { depth: 0.2, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 6, curveSegments: 24 });
    g.translate(0, 0, -0.1);
    return g;
  }, []);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial color="#eef1f5" roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.25} normalMap={GRAIN_NORMAL} normalScale={new THREE.Vector2(0.08, 0.08)} />
      </mesh>
      {/* glossy front window and its seam */}
      <mesh position={[0, 0.05, 0.1315]}>
        <planeGeometry args={[0.62, 1.12]} />
        <meshPhysicalMaterial color="#f7f9fc" roughness={0.12} clearcoat={1} transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 0.1, 0.133]}>
        <planeGeometry args={[0.5, 0.25]} />
        <meshBasicMaterial map={labelTex([{ text: "10000 mAh", size: 64, weight: 700, color: "#7c8696" }, { text: "5V ⎓ 2.1A", size: 34, weight: 500, color: "#9aa4b2" }], { w: 512, h: 256 })} transparent toneMapped={false} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[-0.15 + i * 0.1, -0.5, 0.135]}>
          <mesh>
            <circleGeometry args={[0.018, 20]} />
            <meshBasicMaterial color={i < 3 ? "#38b6ff" : "#9aa4b2"} toneMapped={false} />
          </mesh>
          {i < 3 ? (
            <mesh position={[0, 0, 0.002]}>
              <circleGeometry args={[0.05, 24]} />
              <meshBasicMaterial color="#38b6ff" transparent opacity={0.22} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
          ) : null}
        </group>
      ))}
      <group position={[0, 0.7, 0]}>
        <mesh>
          <boxGeometry args={[0.14, 0.03, 0.065]} />
          <meshStandardMaterial {...METAL_NICKEL} />
        </mesh>
        <mesh position={[0, 0.006, 0]}>
          <boxGeometry args={[0.12, 0.03, 0.045]} />
          <meshStandardMaterial color="#0b0b0d" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
};
