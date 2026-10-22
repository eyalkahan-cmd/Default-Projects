/**
 * TIMINGS — the single source of truth for the film's clock.
 *
 * Every scene start, shot boundary and retime map lives here; the scenes import them, and the
 * sound cues below are derived from the very same numbers. Move a cut or re-time a shot here
 * and the picture and the sound move together, frame-accurately. (30 fps; "film" frames are
 * absolute, "local" frames count from a scene's start.)
 */
export const FPS = 30;
/** one beat of the 124 BPM underscore in frames (14.52) */
export const BEAT = (60 / 124) * FPS;
/** film beat grid: beats of the music fall at 0.3 + n · BEAT frames */
export const beatSnap = (filmFrame: number) => Math.round(Math.round((filmFrame - 0.3) / BEAT) * BEAT + 0.3);
/** snap a scene-local cut (scene starting at `sceneStart` on the film) to the nearest beat */
export const cutOnBeat = (sceneStart: number, local: number) => beatSnap(sceneStart + local) - sceneStart;

const s = (sec: number) => Math.round(sec * FPS);

/** film-local frame at which a piecewise-linear retime (src → dst) first reaches child frame `e` */
export const inv = (src: number[], dst: number[], e: number) => {
  for (let i = 0; i < src.length - 1; i++) {
    const a = dst[i];
    const b = dst[i + 1];
    if (b > a && a <= e && e <= b) return src[i] + ((e - a) / (b - a)) * (src[i + 1] - src[i]);
  }
  throw new Error(`retime never reaches ${e}`);
};

// ─── scenes (film frames), cut to the Guide_v2 voiceover ────────────────────────────────────────
export const SCENES = {
  opening: 0,
  fan: s(6.4),
  power: s(11.96),
  connect: s(25.58),
  wear: s(30.58),
  leak: s(42.04),
  seal: s(50.24),
  inflate: s(66.18),
  lineup: s(79.18),
  keep: s(81.83),
  end: s(86.5),
  total: s(89.73),
} as const;

// ─── shots inside each scene (local frames) ───────────────────────────────────────────────────
export const OPENING = { carouselStart: 8, carouselSteps: 7, line1: 14, line2: 60, zoomThrough: 104, hero: 116 };
export const FAN = { A: 44, B: 92, C: 130, END: 167, fanDot: 9 };
export const POWER = { top: 0, macro: 38, hero: 82, split: 132, bank: 204, usb: 278, end: 408, cellStart: 10, cellStep: 17, cellMove: 16 };
export const POWER_USB = { dropFrom: POWER.usb - 6, dropTo: POWER.usb + 18, seatFrom: POWER.usb + 24, seatTo: POWER.usb + 38, callout: POWER.usb + 30 };
export const CONNECT = { A: 52, END: 150, t4Plug: [84, 150] as const, t4Seat: 132, t4Callout: 104 };
export const CONNECT_SEAT = CONNECT.A + ((CONNECT.t4Seat - CONNECT.t4Plug[0]) / (CONNECT.t4Plug[1] - CONNECT.t4Plug[0])) * (CONNECT.END - CONNECT.A);

const W0 = SCENES.wear;
export const WEAR = {
  IN_END: 120,
  END: 344,
  a: cutOnBeat(W0, 60),
  p1: cutOnBeat(W0, 120 + 62),
  p2: cutOnBeat(W0, 120 + 104),
  p3: cutOnBeat(W0, 120 + 166),
  // WearPack's own frames (local − IN_END): into the pocket 8–70, out 104–140, clip on 168–205
  pocketCallout: 40,
  clipCallout: 176,
  clipOn: 205,
};

export const LEAK = { b: cutOnBeat(SCENES.leak, 166), END: 246, card: 6, leaksIn: 104, callout: 120 };

const S0 = SCENES.seal;
export const SEAL_SRC = [0, s(3.38), s(3.82), s(8.34), s(9.26), s(12.76), s(15.32), s(15.94)];
export const SEAL_DST = [0, 118, 128, 180, 184, 236, 270, 270];
const sc2 = cutOnBeat(S0, SEAL_SRC[2]);
const sc3 = cutOnBeat(S0, SEAL_SRC[3]);
export const SEAL = {
  c1: cutOnBeat(S0, 52),
  c2: sc2,
  cE: cutOnBeat(S0, Math.round((sc2 + sc3) / 2)),
  c3: sc3,
  c4: cutOnBeat(S0, s(12.4)),
  END: SEAL_SRC[SEAL_SRC.length - 1],
  // T2Seal's own frames
  sliderFrom: 18,
  sliderTo: 118,
  toTheEnd: 116,
  lockFrom: 182,
  lockCallout: 186,
  fitOk: 232,
};

const I0 = SCENES.inflate;
export const INFLATE_SRC = [0, s(6.33), s(11.48), s(13.0)];
export const INFLATE_DST = [0, 150, 192, 270];
export const INFLATE = {
  c1: cutOnBeat(I0, 62),
  c2: cutOnBeat(I0, 198),
  c3: cutOnBeat(I0, INFLATE_SRC[2]),
  END: INFLATE_SRC[INFLATE_SRC.length - 1],
  // T3Inflate's own frames
  switchOn: 8,
  fillStart: 34,
  airCallout: 66,
  timeCard: 150,
  taut: 195,
  fullSize: 212,
};

export const LINEUP = { word: 8 };
export const KEEP = { callout: 14 };
export const END_CARD = { logo: 4, url: 22 };

// ─── named frames (film), for anyone dressing sound by hand ────────────────────────────────────
export const TIMINGS = {
  STEP_1_START_FRAME: SCENES.fan,
  STEP_2_START_FRAME: SCENES.power,
  STEP_3_START_FRAME: SCENES.wear,
  STEP_4_START_FRAME: SCENES.leak,
  STEP_5_START_FRAME: SCENES.inflate,
  FINALE_START_FRAME: SCENES.lineup,
  END_CARD_FRAME: SCENES.end,
  TOTAL_FRAMES: SCENES.total,
  AA_CELL_SEAT_FRAMES: [0, 1, 2, 3].map((i) => SCENES.power + POWER.cellStart + i * POWER.cellStep + POWER.cellMove),
  USB_BANK_SEAT_FRAME: SCENES.power + POWER_USB.seatTo,
  USB_BOX_SEAT_FRAME: Math.round(SCENES.connect + CONNECT_SEAT),
  CLIP_ON_BELT_FRAME: SCENES.wear + WEAR.IN_END + WEAR.clipOn,
  ZIPPER_SFX_FRAME: Math.round(S0 + inv(SEAL_SRC, SEAL_DST, SEAL.sliderFrom)),
  ZIPPER_SFX_END_FRAME: Math.round(S0 + inv(SEAL_SRC, SEAL_DST, SEAL.sliderTo)),
  FAN_SWITCH_ON_FRAME: Math.round(I0 + inv(INFLATE_SRC, INFLATE_DST, INFLATE.switchOn)),
  INFLATE_START_FRAME: Math.round(I0 + inv(INFLATE_SRC, INFLATE_DST, INFLATE.fillStart)),
  FULL_SIZE_FRAME: Math.round(I0 + inv(INFLATE_SRC, INFLATE_DST, INFLATE.taut)),
  /** the music's full re-entry, on the film beat grid (beat 160) */
  MUSIC_DROP_FRAME: beatSnap(0.3 + 160 * BEAT),
} as const;

// ─── sound ─────────────────────────────────────────────────────────────────────────────────────
export const AUDIO = {
  voice: "audio/guide_v2.mp3", // Guide_v2, untouched, from frame 0
  music: "audio/blissful_land_124.wav", // Blissful Land, 122 → 124 BPM (pitch kept), 700/1150/1600 Hz dips
  /** the music's full re-entry in that file (s), measured on its kick grid */
  musicDrop: 139.094,
  musicDb: -16,
  duckDb: 6,
};
/** where the music file starts at film frame 0 (s): its drop lands on MUSIC_DROP_FRAME */
export const MUSIC_IN = AUDIO.musicDrop - (0.3 + 160 * BEAT) / FPS;

/** length of each sound-effect file (s) */
export const SFX_LENGTH: Record<string, number> = {
  air_breath: 1.25,
  air_whoosh: 1.81,
  battery_click: 1.46,
  fabric_whoosh: 1.83,
  fan_running: 27.73,
  inflate: 8.68,
  plastic_snap: 0.4,
  soft_puff: 0.32,
  switch_click: 1.18,
  zipper: 3.24,
};

/**
 * A sound cue. `at` is the film frame the sound should *hit* on; `peak` is how far into the file
 * that hit is (s), so the file starts `peak` earlier. `len` caps the file length (s).
 */
export type Cue = { file: string; at: number; db: number; peak?: number; len?: number };

const W = (at: number, db = -24): Cue => ({ file: "air_whoosh", at, db, peak: 0.55 }); // transition / camera move
const Wc = (at: number): Cue => W(at, -30); // hard cut inside a scene: a breath of air only
const P = (at: number, db = -25): Cue => ({ file: "soft_puff", at, db, peak: 0.004 }); // callout / word puffs in (non-tonal)
const PB = (at: number) => P(at, -20); // big kinetic word / hero puff
const fx = (file: string, at: number, db: number, len?: number, peak = 0.01): Cue => ({ file, at, db, len, peak });

const build = (): Cue[] => {
  const c: Cue[] = [];
  const O = SCENES.opening;
  // OPENING: cover-flow steps one card per beat (the move is 55 % of a beat; whoosh at its middle)
  for (let k = 0; k < OPENING.carouselSteps; k++) c.push(W(O + OPENING.carouselStart + k * BEAT + 4, -32));
  c.push(PB(O + OPENING.line1), PB(O + OPENING.line2), fx("fabric_whoosh", O + OPENING.zoomThrough, -21, undefined, 0));
  c.push(PB(O + OPENING.hero), P(O + OPENING.hero + 6), P(O + OPENING.hero + 6 + BEAT), P(O + OPENING.hero + 6 + 2 * BEAT, -27));
  for (let i = 0; i < 5; i++) c.push(P(O + OPENING.hero + 10 + 2 * BEAT + i * 3, -33));
  c.push(W(SCENES.fan));

  // 01 FAN
  const F = SCENES.fan;
  c.push(P(F + FAN.fanDot), W(F + FAN.A, -25));
  c.push(P(F + FAN.A + inv([0, FAN.B - FAN.A], [22, 98], 40)));
  c.push(Wc(F + FAN.B), P(F + FAN.B + inv([0, FAN.C - FAN.B], [104, 152], 124)));
  c.push(W(F + FAN.C, -26), P(F + FAN.C + inv([0, FAN.END - FAN.C], [158, 210], 168)));
  c.push(W(SCENES.power));

  // 02 POWER
  const Pw = SCENES.power;
  for (const f of TIMINGS.AA_CELL_SEAT_FRAMES) c.push(fx("battery_click", f, -20, 0.35));
  for (const k of [POWER.macro, POWER.hero, POWER.split, POWER.bank, POWER.usb]) c.push(Wc(Pw + k));
  c.push(PB(Pw + POWER.hero + 4), P(Pw + POWER.split + 10, -21), P(Pw + POWER.split + 22), PB(Pw + POWER.bank + 6));
  c.push(W(Pw + POWER.usb + 8, -31), P(Pw + POWER_USB.callout), fx("plastic_snap", TIMINGS.USB_BANK_SEAT_FRAME, -16));
  c.push(W(SCENES.connect));

  // CONNECT
  const Cn = SCENES.connect;
  c.push(W(Cn + CONNECT.A, -26), P(Cn + CONNECT.A + inv([0, CONNECT.END - CONNECT.A], [...CONNECT.t4Plug], CONNECT.t4Callout)));
  c.push(fx("plastic_snap", Cn + CONNECT_SEAT, -15), W(SCENES.wear));

  // 03 WEAR
  const Wr = SCENES.wear;
  const pk = Wr + WEAR.IN_END;
  c.push(PB(Wr + 14), Wc(Wr + WEAR.a), W(pk, -26), fx("fabric_whoosh", pk + 22, -21, undefined, 0), P(pk + WEAR.pocketCallout));
  c.push(Wc(Wr + WEAR.p1), W(Wr + WEAR.p2, -27), Wc(Wr + WEAR.p3));
  c.push(P(pk + WEAR.clipCallout), fx("plastic_snap", TIMINGS.CLIP_ON_BELT_FRAME, -15), W(SCENES.leak));

  // 04 SEAL · air leak
  const Lk = SCENES.leak;
  c.push(P(Lk + LEAK.card - 2, -24), PB(Lk + LEAK.card), fx("air_breath", Lk + 16, -27, undefined, 0));
  c.push(fx("air_breath", Lk + LEAK.leaksIn, -22, undefined, 0), fx("air_breath", Lk + 150, -25, undefined, 0), P(Lk + LEAK.callout));
  c.push(W(Lk + LEAK.b, -26), fx("air_breath", Lk + LEAK.b + 6, -25, undefined, 0));

  // 04 SEAL · zipper / elastics / cord lock
  const Se = SCENES.seal;
  const at = (e: number) => Se + inv(SEAL_SRC, SEAL_DST, e);
  c.push(fx("zipper", TIMINGS.ZIPPER_SFX_FRAME, -13, (TIMINGS.ZIPPER_SFX_END_FRAME - TIMINGS.ZIPPER_SFX_FRAME) / FPS + 0.15, 0));
  c.push(Wc(Se + SEAL.c1), P(Se + SEAL.c1 + 3 / (SEAL_DST[1] / SEAL_SRC[1])), P(at(SEAL.toTheEnd), -27));
  c.push(W(Se + SEAL.c2, -26), Wc(Se + SEAL.cE), P(Se + SEAL.cE + (3 * (SEAL_SRC[3] - SEAL_SRC[2])) / (SEAL_DST[3] - SEAL_DST[2])));
  c.push(W(Se + SEAL.c3, -26), fx("fabric_whoosh", at(SEAL.lockFrom), -24, undefined, 0), P(at(SEAL.lockCallout)));
  c.push(Wc(Se + SEAL.c4), P(at(SEAL.fitOk), -27), W(SCENES.inflate));

  // 05 INFLATE
  const In = SCENES.inflate;
  const it = (e: number) => In + inv(INFLATE_SRC, INFLATE_DST, e);
  c.push(fx("switch_click", TIMINGS.FAN_SWITCH_ON_FRAME, -14, 0.6, 0.02), P(TIMINGS.FAN_SWITCH_ON_FRAME, -26));
  c.push(fx("fan_running", TIMINGS.FAN_SWITCH_ON_FRAME + 3, -22, 12, 0), fx("inflate", TIMINGS.INFLATE_START_FRAME, -16, 8.6, 0));
  c.push(W(In + INFLATE.c1, -27), P(it(INFLATE.airCallout)), Wc(In + INFLATE.c2), P(it(INFLATE.timeCard), -23));
  c.push(W(In + INFLATE.c3, -26), fx("air_breath", TIMINGS.FULL_SIZE_FRAME, -19, undefined, 0.25), PB(it(INFLATE.fullSize)));
  c.push(W(SCENES.lineup));

  // FINALE
  const Ln = SCENES.lineup;
  for (let k = 0; k < 3; k++) c.push(P(Ln + Math.round((k * BEAT) / 2), -23));
  c.push(PB(Ln + LINEUP.word), W(SCENES.keep));
  const Kp = SCENES.keep;
  c.push(fx("fan_running", Kp + 3, -25, 4.4, 0), fx("air_breath", Kp + 6, -27, undefined, 0), P(Kp + KEEP.callout));
  c.push(W(SCENES.end), fx("air_breath", SCENES.end + END_CARD.logo, -18, undefined, 0.1), P(SCENES.end + END_CARD.url, -24));
  return c;
};

export const CUES: Cue[] = build();
