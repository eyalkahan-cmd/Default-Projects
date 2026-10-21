import { useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { look } from "../theme";
import { applyCam, CamState } from "./rig";

/** Drives the R3F default camera from a rig state (called every rendered frame). */
export const CameraDriver: React.FC<{ state: CamState }> = ({ state }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  applyCam(camera, state, size.width / size.height);
  return null;
};

/**
 * Product-studio lighting: an image-based environment (procedural room, no downloads)
 * for believable reflections, a soft key with shadows, a cool rim and a warm fill.
 */
export const Studio: React.FC<{
  keyPos?: [number, number, number];
  rimPos?: [number, number, number];
  envIntensity?: number;
  floorY?: number;
  floor?: boolean;
  keyIntensity?: number;
  /** false: only set up the environment/renderer (the scene brings its own lights). */
  lights?: boolean;
  /** "glossy" adds a visible dark studio floor with soft env reflections (objects resting on it). */
  floorStyle?: "shadow" | "glossy";
}> = ({ keyPos = [3, 5, 4], rimPos = [-4, 3, -4], envIntensity = 0.55, floorY = -1, floor = true, keyIntensity = 2.4, lights = true, floorStyle = "shadow" }) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return tex;
  }, [gl]);
  useLayoutEffect(() => {
    scene.environment = env;
    scene.environmentIntensity = envIntensity;
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = 0.9;
    gl.localClippingEnabled = true;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [env, envIntensity, gl, scene]);
  // radial alpha falloff so the glossy floor melts into the CSS cyclorama (no hard horizon line)
  const floorFade = useMemo(() => {
    const n = 256;
    const d = new Uint8Array(n * n * 4);
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const r = Math.hypot(i / (n - 1) - 0.5, j / (n - 1) - 0.5) * 2;
        const t = Math.min(1, Math.max(0, (r - 0.3) / 0.7));
        const a = Math.round(255 * (1 - t * t * (3 - 2 * t)));
        d.set([a, a, a, 255], (j * n + i) * 4);
      }
    const tex = new THREE.DataTexture(d, n, n);
    tex.needsUpdate = true;
    return tex;
  }, []);
  if (!lights) return null;
  return (
    <>
      <hemisphereLight args={[look().hemiSky, look().hemiGround, look().hemi]} />
      <directionalLight
        position={keyPos}
        intensity={keyIntensity}
        color="#fff4e8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-radius={8}
        shadow-bias={-0.0004}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-far={40}
      />
      <directionalLight position={rimPos} intensity={1.6} color="#7fc4ff" />
      <pointLight position={[-3, 1, 3]} intensity={6} distance={12} color="#ffcf9a" />
      {floor && floorStyle === "glossy" ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, 0]} receiveShadow>
          <circleGeometry args={[11, 128]} />
          <meshPhysicalMaterial color={look().floor} roughness={0.42} metalness={0} clearcoat={0.35} clearcoatRoughness={0.3} envMapIntensity={0.5} alphaMap={floorFade} transparent depthWrite={false} />
        </mesh>
      ) : null}
      {floor ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY + 0.001, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          {/* lighter on the bright cyclorama, where a dark shadow would read as a floating stain */}
          <shadowMaterial opacity={look().id === "daylight" ? 0.2 : 0.35} />
        </mesh>
      ) : null}
    </>
  );
};
