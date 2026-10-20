import { useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
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
  if (!lights) return null;
  return (
    <>
      <hemisphereLight args={["#cfe3ff", "#0a1430", 0.25]} />
      <directionalLight
        position={keyPos}
        intensity={keyIntensity}
        color="#fff4e8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-radius={6}
        shadow-bias={-0.0004}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <directionalLight position={rimPos} intensity={1.6} color="#7fc4ff" />
      <pointLight position={[-3, 1, 3]} intensity={6} distance={12} color="#ffcf9a" />
      {floor && floorStyle === "glossy" ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, 0]} receiveShadow>
          <circleGeometry args={[40, 128]} />
          <meshPhysicalMaterial color="#0a2560" roughness={0.42} metalness={0} clearcoat={0.35} clearcoatRoughness={0.3} envMapIntensity={0.5} />
        </mesh>
      ) : null}
      {floor ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY + 0.001, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <shadowMaterial opacity={0.35} />
        </mesh>
      ) : null}
    </>
  );
};
