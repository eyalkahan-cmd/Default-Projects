---
name: "kinetic-video-edit"
description: "Edit a talking-head or podcast video into a dynamic social clip with verbatim kinetic-typography captions, infographics, zooms, transitions and subtle tech SFX."
---

# Kinetic video edit (captions + motion graphics)

Turn an uploaded clip into a studio-grade 9:16 social edit. The source is usually 16:9 1080p podcast footage, but sometimes it is already vertical. The edit has:
- word-synced kinetic captions;
- infographics that illustrate what is said;
- card mode (video shrinks to a card with the graphic below) and a two-person split screen;
- whip transitions, gentle zooms and tasteful sound design.

Reply to the user in their language (often Hebrew). Captions are in the language the speaker actually speaks (often English with an Israeli accent).

---

## 1. Transcript: verbatim, no punctuation

1. **Captions are verbatim.** Write exactly what is said, even when the grammar is off.
   - Examples kept as spoken: "a one intake", "that it's going to", "all the other agent", "what what fits what task".
   - Never paraphrase or polish.
   - Check the spoken language. Whisper forced to `he` on English speech gives garbage Hebrew mixed with English, which is a tell.
2. **No punctuation.** Strip `. , ? ! : ;` from every caption word.
   - Keep apostrophes in contractions (IT'S, WE'RE).
   - Keep the `&` in terms like R&D.
   - Write terms the usual way: AI SDLC, DevOps, non-engineers.
3. **One ASR is never enough.** Models "correct" grammar: Parakeet wrote "that is" / "agents" where the speaker said "that it's" / "agent".
   - Run Whisper-medium and Parakeet, and diff them.
   - Settle every disagreement by evidence:
     - **CTC variant scoring:** align each candidate phrasing on that window; the higher score wins. Near-ties need more evidence.
     - **Spectral check (band chart):** "it's" = vowel + stop closure + /s/; "is" has no closure; "it is" has two vowels.
     - **Formants (LPC):** a filled pause "eh/uh" holds steady F1≈400–500 / F2≈1800–2000; "all" has F2≈900–1100; "yeah" shows F1 rising and F2 falling (/j/→/ɛə/).
     - **Tight-window re-runs** of both ASRs on the disputed stretch.
   - Whisper often stops early on clips over ~30 s. Parakeet completes; use it for the tail.
4. **Fillers are not captioned.** Verbal fillers like a stray "yeah" inside a sentence are unwanted in captions and, when possible, in the audio.
   - If it is the speaker's own word with silence around it, cut it from picture and audio (frame-aligned, with micro-fades), ideally inside a card so the jump is small.
   - If it overlaps other speech and can't be separated, drop it from the captions only.
   - Stutter repeats ("what what") may be shown once in the captions when the user asks; the audio stays.
   - Still, never let a hesitation stand in for the next word. The next word appears only when it is really said. Example: "have… ehhh… all the": ALL appears at 16.70, not 16.02.
5. **Names and brands:** keep what the evidence says (e.g. "Jev" beat "Bob"/"Jeff" clearly), and ask the user to confirm the spelling.

## 2. Speakers

- **Find out who speaks from the picture, not the ASR.**
  - Crop around both mouths and grab frames across the disputed window.
  - An off-screen "yeah" during a close-up is the other person if the visible speaker's mouth is closed.
  - The speaker's own filler ("yeah") is his if his mouth opens on it.
- **Interviewer lines are captioned too** (verbatim), in a distinct style: dark chips with a coral edge.
- **Overlapping speech makes ASR invent words** ("this year", "in here"). Drop them unless the CTC scores and the frames support them.
- **If the user asks to remove lines** (e.g. the interviewer's interjections), cut them out of picture and audio:
  - frame-aligned, with 12–15 ms audio fades at each join;
  - ideally so a join lands on an existing shot cut;
  - re-run ASR on the joins to confirm nothing of the removed line is left;
  - re-time everything from the shifted word list.

## 3. Timing: exact sync, nothing early

1. **Nothing appears before it is said.** This covers every caption word, tag and graphic label (including B-roll titles). Display time = forced-aligned onset + 0.02 s.
2. **Syllable-proportional estimates are not accurate enough** (they drifted 0.4 s at the end of a clip). Use the forced-alignment workflow (§10).
3. **Groups follow phrases.**
   - A word belongs with the phrase it opens: "WE'RE GOING / TO HAVE" then "ALL THE / JUDGMENT / LAYER".
   - Use short balanced lines, about 2 words per line, with the hero word on its own line.
4. **Never end a group on a short word that the next group follows immediately** (the/to/have/a/so). It flashes for 2–3 frames. Move it to the start of the next group ("THE / SECURITY / LAYER", "TO / DISPATCH").
5. **Captions and cuts:**
   - The last group before every cut gets `b = cut` with no exit fade. It rides the outgoing whip, because the caption layer takes the stage's whip transform.
   - No caption may be on the first frame of the next shot.
   - A word whose onset falls ≤ 0.1 s before a cut but which is mostly spoken after it starts in the new shot, at cut + 0.02. Late is allowed; early is not.
6. **The only allowed early word is one forced by a cut.**
   - It applies when a word would be readable < 0.2 s before the outgoing whip (e.g. "that IT'S" at 3.01, cut at 3.16).
   - Pop it 0.07 s after the previous word of the same group, so it reads "THAT IT'S".
   - Move its SFX with it. QA will flag it EARLY; that one flag is expected.
7. **Derive every animation, punch-in, card ramp and SFX time from `W(i)`** (word index), never from hard-coded seconds. Re-run SFX after any timing change.

## 4. Camera and framing (9:16 from 16:9)

1. **Static shots.**
   - Each shot gets ONE fixed focal point: the median detected face position over the shot.
   - **No pans, no tracking slides.** A smoothed face track made the camera slide 137 px in 1.7 s and the user rejected it.
2. **Only zoom moves, in good taste and sparingly.** The user likes these gentle in-frame moves; it is only the sideways pans/slides that are out:
   - the intro zoom 1.16 → 1.0 on the first shot;
   - a slow push of +4.5 % across each shot;
   - **a few** gentle punch-ins (+5–9 %, easeOutExpo 0.22 s) on the key word of an idea, not on every hero word. The edit is already rich in graphics, so don't overload it.
3. **Face detection:**
   - OpenCV Haar: `pip install "opencv-python-headless<5"` (v5 dropped CascadeClassifier).
   - Use frontal, profile and mirrored-profile detectors on every 2nd frame at 960×540.
   - Drop outliers: face width < 0.65× the shot median, or x > 350 px from the median.
   - In wide shots, search only the side of the person you want.
   - Never eyeball a focal point from one frame: that put a speaker ~300 px off-centre for a whole shot.
4. **Check the median.** A median skewed by head turns can push a person off-centre (x 979 vs a real face at ~830). Check each shot's frame visually, and keep the microphone in frame when the speaker talks into one: a person centred or slightly right, with the mic visible.
5. **Placement:**
   - Face at x = 50 % of the box.
   - Face at y ≈ 38 % in full screen and ≈ 36 % in the card, leaving headroom.
   - Spot-check every shot.
6. **Tell the user** that the full-screen crop of 16:9 is a ~1.78× upscale. Wide shots need a further ×2 zoom, so keep them in the card.

## 5. Layouts

### Card mode
- The video shrinks to a card at the top: x 60, y 150, 960×760, radius 54, cream border, deep shadow. The infographic goes below it, in y ≈ 1000–1600.
- Captions sit at y ≈ 880, straddling the card's bottom edge.
- Ramps last ≈ 0.45 s with easeInOut. Ramp *into* a card after a cut, not just before one.
- **Never ramp out to full screen just before a cut into another layout.** The zoom-out followed a few frames later by the new layout reads as jumpy. Stay in the layout until the cut and let the whip carry it out, with the graphic leaving inside the whip.
- **Hide source jump cuts inside the card.**
  - Detect jump cuts inside every shot: whole-frame mean abs diff spikes ≥ 4× the median on a 96×54 downscale.
  - A jump must never land in full screen right after the layout has grown.
  - Keep the card (and its graphic) through the words around the jump, and grow to full screen only after it, landing the expansion on a hero word. Example: out after "but it's very", so the zoom lands on INTERESTING.
- In a run of short shots near the end (cut, reaction, wide), stay in the card across them, with whips at the cuts, instead of toggling layouts.

### Full screen
- Captions sit at y ≈ 1300.
- Use it for hero moments and short reaction shots.

### Two-person split screen (speaker + listener)
- **When:** a wide shot with both people, no cuts, continuous conversation. Use it once or twice per video, more naturally in longer clips. It replaces infographics for that stretch.
- **The two panels are identical:**
  - same size: 1000×700 at y 150 and y 910, with a 60 px gap;
  - same radius and border;
  - same zoom on both people;
  - faces at the same height (~40 %).
- **Captions are centred on the divider (y ≈ 880).** Check that two-line hero captions don't cover the lower person's face; nudge that crop's focal y if they do.
- **Speaker marking:** a coral border with glow, plus small audio bars driven by the real per-frame RMS. **Never dim or darken the listener**: both stay fully lit.
- The panel layout comes in with the whip at the cut; there is no separate ramp.
- **Unlink the listener panel.** The delivered footage often has jump cuts that follow the speaker's audio. They are hidden on the speaker but glaring on a listener.
  - Detect jumps per panel: crop around each person, spikes ≥ 3–4× the median.
  - The speaker panel stays linked to the audio. Jumps on the speaker are acceptable.
  - If the listener *talks* (an interjection you can hear), his panel stays linked while he says it, so lips and gestures match the audio. **Never show him silent while his voice is heard.**
  - **Best case: the uncut raw take.** If the split has listener jump cuts, ask the user for the original uncut reaction footage of that stretch (say you don't have the raw).
    - Locate it by frame matching: a crop around the listener, mean abs diff ≈ 0.2 means identical frames. This also shows which raw frames the edit removed.
    - Play the raw continuously from his line (or the start of the split) to the end of the split: natural nods, no dissolve.
  - **Without the raw:** after his line, never cut his panel again. Dissolve (~0.3 s, while he settles) into the next clean listening stretch, then let it play on (ping-pong if it is too short).
  - **Verify on the render:** after the line, the panel's frame-to-frame diff stays at calm-listening level, with no spikes.

## 6. Captions (look)

- **Sizes:** base 100 px Inter Black, uppercase. Hero words are ~200 px, auto-fit to 950 px wide. 80 px was rejected as too small.
- **Word pop:** each word pops at its own time: scale .55 → 1 easeOutBack, rise 46 px, blur 7 → 0.
- **Hero words:**
  - scale 1.9 → 1 with elastic;
  - letter-spacing .12 → -.02 em;
  - coloured yellow, green, red or coral, with a glow on the spoken moment.
- **`hl` words:** yellow, with a coral underline that wipes in.
- **Boxed groups:** about 1 in 3–4 groups. Words build on solid cream/yellow/coral rectangles with dark text, a -2° tilt and 86 px type.
- **Exits:** a group exits with a 0.09 s blur-fade, except at cuts (§3.5).

## 7. Graphics

- **One infographic per idea**, revealed on the words that name its parts. Each element appears on its own word, and labels only once said.
- **Give sequences screen time.** Let all parts be on screen together before the shot ends, and keep emphasis glows on the spoken moments.
- **Graphics must not cross cuts.**
  - A graphic stays until its shot's cut and leaves inside the whip (fade over the last 0.1 s).
  - Check cut-2 … cut+2 frame by frame.
- **Keep the graphic zone clear:**
  - Graphics stay in y 1000–1640 under the card.
  - Leave clearance below hero captions (two-line heroes reach y ≈ 1040).
  - Put side labels beside a node, not above it.
- **Instagram safe zone:** nothing important above y ≈ 150, below y ≈ 1640, or right of x ≈ 960.
- **Never invent data.** Illustrative heights and counters must be flagged to the user as illustrative. Don't add brand tags or claims the speaker didn't make.
- **No white flashes.** Light leaks are fine, at cuts and on 1–2 key moments.

## 8. Audio

- **Dialogue** is normalized to ≈ -16 LUFS before the mix. Measure the source and set the gain.
- **Background music** (the user's track) plays *under* the dialogue:
  - about 14 dB below it (≈ -30 LUFS);
  - a -3 dB dip at 2.5 kHz;
  - 0.25 s fade-in and ~0.6–0.7 s fade-out at the end.
  - Keep using the same track on later videos unless told otherwise, and mention it so the user can drop it.
- **A replacement audio file** fully replaces the track. Cross-correlate it for sync; MP3s carry ~25 ms of padding, so trim it with `atrim`.
- **SFX:**
  - each graphic gets its own tech sound family (§11);
  - whooshes ≈ -34 dBFS;
  - other SFX -38 … -23 dBFS peak;
  - tasteful, never distracting.
- **Master:** -14 LUFS integrated, peak ≤ -1 dB (`volume` + `alimiter=limit=0.85`). Verify with `ebur128=peak=true`.

## 9. Delivery

- **Video:** MP4 H.264 High 4.1, yuv420p, `-crf 19–21 -maxrate 8–9M -bufsize 16–18M -preset slow -g 50`, with AAC 192k 48 kHz and `-movflags +faststart`. Keep it under 30 MB.
- Same length and fps as the source (or as the cut version).
- **Naming:** `<name>_kinetic_EN_reel_vN.mp4`.
- **Sending:** send it with SendUserFile. If the user can't find a download button: click the file card, then right-click the video and choose "Save video as".
- **Small changes:** for a change confined to a later section, re-render only that frame range (`node render.js full A B`) and concat it with the earlier frames.

---

## 10. Workflow

1. **Inspect.**
   - Run ffprobe and make a 1 fps contact sheet.
   - Find shot cuts (`select='gt(scene,0.25)',showinfo`) and convert them to frame indices.
   - Detect jump cuts inside shots (§5), per person in wide shots.
   - Identify who is in each shot.
2. **Transcribe** (§1): run Whisper-medium + Parakeet on the full file, add tight windows for disputes, and settle with CTC scoring, band charts and formants. Send the user a short progress note early.
3. **Word timing:**
   - **CTC-align** the exact transcript. Spikes sit *inside* words (often on the stressed or last syllable), so treat them as anchors, not onsets.
   - **Onset:** the end of the lowest-energy valley (full-band 48 kHz, 10 ms hop) between the previous word's last spike and this word's first spike. Take the last frame within +3 dB of the window minimum.
   - **Band-chart check:**
     - print a 20 ms band chart (lo 80–900 Hz / mid 0.9–3.5 kHz / hi 4–11 kHz) plus F1/F2, with the onsets and spikes marked;
     - check every word flagged (spike − onset > 0.15 s, or Parakeet off by > 0.2 s), and spot-check the rest;
     - stops and fricatives show as H, vowels as L+M, closures as gaps.
   - **When a manual fix disagrees with CTC by > 0.15 s,** count vowel nuclei with formants before overriding. CTC was right on a final phrase where a by-eye reading was off by a syllable.
   - **Save** `words_final.json` `[word, onset, next_onset, speaker]`.
4. **Plan per shot:**
   - which layout (full, card or split, plus card windows that hide jump cuts);
   - caption groups (§3);
   - one graphic per idea;
   - a few punch-ins;
   - whips at the cuts.
5. **Build `edit.html`** with a deterministic `render(t, frameIdx)`.
   - Preview ~20 key frames as a contact sheet.
   - Fix overlaps (captions vs graphics vs faces) before the full render.
6. **Caption QA script (run in the page).** It flags EARLY (display < onset), SHORT (visible < 0.12 s) and PUNCT. It must report 0 issues, apart from an intentional cut-forced early word.
7. **Full render** in the background (`nohup node render.js full 0 N`).
   - Poll with an `until grep -qE "DONE|ERR"` loop and read the log tail: one crash only showed as ERR.
   - Guard modulo and index math against t before an element's start (a negative index crashed a render).
8. **SFX + mix + master** (§8), then mux.
9. **QA:**
   - frame count;
   - frames cut-2 … cut+2 at every cut;
   - hero words;
   - listener-panel diff measurement;
   - centring of every shot.
   - Then send it.

## 11. Environment notes

- **Network:** Hugging Face, download.pytorch.org and dl.fbaipublicfiles.com are blocked. GitHub release downloads and PyPI work (`onnxruntime`, `kaldi-native-fbank`, `opencv-python-headless<5`). numpy and scipy are preinstalled.
- **Rendering:** Node `playwright` is preinstalled with Chromium. Use a Node `render.js` that pipes JPEG screenshots to ffmpeg (`-f image2pipe -c:v mjpeg -i - … libx264 -crf 17`). Speed is ~0.5 s/frame.
- **Fonts:** Inter (`/usr/share/fonts/opentype/inter/`), DejaVu Sans Mono. Google Fonts is blocked.
- **sherpa-onnx v1.13.5** (`…/v1.13.5/sherpa-onnx-v1.13.5-linux-x64-shared.tar.bz2`); models come from `asr-models/`:
  - `sherpa-onnx-whisper-medium` (int8 encoder/decoder/tokens; extract in the background, it takes minutes);
  - `sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8` (`--model-type=nemo_transducer`). Use it for text; its timestamps are 80 ms-coarse and can be 0.4 s off;
  - `sherpa-onnx-nemo-ctc-en-conformer-medium`: the forced aligner.
    - Run it with onnxruntime on 80-bin kaldi-native-fbank features: dither 0, snip_edges False, per-utterance mean/std normalization, input shape (1,80,T).
    - Tokenize by greedy longest match on `tokens.txt` with `▁` word prefixes; blank = the last id; frames are 40 ms.
    - Use a Viterbi CTC trellis; the same trellis scores alternative phrasings.
    - Spell acronyms as letters (`a i s d l c`, `r and d`) and merge the tokens afterwards.
- **Long jobs:** Bash calls time out at 10 min, so run long jobs with nohup and poll.

## 12. edit.html structure (single file, all state derived from t)

- **Layers, bottom to top:**
  - `#bg`: the frame blurred 38 px and darkened, with a coral radial tint and a faint 60 px grid;
  - `#stage`: `#vid` (full/card), `#pTop`/`#pBot` (split panels with border, shade and bars), the vignette and `#gfx` (SVG);
  - `#cap`;
  - light leak;
  - grain canvas (.07, overlay);
  - a top progress bar (coral → yellow).
- **Source frames:** pre-extracted with `ffmpeg -q:v 2 src/f_%04d.jpg`. Each `<img>` gets its own source when panels are unlinked (e.g. a raw reaction clip). Await `img.decode()`.
- **Data injected at build time:**
  - `WORDS` (forced-aligned words);
  - `ENV` (per-frame RMS for the speaker bars);
  - `TRACK` (per-frame static focal per shot).
- **Shots:**
  - `CUTS` array; `shot(t)` = the number of cuts ≤ t;
  - `CARDS{shot:[in0,in1]}` with no outs before cuts (except mid-shot moves timed around jump cuts);
  - `SPLIT` shot index(es).
- **Whips:** at every cut, 0.1 s each side: ±760 px translateX, blur up to 26 px, scale +6 %. Captions take the outgoing whip.
- **Easing helpers:** easeOutCubic, easeInOutCubic, easeOutExpo, easeOutBack, easeOutElastic; `prog`, `lerp`.
- **Colours:** coral #FF4D6D, yellow #FFD23F, green #2EE59D, ink #0E0E12, cream #FFF6EA, red #FF3B3B.

## 13. Infographic toolkit (pick per content; never invent data)

- **Crowd grid of avatars / robot agents** popping in sequence. Badges are added on later words (people, key-user stars, status dots).
- **Architecture flow:** agents regroup into a row, then an INTAKE pill with requests streaming in, then a HARNESS hexagon with a rotating ring, then dispatch lines with packets and green status dots.
- **Isometric layer stack:** SVG diamonds with side faces, an icon and a grid on the face, and leader-line labels. Each layer drops in on its word, the LAYER tag appears on "layer", and a cascade pulse plays at the end.
- **Missing context:** an agent head plus a dashed red puzzle slot "?", with a broken link and a red X.
- **Company brain:** two hemispheres of nodes whose links draw in, with a pulse on "brain".
- **Gauge:** a segmented semicircle that is empty and red, then fills to green with a check.
- **Cycle that never closes:** a ring of stage icons with a red gap and X on "never". A token runs around and stops at the gap; the nodes become agents on "autonomous"; a centre chip shows the term.
- **Growth bars with a rising arrow.**
- **Feedback loop:** two chasing arcs.
- **Review gate:** a human judge plus a gavel slam. The branch merges through the gate on "merge", and PRODUCTION lights green.
- **Code editor:** people's cursors, a click on "touch", a dashed highlight on "this area", lines lighting up on "everything", and packets streaming out.
- **Production rack:** a pipe of packets into server units whose LEDs go green.
- **Triangle cost / quality / time:** each vertex appears on its word. When it returns, vertices turn green with arrows on "cheaper / faster / higher quality".
- **Trace waterfall:** spans build up, and recurring patterns ("habits") get dashed rings.
- **Balance scale:** two labelled pans that tilt and then level out on "balanced", with a check.
- **Compare columns:** e.g. developers vs non-engineers. Token bars and value bars use a legend at the bottom, coins drop in, "?" appears on "why", and a dashed graduation cap shows "less education".
- **Puzzle fit:** pieces snap into slots on "fits".
- **Surfacing:** points under a wavy waterline rise above it on "surfaced", with a ring.
- **Also available:** terminal B-roll, difficulty meter, iceberg, dictionary card, org chart, equation chips, exponential chart.

## 14. SFX palette (numpy/scipy synthesis, a distinct family per graphic)

| Moment | Sound |
|---|---|
| Hero words | sub thump (pitch-dropping sine plus click) |
| Whips / cuts | very soft whoosh, alternating pan |
| Card in / out | low servo; split screen in: slide |
| Boxed captions | one soft pop-click per box (a repeated motif is fine) |
| Crowd / avatars | rising square-blip arpeggio or FM boops, one pitch each, panned |
| Missing / wrong / "never" / "why" | soft low alert + thump |
| Brain / network | fast blip cascade + hologram shimmer |
| Gauge / meter | slider glide + riser, confirm chime when full |
| Loop / ring | zip sweeps as arcs draw, ticks for a travelling token |
| Merge / snap / fit | magnetic snap, bass blip |
| Judge / lock | lock click + resonant tone |
| Code / data | dot-matrix blips, data chirp, scanner sweep |
| Balance | zip on the pan, resonant tone + chime on "balanced" |
| Value / coins / surfacing | soft plops, chime |

Normalize each sound, then place it at an absolute peak level. Re-time every SFX whenever the animation timings change.
