import { Easing, interpolate, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";

export const fontFamily = "Rubik";
// Bundled variable font (OFL) so rendering works offline.
loadFont({ family: fontFamily, url: staticFile("fonts/Rubik.ttf"), weight: "300 900" });

export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const C = {
  bgDeep: "#1a0633",
  bgMid: "#3d0f6b",
  purple: "#7b2ff7",
  pink: "#ff4fa3",
  lime: "#9be22d",
  limeDark: "#5fa80f",
  yellow: "#ffd23f",
  cyan: "#38e1ff",
  red: "#ff3b5c",
  white: "#ffffff",
  ink: "#14101f",
};

/** seconds -> frames */
export const s = (t: number) => Math.round(t * FPS);

const outExpo = Easing.bezier(0.16, 1, 0.3, 1);

/** clamped interpolate with a smooth ease-out by default */
export const ease = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing: (t: number) => number = outExpo,
) =>
  interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** fade in at [a, a+d], fade out at [b-d, b] */
export const fadeInOut = (frame: number, a: number, b: number, d = 8) =>
  interpolate(frame, [a, a + d, b - d, b], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Scene boundaries (seconds), aligned to pauses in the narration. */
export const SCENES = {
  hook: [0, 3.2],
  power: [3.2, 11.5],
  connect: [11.5, 21.15],
  seal: [21.15, 34.35],
  switchOn: [34.35, 39.1],
  inflate: [39.1, 47],
} as const;

export const TOTAL_SECONDS = 47;

/** Narration phrases (seconds) for on-screen captions. */
export const CAPTIONS: [number, number, string][] = [
  [0.0, 1.8, "קניתם תחפושת מתנפחת?"],
  [1.8, 3.2, "כך תנפחו אותה בקלות:"],
  [3.2, 6.6, "תחילה, הכניסו סוללות AA חדשות לקופסת הסוללות,"],
  [6.7, 9.2, "או חברו סוללת גיבוי ניידת (Power Bank)"],
  [9.2, 11.5, "ישירות לכבל ה-USB של המאוורר."],
  [11.5, 13.7, "לאחר מכן, חברו את הכבל לקופסה,"],
  [13.7, 15.35, "היכנסו אל תוך התחפושת,"],
  [15.35, 18.5, "והצמידו את קופסת הסוללות לכיס הפנימי או לחגורה"],
  [18.5, 21.1, "בעזרת הקליפס כדי שתוכלו לנוע בחופשיות."],
  [21.15, 23.2, "עכשיו מגיע השלב החשוב ביותר –"],
  [23.2, 26.6, "כדי שהתחפושת תישאר מנופחת אסור לאוויר לברוח,"],
  [26.65, 29.2, "ולכן רכסו את כל הרוכסנים עד הסוף"],
  [29.2, 31.5, "והדקו היטב את הגומיות והשרוכים"],
  [31.5, 34.3, "סביב הקרסוליים, פרקי כפות הידיים והצוואר."],
  [34.35, 37.25, "לבסוף, העבירו את המתג למצב הפעלה (ON),"],
  [37.3, 39.05, "המאוורר יתחיל לשאוב אוויר,"],
  [39.1, 42.3, "ותוך דקה עד שתיים התחפושת תתנפח למלוא גודלה"],
  [42.3, 44.2, "ותישאר כך כל עוד הוא דולק."],
];
