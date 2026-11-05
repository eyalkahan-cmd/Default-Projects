---
name: onestory-reel-edit
description: Edit an AI photo-to-photo transition clip (from a OneStory growth video) into a 9:16 Reels/TikTok promo that converts viewers to OneStory.co.il — two-photo hook, eased speed ramps, music drop synced to the peak moment, layered SFX, Hebrew captions, growth-video badge, OneStory CTA and a before/after end card. Use when the user gives two photos plus the AI transition video between them and asks for a viral/promo reel, "סרטון ויראלי", "רילס", "טיקטוק", "מעבר בין תמונות", "קטע מסרטון גדילה", or wants another reel "כמו הקודם" / in the OneStory format. Ships with its own Remotion template (template/ in this skill folder).
---

# OneStory reel edit

Turns **photo 1 + photo 2 + the AI transition clip between them** into a ~15s vertical promo.
Goal: a strong hook, show the concept ("2 photos → AI → 1 video"), and convert viewers to
**OneStory.co.il** (growth videos made from photos).

The working reference implementation is the Remotion project in **`template/`** next to this file
(the same code as `transition-reel/` in the eyalkahan-cmd/Default-Projects repo; if that folder is
present in the working directory, it is the most up-to-date copy and can be used instead).
**Copy it to a new folder and adapt it** rather than starting from scratch:
`template/src/Composition.tsx` contains every piece described below. Reply to the user in Hebrew.

## Workflow

1. **Inspect the inputs.** `ffprobe` the clip (fps, frame count, duration). Build a contact sheet
   (`scripts/contact_sheet.py`) to find the story beats: still → motion → **peak moment**
   (e.g. ramp takeoff) → transformation → reveal of photo 2.
2. **Scaffold.** `cp -r <this skill dir>/template <new-name>` (or `transition-reel` from the repo,
   skipping `node_modules`, `out`, `public/frames`), `npm i`, put `photo1.jpg`, `photo2.jpg`, `transition.mp4` in `public/`, then `npm run frames`
   (extracts source frames to `public/frames/fNNN.jpg`; the clip is drawn frame-by-frame so it can
   be time-remapped). Update `SRC_FPS` / `SRC_FRAMES`.
3. **Find the peak frame exactly.** Contact-sheet the source frames around the peak, one by one, and
   pick the frame where it happens (e.g. rear wheel leaves the ramp lip). Convert it to an output
   frame through the speed curve → `TAKEOFF_FRAME`.
4. **Music** (Artlist connector): energetic track with a clear build → break → drop
   (~140–150 BPM trap/phonk/sport worked well; 93–136 BPM tracks also work). Download, then map the
   track with `scripts/find_sections.py <track>` (1s loudness overview + biggest section jumps).
   **The heavy section ("הכאסח") must start exactly on the peak frame and stay heavy to the end of
   the reel.** Choose a boundary where a *sustained* loud section begins (quiet/break/roll before it,
   loud for ≥10s after), not an isolated hit after a breakdown followed by a medium groove — the user
   rejected exactly that ("זה לא מסונכרן... הכאסח נשמע רק לקראת הסיום"). The best drops have a short
   silence or drum roll right before them: that gap sits under the riser. Refine the first kick with
   `find_sections.py <track> <t-0.5> <t+0.5> 0.03` (the frame where bass jumps) or `find_kicks.py`.
   **Sync the FIRST bass kick of the heavy section to the peak frame**:
   `MUSIC_START_SEC = KICK_SEC - TAKEOFF_FRAME / FPS`. Do not sync to the hook/preview start time
   Artlist reports — it is often inside the break, ~0.2s early. Verify after rendering by running the
   same analysis on the output audio (the hit must be at TAKEOFF_FRAME/30 s).
   - When the user names a track ("Own the Moment – Korshun"), search it by name; several tracks can
     share a title ("Break It Down" × 3) — ask which artist before downloading.
   - **Music versions**: each track is a `MusicProps` entry (`music`, `kickSec`, `bpm`, `volume`,
     `cut`) registered as its own composition (`TransitionReel`, `TransitionReelV2`, …) with output
     `out/transition-reel-musicN.mp4`. Keep earlier versions so the user can compare; replace a
     version only when asked. The CTA pulse follows `bpm`.
   - If the user uploads a rendered reel and says "this music", identify it by correlating its audio
     with the renders/tracks in music-only stretches (e.g. 0.6–1.5s, 11–13s), not by guessing.
5. **Set the timeline, captions and SFX** (below), render stills of the key frames, check them,
   then render the full video and re-check audio levels.
6. Commit/push, send the mp4 with `SendUserFile`, and summarize the changes in Hebrew.

## Timeline (30fps, 1080×1920) — reference values

| Frames | Section |
|---|---|
| 0–54 | **Hook**: dark blurred backdrop; title "רק **2** תמונות." (yellow 2); the two photos slam in as tilted cards (photo 1 right, photo 2 left — RTL), labeled "תמונה 1" / "תמונה 2"; a yellow arrow from photo 1 to photo 2; subtitle "תראו איזה **מעבר גדילה** יצרנו". Snap SFX on each card. |
| 54–66 | Photo 1 card flies to full frame (rotation/border/radius → 0) + whoosh. It must match the clip's first frame. |
| 66–cut | **The clip**, time-remapped (see below), with captions, top progress bar, flashes/shake on hits. |
| ~136 | **Drop = peak moment**: first kick, flash, shake, punch-in, boom, caption pops, CTA enters. |
| ~260 | **Reveal** of photo 2's world: flash + boom + big caption (e.g. the venue name "FlyBox!"). |
| cut (~326)–438 | **End card**: before/after slider of the two photos with a seam and an "AI" knob. **The cut is on the first strong beat right after the closing gesture** (here: thumbs-up complete ≈10.6s → kick at 10.87s = frame 326). Find the gesture on a contact sheet, map source→output frames through the speed curve, then pick the beat with `find_sections.py` on the track at `MUSIC_START_SEC + t`. Each music version has its own `cut` (beats differ by 1–2 frames). Flash, whoosh, wind/flap fade-outs and the CTA end boost all follow `cut`. |

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
- Synthesized hits (`audio/make_sfx.py` in the template; run it to create the wavs in `public/`): snap (hook cards), whoosh (zoom, reveal,
  end), riser into the drop, boom on the drop and the reveal.
- **Real SFX from Artlist, matched to the shot and only while it is on screen**:
  - Off-road riding ("Mountain Biking – Riding on Dirt Road, Fast"): starts only once he is
    actually riding (not while standing), builds up to the takeoff, cuts out when the wheels leave
    the ramp. Field recordings are very quiet: compress and normalize them
    (`acompressor` + gain + `alimiter`) and **measure the isolated level in the mix** (render with the
    music muted). Target: audible but a few dB under the music.
  - Gear-up action SFX: when the rider closes the helmet / pulls the goggles down (source frame
    ~12 → output frame 78), a visor snap ("Modern Motorcycle – Lowering Helmet Visor", MAD ROBOT
    Sound Lab; trim to the slide + click, place the click on the frame the goggles land). Look for
    such on-screen actions on the contact sheet and give each one its sound.
  - Wind, **full and rich, in three layers** (the user asked for "עוד רוח... יותר מלא ועשיר"):
    1. Freefall wind ("Under the Weather – Freezing Wind", DT Sound) at ~0.7 over the freefall shot,
       eased out just before the reveal.
    2. Howling gusts ("High Winds – Strong Wind Ambience, Gusts Howling", Cinematic Sound Design;
       a 9s chunk from ~11s, highpass 60 Hz, loudnorm −16 LUFS) from just after the takeoff, peaking
       (~0.65) in the freefall, carried at ~0.35–0.4 into the tunnel, faded out by the cut.
    3. Cloth flapping ("Terrific Textiles – Cotton Fabric, Fast, Flapping", Milciclos; loudnorm
       −18 LUFS) ~0.55 in the freefall, ~0.35 in the tunnel airflow, faded out by the cut.
    Artlist search tips: "wind tunnel" returns only eerie ambiences, and "skydiving wind" returns ski
    sounds; "strong wind gust howling" and "cloth flapping" work. Normalize every SFX with `loudnorm`
    to 48 kHz stereo wav before use.
  - Watch the peak level after adding layers (`volumedetect`, histogram_0db); the drop boom on top of
    the music already touches 0 dB — lower the boom slightly if the user hears distortion.
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
- Commit the final mp4 with `git add -f <dir>/out/<name>.mp4` (`out/` is gitignored) only if the
  user wants it in git; otherwise send it with `SendUserFile`.
- `remotion render` prints "○" instead of "+" when it overwrites an existing output; check the
  file's mtime rather than assuming the render was skipped.
- The template's `public/` ships only the fonts: download music and Artlist SFX (`music.mp3`,
  `bike.wav`, `wind.wav`, `visor.wav`, `wind_gusts.wav`, `flap.wav`) per project, and run
  `audio/make_sfx.py` for the synthesized hits.

## Iteration notes (what the user asked for so far)

Second reel session (music versions + sound polish):
- Tried alternate music as separate versions (Gravity Line → Own the Moment → Break It Down →
  Run It Up); the user judges sync by ear: the heavy section must hit on the takeoff, not later.
- Added the helmet-visor SFX and the 3-layer wind.
- End card moved earlier, onto the beat right after the thumbs-up ("ממש על הביט... מיד אחרי
  שהיד עושה thumbs up"); the user confirmed the result was exact.
- Reply in Hebrew, short; say plainly that sync points come from audio analysis, not listening.


Preferences from the first reel, to apply by default: a hook that shows both photos big; the CTA
only from the drop; a readable growth badge; conversion copy instead of comment bait; no extra
black boxes on the end card; seamless speed ramps; the kick exactly on the action; SFX that are felt
but subtle and tied to their shot.
