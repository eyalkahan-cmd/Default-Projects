import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";

const images = new Map<string, HTMLImageElement>();

/** Texture files used by the 3D scenes; all are preloaded before any canvas mounts. */
export const TEXTURES = ["tex/trex_print.jpg", "tex/ripstop_normal.png", "tex/tape_normal.png", "img/trex_cutout_clean.png"];

/**
 * Holds the composition until every texture image is decoded, then mounts the children.
 * Mounting the 3D canvas only after this guarantees the very first WebGL frame already
 * has its materials, so any frame renders identically in isolation.
 */
export const Preload: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(() => TEXTURES.every((t) => images.has(t)));
  const [handle] = useState(() => (ready ? null : delayRender("preload textures")));
  useEffect(() => {
    if (ready) return;
    Promise.all(
      TEXTURES.map(
        (t) =>
          new Promise<void>((res, rej) => {
            const im = new Image();
            im.onload = () => {
              images.set(t, im);
              res();
            };
            im.onerror = rej;
            im.src = staticFile(t);
          }),
      ),
    ).then(() => {
      setReady(true);
      if (handle !== null) continueRender(handle);
    });
  }, [handle, ready]);
  return ready ? React.createElement(React.Fragment, null, children) : null;
};

const texCache = new Map<string, THREE.Texture>();
/** A preloaded texture (repeat-wrapped). Only call inside <Preload>. */
export const getTex = (path: string, repeat = 1, srgb = true) => {
  const key = `${path}|${repeat}|${srgb}`;
  let t = texCache.get(key);
  if (!t) {
    const im = images.get(path);
    if (!im) throw new Error(`texture not preloaded: ${path}`);
    t = new THREE.Texture(im);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    texCache.set(key, t);
  }
  return t;
};

/** Plastic of the real blower and battery pack (orange, injection-moulded, satin). */
export const PLASTIC_ORANGE = { color: "#EE6A12", roughness: 0.42, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.45 };
export const PLASTIC_DARK = { color: "#1b1d22", roughness: 0.55, metalness: 0 };
export const RUBBER_BLACK = { color: "#0f1012", roughness: 0.62, metalness: 0 };
export const METAL_NICKEL = { color: "#c9ced6", roughness: 0.28, metalness: 1 };
export const METAL_BRASS = { color: "#c8a15a", roughness: 0.3, metalness: 1 };
