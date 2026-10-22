import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";

const images = new Map<string, HTMLImageElement>();

/** Texture files used by the 3D scenes; all are preloaded before any canvas mounts. */
export const TEXTURES = ["tex/trex_print.jpg", "tex/trex_print_real.jpg", "tex/ripstop_normal.png", "tex/tape_normal.png", "img/trex_cutout_clean.png", "img/trex_cutout_v2.png", "img/trex_cutout_v3.png"];

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

/** Tileable fine-grain normal map: the matte "sparkle" texture of injection-moulded plastic. */
const makeGrainNormal = (n = 256) => {
  const d = new Uint8Array(n * n * 4);
  const h = new Float32Array(n * n);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n * n; i++) h[i] = rnd();
  // two box-blur passes for a soft grain, then central-difference normals (wrapping)
  for (let pass = 0; pass < 2; pass++) {
    const c = h.slice();
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        let s = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += c[((y + dy + n) % n) * n + ((x + dx + n) % n)];
        h[y * n + x] = s / 9;
      }
  }
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const gx = h[y * n + ((x + 1) % n)] - h[y * n + ((x - 1 + n) % n)];
      const gy = h[((y + 1) % n) * n + x] - h[((y - 1 + n) % n) * n + x];
      const nx = -gx * 6;
      const ny = -gy * 6;
      const l = Math.hypot(nx, ny, 1);
      d.set([((nx / l) * 0.5 + 0.5) * 255, ((ny / l) * 0.5 + 0.5) * 255, ((1 / l) * 0.5 + 0.5) * 255, 255], (y * n + x) * 4);
    }
  const t = new THREE.DataTexture(d, n, n);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 6);
  t.needsUpdate = true;
  return t;
};
export const GRAIN_NORMAL = makeGrainNormal();
/** The same orange plastic with its moulded matte grain. */
export const PLASTIC_ORANGE_MATTE = { ...PLASTIC_ORANGE, roughness: 0.5, normalMap: GRAIN_NORMAL, normalScale: new THREE.Vector2(0.18, 0.18) };

const labelCache = new Map<string, THREE.CanvasTexture>();
/**
 * A printed label / pad-print as a texture (drawn on a canvas): lines of text with optional
 * weight/size, on a transparent or solid ground. Cached by content.
 */
export const labelTex = (
  lines: { text: string; size: number; weight?: number; color?: string; font?: string }[],
  opts: { w?: number; h?: number; bg?: string; radius?: number; align?: CanvasTextAlign } = {},
) => {
  const key = JSON.stringify([lines, opts]);
  let t = labelCache.get(key);
  if (t) return t;
  const { w = 512, h = 256, bg, radius = 24, align = "center" } = opts;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  if (bg) {
    g.fillStyle = bg;
    g.beginPath();
    g.roundRect(0, 0, w, h, radius);
    g.fill();
  }
  const total = lines.reduce((s, l) => s + l.size * 1.25, 0);
  let y = (h - total) / 2;
  g.textAlign = align;
  g.textBaseline = "top";
  for (const l of lines) {
    g.font = `${l.weight ?? 700} ${l.size}px ${l.font ?? "Rubik, Heebo, sans-serif"}`;
    g.fillStyle = l.color ?? "#ffffff";
    g.fillText(l.text, align === "center" ? w / 2 : align === "right" ? w - 24 : 24, y);
    y += l.size * 1.25;
  }
  t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  labelCache.set(key, t);
  return t;
};
