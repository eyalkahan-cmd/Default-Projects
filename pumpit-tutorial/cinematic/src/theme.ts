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
