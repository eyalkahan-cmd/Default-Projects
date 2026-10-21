import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Brand palette from pumpit.co.il CSS variables.
export const C = {
  yellow: "#FFE000",
  pink: "#FF0F67",
  navy: "#073A96",
  navyDark: "#052D79",
  navyDeep: "#031B4E",
  blue: "#1099EA",
  blueSoft: "#EDFAFF",
  white: "#FFFFFF",
  green: "#2BD46B",
  red: "#FF3B3B",
  // Blower / battery box plastic (sampled from the product photos)
  fan: "#F7700A",
  fanShade: "#E35C11",
  fanDeep: "#C9400C",
  fanLight: "#FF9A3C",
};

// Heebo bundled locally (public/fonts, from @fontsource/heebo): the render browser has no web access.
export const HEEBO = "Heebo";
const HEBREW_RANGE = "U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F";
const LATIN_RANGE =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
for (const weight of ["400", "500", "700", "800", "900"]) {
  loadFont({ family: HEEBO, url: staticFile(`fonts/heebo-hebrew-${weight}-normal.woff2`), weight, unicodeRange: HEBREW_RANGE });
  loadFont({ family: HEEBO, url: staticFile(`fonts/heebo-latin-${weight}-normal.woff2`), weight, unicodeRange: LATIN_RANGE });
}

export const FPS = 30;

/** Seconds → frames */
export const f = (sec: number) => Math.round(sec * FPS);

/**
 * Art-direction "looks" for the style-frame comparison. One look per render, set by <WithLook>
 * before the scene renders (a module value rather than React context, so it also reaches
 * components inside the WebGL canvas).
 */
export type LookId = "night" | "daylight" | "color";
export type Look = {
  id: LookId;
  /** CSS background of the cyclorama behind the transparent canvas ({x},{y} = light centre in %). */
  bg: (x: number, y: number) => string;
  floor: string;
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  text: string;
  sub: string;
  accent: string;
  leader: string;
  vignette: string;
  grain: number;
  /** air / technical information colour, and whether it glows (additive) or is printed (normal) */
  air: string;
  airPulse: string;
  airAdditive: boolean;
};
export const LOOKS: Record<LookId, Look> = {
  night: {
    id: "night",
    bg: (x, y) => `radial-gradient(ellipse 75% 85% at ${x}% ${y}%, #0f3f99 0%, #062a6d 38%, #031640 72%, #010a20 100%)`,
    floor: "#0a2560",
    hemiSky: "#cfe3ff",
    hemiGround: "#0a1430",
    hemi: 0.25,
    text: "#FFFFFF",
    sub: "rgba(220,232,255,0.8)",
    accent: C.yellow,
    leader: "rgba(255,255,255,0.85)",
    vignette: "rgba(0,4,16,0.55)",
    grain: 0.07,
    air: "#7fd6ff",
    airPulse: "#bff0ff",
    airAdditive: true,
  },
  // Clean bright studio: soft white-blue cyclorama, brand colours carried by the objects and accents.
  daylight: {
    id: "daylight",
    bg: (x, y) => `radial-gradient(ellipse 80% 90% at ${x}% ${y}%, #ffffff 0%, #eef4fc 40%, #d9e5f5 75%, #c3d3ea 100%)`,
    floor: "#e4ebf5",
    hemiSky: "#ffffff",
    hemiGround: "#b9c8de",
    hemi: 0.9,
    text: "#0B1F4D",
    sub: "rgba(11,31,77,0.68)",
    // Pumpit blue: the complement of the costume/hardware orange, balanced contrast without clashing
    accent: C.blue,
    leader: "rgba(11,31,77,0.7)",
    vignette: "rgba(40,60,100,0.16)",
    grain: 0.035,
    air: "#1099EA",
    airPulse: "#0B6FC2",
    airAdditive: false,
  },
  // Brand colour: a saturated blue → violet → pink light field (Pumpit palette), still clean and premium.
  color: {
    id: "color",
    bg: (x, y) =>
      `radial-gradient(ellipse 55% 60% at ${x}% ${y}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 60%), linear-gradient(120deg, #1099EA 0%, #3b5bf0 38%, #7a3cf0 66%, #FF0F67 100%)`,
    floor: "#2c2f8f",
    hemiSky: "#e6f0ff",
    hemiGround: "#3a1f70",
    hemi: 0.45,
    text: "#FFFFFF",
    sub: "rgba(255,255,255,0.85)",
    accent: C.yellow,
    leader: "rgba(255,255,255,0.9)",
    vignette: "rgba(20,0,60,0.32)",
    grain: 0.05,
    air: "#bff0ff",
    airPulse: "#ffffff",
    airAdditive: true,
  },
};
let current: Look = LOOKS.night;
export const look = () => current;
export const setLook = (id: LookId = "night") => {
  current = LOOKS[id];
};
