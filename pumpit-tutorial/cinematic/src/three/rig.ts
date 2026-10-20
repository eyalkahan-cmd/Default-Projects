import * as THREE from "three";

/**
 * Frame-driven virtual camera rig.
 *
 * A shot is a list of keyframes (frame, camera position, look-at target, vertical FOV).
 * Position and target each follow a centripetal Catmull-Rom spline through their keys
 * (no overshoot), and time between keys is eased per segment so the camera accelerates
 * and settles like a real dolly/crane move. Everything is a pure function of the frame,
 * so any frame can be rendered in isolation.
 */
export type V3 = [number, number, number];
export type CamKey = { f: number; pos: V3; target: V3; fov?: number; roll?: number };
export type CamState = { pos: THREE.Vector3; target: THREE.Vector3; fov: number; roll: number };

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const makeRig = (keys: CamKey[], ease: (t: number) => number = easeInOut) => {
  const posCurve = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.pos)), false, "centripetal");
  const tgtCurve = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.target)), false, "centripetal");
  const n = keys.length;
  return (frame: number): CamState => {
    if (n === 1) {
      const k = keys[0];
      return { pos: new THREE.Vector3(...k.pos), target: new THREE.Vector3(...k.target), fov: k.fov ?? 35, roll: k.roll ?? 0 };
    }
    let i = 0;
    while (i < n - 2 && frame > keys[i + 1].f) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const local = Math.min(1, Math.max(0, (frame - a.f) / Math.max(1, b.f - a.f)));
    const e = ease(local);
    // spline parameter: segment i spans [i/(n-1), (i+1)/(n-1)]
    const u = (i + e) / (n - 1);
    const fovA = a.fov ?? 35;
    const fovB = b.fov ?? fovA;
    const rollA = a.roll ?? 0;
    const rollB = b.roll ?? rollA;
    return {
      pos: posCurve.getPoint(u),
      target: tgtCurve.getPoint(u),
      fov: fovA + (fovB - fovA) * e,
      roll: rollA + (rollB - rollA) * e,
    };
  };
};

/** Apply a rig state to a three.js perspective camera. */
export const applyCam = (cam: THREE.PerspectiveCamera, s: CamState, aspect: number) => {
  cam.position.copy(s.pos);
  cam.up.set(Math.sin(s.roll), Math.cos(s.roll), 0);
  cam.lookAt(s.target);
  cam.fov = s.fov;
  cam.aspect = aspect;
  cam.near = 0.01;
  cam.far = 200;
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
};

const scratch = new THREE.PerspectiveCamera();
/** Project a world point to screen pixels for HTML overlays (callouts stay locked to 3D objects). */
export const project = (p: V3 | THREE.Vector3, s: CamState, w: number, h: number) => {
  applyCam(scratch, s, w / h);
  const v = (p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(...p)).project(scratch);
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, behind: v.z > 1 };
};
