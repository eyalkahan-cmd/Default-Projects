---
name: onestory-reel-edit
description: Edit an AI photo-to-photo transition clip (from a OneStory growth video) into a 9:16 Reels/TikTok promo that converts viewers to OneStory.co.il — two-photo hook, eased speed ramps, music drop synced to the peak moment, layered SFX, Hebrew captions, growth-video badge, OneStory CTA and a before/after end card. Use when the user gives two photos plus the AI transition video between them and asks for a viral/promo reel, "סרטון ויראלי", "רילס", "טיקטוק", "מעבר בין תמונות", "קטע מסרטון גדילה", or wants another reel "כמו הקודם" / in the OneStory format. Builds on the Remotion template in transition-reel/.
---

# OneStory reel edit

Turns **photo 1 + photo 2 + the AI transition clip between them** into a ~15s vertical promo.
Goal: a strong hook, show the concept ("2 photos → AI → 1 video"), and convert viewers to
**OneStory.co.il** (growth videos made from photos).

The working reference implementation is `transition-reel/` (Remotion). **Copy it to a new folder
and adapt it** rather than starting from scratch: `transition-reel/src/Composition.tsx` contains
every piece described below. Reply to the user in Hebrew.

## Workflow

1. **Inspect the inputs.** `ffprobe` the clip (fps, frame count, duration). Build a contact sheet
   (`scripts/contact_sheet.py`) to find the story beats: still → motion → **peak moment**
   (e.g. ramp takeoff) → transformation → reveal of photo 2.
2. **Scaffold.** `cp -r transition-reel <new-name>` (skip `node_modules`, `out`, `public/frames`),
   `npm i`, put `photo1.jpg`, `photo2.jpg`, `transition.mp4` in `public/`, then `npm run frames`
   (extracts source frames to `public/frames/fNNN.jpg`; the clip is drawn frame-by-frame so it can
   be time-remapped). Update `SRC_FPS` / `SRC_FRAMES`.
3. **Find the peak frame exactly.** Contact-sheet the source frames around the peak, one by one, and
   pick the frame where it happens (e.g. rear wheel leaves the ramp lip). Convert it to an output
   frame through the speed curve → `TAKEOFF_FRAME`.
4. **Music** (Artlist connector): energetic instrumental with a clear build → break → drop
   (~140–150 BPM trap/phonk/sport worked well). Download, then run `scripts/find_kicks.py` on the
   area around the track's drop. **Sync the FIRST bass kick of the drop to the peak frame**:
   `MUSIC_START_SEC = KICK_SEC - TAKEOFF_FRAME / FPS`. Do not sync to the hook/preview start time
   Artlist reports — it is often inside the break, ~0.2s early. Verify after rendering by running the
   same onset detection on the output audio.
5. **Set the timeline, captions and SFX** (below), render stills of the key frames, check them,
   then render the full video and re-check audio levels.
6. Commit/push, send the mp4 with `SendUserFile`, and summarize the changes in Hebrew.

## Timeline (30fps, 1080×1920) — reference values

| Frames | Section |
|---|---|
| 0–54 | **Hook**: dark blurred backdrop; title "רק **2** תמונות." (yellow 2); the two photos slam in as tilted cards (photo 1 right, photo 2 left — RTL), labeled "תמונה 1" / "תמונה 2"; a yellow arrow from photo 1 to photo 2; subtitle "תראו איזה **מעבר גדילה** יצרנו". Snap SFX on each card. |
| 54–66 | Photo 1 card flies to full frame (rotation/border/radius → 0) + whoosh. It must match the clip's first frame. |
| 66–348 | **The clip**, time-remapped (see below), with captions, top progress bar, flashes/shake on hits. |
| ~136 | **Drop = peak moment**: first kick, flash, shake, punch-in, boom, caption pops, CTA enters. |
| ~260 | **Reveal** of photo 2's world: flash + boom + big caption (e.g. the venue name "FlyBox!"). |
| 348–438 | **End card**: before/after slider of the two photos with a seam and an "AI" knob. |

## Time remapping (no hard speed cuts)

Use a per-output-frame **speed curve** integrated into `SRC_TIME[]`, not separate segments with
different `playbackRate`s (those cuts are visible). Reference curve: 1.25x riding → **0.5x slow-mo
from the peak** → **smootherstep ramp back to 1x over ~50 frames** → 1x → eased to 0.75x on the
reveal. The slow push-in zoom during the slow-mo must **ease back** across the same ramp. Never let a
transform snap back on the frame where the speed changes. Use whole source frames (no frame
blending: it ghosts fast-moving objects in slow-mo). Keep the cut *into* slow-mo sharp; it sits on
the kick/flash.

## Captions (Hebrew, RTL)

Short, punchy, one per beat, spring pop-in (scale 1.7→1, slight rotate), white with dark stroke;
key words yellow and bigger. Reference set: "מתחיל באופניים..." → **"קפיצה"** (on the drop) →
"צניחה חופשית..." → "רגע..." → **"FlyBox!"** (on the reveal). Write Hebrew in natural order
("רגע..." not "...רגע"): with `direction: rtl` the punctuation lands on the left by itself. Wrap
Latin words in a span with `direction: ltr; unicodeBidi: isolate`. Keep captions around y≈1130 so
they clear the CTA.

## Persistent overlays

- **Progress bar** (top, during the clip): photo-1 thumbnail on the right → photo-2 thumbnail on the
  left, a yellow line filling with a moving "AI" pill; photo 2 highlights on the reveal. Shows the
  concept "AI fills the path between the two photos". Keep the pill from covering the end thumbnail.
- **Growth badge** "● קטע מעבר מתוך **סרטון גדילה**" under the bar (y≈292, ~54px, dark pill, white
  border, blinking red dot). From the start, **removed after the end-card flash**.
- **CTA box** "רוצים סרטון גדילה? פרטים באתר:" + **OneStory.co.il** (big, yellow, LTR, subtle
  150-BPM pulse). Dark box with yellow border at y≈1420 (inside the Reels/TikTok safe area).
  **Enters on the drop**, not during the hook. On the end card it scales up a little and glows.

## End card

Before/after slider (seam sweeps across, settles in the middle). **No** "2 תמונות. סרטון אחד." and
**no** comment bait ("כתבו בתגובות" etc.). Headline at the top: a yellow block with dark text
"סרטון גדילה **AI**" (slight tilt, light sheen sweep), then two big white lines "בהתאמה אישית" /
"עם מעברים **מושלמים!**". Contrast comes from a dark top gradient + text stroke/shadow, **not** another
black box: the CTA must stay the only dark box on screen.

## Sound

- Music volume ~0.9, fade out at the end. The clip's own audio is muted.
- Synthesized hits (`transition-reel/audio/make_sfx.py`): snap (hook cards), whoosh (zoom, reveal,
  end), riser into the drop, boom on the drop and the reveal.
- **Real SFX from Artlist, matched to the shot and only while it is on screen**:
  - Off-road riding ("Mountain Biking – Riding on Dirt Road, Fast"): starts only once he is
    actually riding (not while standing), builds up to the takeoff, cuts out when the wheels leave
    the ramp. Field recordings are very quiet: compress and normalize them
    (`acompressor` + gain + `alimiter`) and **measure the isolated level in the mix** (render with the
    music muted). Target: audible but a few dB under the music.
  - Wind ("Under the Weather – Freezing Wind"): only over the freefall shot, eased in with that
    shot and eased out just **before** the reveal. Not under the venue reveal / end card. Not dominant.
- All SFX fades eased (`Easing.inOut(Easing.sin)`), never cut in or out abruptly.

## Environment gotchas (cloud container)

- Render with the preinstalled headless shell — `remotion.config.ts` sets
  `Config.setBrowserExecutable("/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell")`.
- `@remotion/google-fonts` fails in the headless browser (proxy cert). Bundle Heebo locally:
  `public/heebo-hebrew.woff2` + `public/heebo-latin.woff2` loaded with `@remotion/fonts`, weight "100 900".
- Artlist SFX links without a signature (`cms-public-artifacts…`) and preview URLs return 403 here;
  the signed `cms-artifacts…` links from `download_track` work (request `format: "wav"`).
- Connectors (Artlist) load only at session start. If one is missing, ask the user to reconnect it
  at claude.ai/customize/connectors and start a new session; offer the synthesized-beat fallback.
- `public/frames` is gitignored (~40MB); regenerate it with `npm run frames`.
- Commit the final mp4 with `git add -f <dir>/out/<name>.mp4` (`out/` is gitignored).

## Iteration notes (what the user asked for so far)

Preferences from the first reel, to apply by default: a hook that shows both photos big; the CTA
only from the drop; a readable growth badge; conversion copy instead of comment bait; no extra
black boxes on the end card; seamless speed ramps; the kick exactly on the action; SFX that are felt
but subtle and tied to their shot.
