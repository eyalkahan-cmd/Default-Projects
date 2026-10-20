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
export const W = 1920;
export const H = 1080;

/** Seconds → frames */
export const f = (sec: number) => Math.round(sec * FPS);

// Scene boundaries in seconds, locked to the voiceover (data/scene-timings.json).
export const T = {
  opening: [0, 6.35],
  fan: [6.35, 11.91],
  aa: [11.91, 20.89],
  powerbank: [20.89, 25.85],
  cable: [25.85, 31.41],
  enter: [31.41, 35.25],
  clip: [35.25, 42.31],
  important: [42.31, 50.51],
  zip: [50.51, 54.33],
  elastic: [54.33, 59.77],
  straps: [59.77, 66.45],
  switchOn: [66.45, 69.19],
  inflate: [69.19, 77.93],
  ready: [77.93, 81.99],
  reminder: [81.99, 86.67],
  logo: [86.67, 90.67],
} as const;

export const TOTAL_SEC = 90.67;
