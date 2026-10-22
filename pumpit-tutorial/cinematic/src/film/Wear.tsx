import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Backdrop, Callout, Chapter, LensFinish } from "../overlay/Overlay";
import { look } from "../theme";
import { getTex, Preload } from "../three/materials";
import { useNylon } from "../three/models/FabricPanel";
import { DeflatingCostume } from "../three/models/DeflatingCostume";
import { BatteryPack } from "../three/models/PowerSources";
import { CamKey, makeRig, project } from "../three/rig";
import { CameraDriver, Studio } from "../three/Studio";
import { useFrame } from "./time";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * WEAR A (30.58–34.6 s): "היכנסו לתוך התחפושת…" — the real costume, still empty and slack, on the
 * light studio floor. (Placeholder for the live-action/Kling wearer shot planned for later.)
 */
export const WearIn: React.FC<{ keys?: CamKey[]; chrome?: boolean }> = ({ keys, chrome = true }) => {
  const frame = useFrame();
  const { width, height } = useVideoConfig();
  const rig = useMemo(
    () =>
      makeRig(keys ?? [
        { f: 0, pos: [0.25, 0.1, 6.4], target: [0.05, -0.1, 0], fov: 34 },
        { f: 130, pos: [0.1, 0.05, 5.5], target: [0.05, -0.05, 0], fov: 34 },
      ]),
    [keys],
  );
  const cam = rig(frame);
  const p = project([0.15, 0.35, 0.1], cam, width, height);
  return (
    <AbsoluteFill>
      <Backdrop x={0.5} y={0.42} />
      <Preload>
        <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }}>
          <CameraDriver state={cam} />
          <Studio lights={false} />
          <mesh position={[0.05, -1.49, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.32, 1]}>
            <circleGeometry args={[0.95, 48]} />
            <meshBasicMaterial color="#0b1f4d" transparent opacity={0.22} depthWrite={false} />
          </mesh>
          <DeflatingCostume pressure={0.08} height={3} />
        </ThreeCanvas>
      </Preload>
      {chrome ? <Callout at={p} dx={-330} dy={-60} start={12} title="נכנסים לתחפושת" sub="המאוורר עדיין כבוי" /> : null}
      {chrome ? (
      <Chapter n="03" title="לובשים" start={4} end={130} />
      ) : null}
      <LensFinish />
    </AbsoluteFill>
  );
};

/** A patch pocket sewn on the costume's inner lining: back panel + front patch with a bound opening. */
const Pocket: React.FC = () => {
  const lining = useNylon([], 1);
  const front = useMemo(() => {
    const m = lining.clone();
    m.color = new THREE.Color("#e8e2da");
    return m;
  }, [lining]);
  // side gussets: the same nylon in shadow, so they read as fabric, not card
  const gusset = useMemo(() => {
    const m = lining.clone();
    m.color = new THREE.Color("#b9ad9e");
    return m;
  }, [lining]);
  return (
    <group>
      <mesh position={[0, 0, -0.16]} material={lining} receiveShadow>
        <planeGeometry args={[4.2, 3.2, 1, 1]} />
      </mesh>
      {/* front patch: covers the lower part of the pack once it is inside */}
      <mesh position={[0, -0.35, 0.33]} material={front} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.9, 0.012]} />
      </mesh>
      {/* bound opening along the top edge of the patch */}
      <mesh position={[0, 0.1, 0.335]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.016, 0.98, 4, 12]} />
        <meshPhysicalMaterial color="#1a2a55" roughness={0.6} sheen={0.3} />
      </mesh>
      {/* side seams joining patch to lining */}
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, -0.35, 0.085]} material={gusset}>
          <boxGeometry args={[0.006, 0.9, 0.5]} />
        </mesh>
      ))}
    </group>
  );
};

/** A real waist belt: a curved band of navy webbing (section of a ~1.6 m-girth loop) with stitched edges. */
const Belt: React.FC<{ y: number }> = ({ y }) => {
  const R = 1.55;
  const geo = useMemo(() => new THREE.CylinderGeometry(R, R, 0.22, 96, 1, true, -0.62, 1.24), []);
  const stitch = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 80; i++) {
      const a = -0.6 + (1.2 * i) / 80;
      pts.push(new THREE.Vector3(Math.sin(a) * (R + 0.004), 0, Math.cos(a) * (R + 0.004)));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.004, 5, false);
  }, []);
  const weave = getTex("tex/tape_normal.png", 1, false);
  weave.repeat.set(40, 2);
  return (
    <group position={[0, y, 0.135 - R]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial color="#26304a" roughness={0.8} sheen={0.5} sheenColor={new THREE.Color("#7f8fb5")} normalMap={weave} normalScale={new THREE.Vector2(0.6, 0.6)} side={THREE.DoubleSide} />
      </mesh>
      {[-0.085, 0.085].map((dy) => (
        <mesh key={dy} geometry={stitch} position={[0, dy, 0]}>
          <meshStandardMaterial color="#c9d2e6" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
};

/**
 * WEAR B (34.6–42.04 s): "…בכיס הפנימי" — the pack (lid on) slides down into the inner pocket →
 * "או הצמידו אותה לחגורה בעזרת הקליפס" — it rises out, turns to show the belt clip on its back,
 * and clips onto a belt. One continuous camera.
 */
export const WearPack: React.FC<{ keys?: CamKey[]; chrome?: boolean }> = ({ keys, chrome = true }) => {
  const frame = useFrame();
  const { width, height } = useVideoConfig();
  const L = look();
  // phase 1: into the pocket (0–90); phase 2: out, turn, onto the belt (110–200)
  const into = smooth(interpolate(frame, [8, 70], [0, 1], clamp));
  const out = smooth(interpolate(frame, [104, 140], [0, 1], clamp));
  const turn = smooth(interpolate(frame, [120, 165], [0, 1], clamp));
  const onBelt = smooth(interpolate(frame, [168, 205], [0, 1], clamp));
  const pocketO = 1 - smooth(interpolate(frame, [100, 125], [0, 1], clamp));
  const beltIn = smooth(interpolate(frame, [110, 150], [0, 1], clamp));
  const packY = 1.25 - into * 1.15 + out * 1.0 - onBelt * 0.55;
  const packX = out * 1.3;
  const rotY = turn * Math.PI;

  const rig = useMemo(
    () =>
      makeRig(keys ?? [
        { f: 0, pos: [0.55, 0.45, 3.2], target: [0, 0.25, 0], fov: 32 },
        { f: 95, pos: [0.4, 0.2, 2.8], target: [0, 0.0, 0], fov: 32 },
        { f: 150, pos: [1.6, 0.95, 3.6], target: [1.25, 0.8, -0.1], fov: 32 },
        { f: 240, pos: [1.8, 0.75, 2.7], target: [1.3, 0.55, 0], fov: 32 },
      ]),
    [keys],
  );
  const cam = rig(frame);
  const pPocket = project([0, -0.2, 0.2], cam, width, height);
  // after the half turn the clip faces the camera (+z)
  const pClip = project([packX, packY + 0.1, 0.17], cam, width, height);

  return (
    <AbsoluteFill>
      <Backdrop x={0.5} y={0.45} />
      <Preload>
        <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} shadows>
          <CameraDriver state={cam} />
          <Studio keyPos={[2, 3.5, 3.5]} rimPos={[-3, 2.5, -3]} floor={false} />
          {pocketO > 0.01 ? (
            <group scale={[1, 1, 1]} position={[0, 0, (1 - pocketO) * -0.6]}>
              <Pocket />
            </group>
          ) : null}
          {beltIn > 0.01 ? (
            <group position={[1.3 + (1 - beltIn) * 4, 0, 0]}>
              <Belt y={0.62} />
            </group>
          ) : null}
          <group position={[packX, packY, 0]} rotation={[0, rotY, 0]} scale={0.85}>
            <BatteryPack clip />
          </group>
        </ThreeCanvas>
      </Preload>
      <Callout at={pPocket} dx={-300} dy={-120} start={40} end={104} title="בכיס הפנימי" sub="קופסת הסוללות או סוללת הגיבוי" />
      <Callout at={pClip} dx={-260} dy={-170} start={176} title="קליפס לחגורה" sub="בהתאם לדגם" accent={L.air} />
      {chrome ? (
      <Chapter n="03" title="לובשים" start={0} end={226} />
      ) : null}
      <LensFinish />
    </AbsoluteFill>
  );
};
