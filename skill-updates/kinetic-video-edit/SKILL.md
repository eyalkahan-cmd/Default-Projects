---
name: "kinetic-video-edit"
description: "Edit a talking-head or podcast video into a dynamic social clip with verbatim kinetic-typography captions, infographics, zooms, transitions and subtle tech SFX."
---

# Kinetic video edit (captions + motion graphics)

Turn an uploaded clip (usually vertical 1080x1920 podcast footage) into a studio-grade edit: word-synced kinetic captions, infographics that illustrate what is said, punch-in zooms, split-screen card moments, whip transitions, and tasteful sound design. Reply to the user in their language (often Hebrew); captions are in the language the speaker actually speaks.

## The user's standing preferences (learned the hard way)
1. **Captions are verbatim.** Write exactly what the speaker says, word for word, even when the grammar is off ("We're saying builders", "for his employee", "can and are managing agents", "a one intake", "that it's going to", "all the other agent"). Never paraphrase or polish. Check which language is actually spoken: an Israeli speaker may be speaking English with an accent. Whisper forced to `he` on English speech outputs garbage Hebrew mixed with English words, which is a tell.
   - ASR models "correct" grammar (Parakeet wrote "that is" / "agents" where the speaker said "that it's" / "agent"), so a single transcript is never enough. Where models disagree, decide by evidence: compare CTC forced-alignment scores of each variant on that window (higher wins), and check the band-energy printout (e.g. "it's" = vowel + stop closure + /s/; "is" has no closure; "it is" has two vowels).
   - A filled pause ("have… ehhh… all the") makes Whisper hallucinate ("a or the"). Don't mistake the hesitation for the next word: the word appears only when it is actually spoken, after the hesitation. Check with LPC formants (scipy `solve_toeplitz`, 25 ms frames at 16 kHz): a hesitation "eh/uh" holds steady F1≈400–500 / F2≈1800–2000, while "all" (/ɔl/) has F2≈900–1100. Fillers themselves are not captioned.
2. **No punctuation in captions.** Strip commas, periods, question/exclamation marks, colons etc. from every caption word. Keep apostrophes inside contractions (IT'S, WE'RE) since they are spelling, not punctuation.
3. **Nothing appears before it is said, and sync must be exact (especially toward the end of the clip).** No caption word, tag or graphic label may show a word before the speaker says it, including B-roll titles such as "STEP 1 · BUILD". Each word appears at its own forced-aligned onset +0.02s. Syllable-proportional estimates are NOT accurate enough (they drifted up to 0.4s on the last phrase); use the forced-alignment workflow below.
   - Never end a caption group on a short word that is immediately followed by the next group (the/to/have/a): it flashes for 2–3 frames. Move it to the start of the next group ("THE / SECURITY / LAYER", "TO / DISPATCH").
   - Group by phrase, not just by timing: a word belongs with the phrase it opens ("WE'RE GOING / TO HAVE" then "ALL THE / JUDGMENT / LAYER", not "...TO HAVE ALL" / "THE JUDGMENT LAYER"). Multi-line groups break into short balanced lines (2 words per line), hero word on its own line.
   - A caption group must never be on screen on the first frame of the next shot: give the last group before every cut `b = cut` with no exit fade (it rides the whip). A word whose onset is within ~0.1s before a cut but which is mostly spoken after it starts in the new shot (display at cut + 0.02s; late is allowed, early is not).
   - A word spoken right before a cut stays up until the cut and leaves with the whip (the caption layer takes the stage's whip transform) instead of fading early.
   - **The one allowed exception — forced by a cut:** if a word's onset is so close to a cut that it would be readable for less than ~0.2s before the outgoing whip starts (e.g. "that IT'S" spoken 3.01s, cut at 3.16s), show it slightly early, popping right after the previous word of the same group (previous word's display time + 0.07s; a `pre` flag), so it reads together with it ("THAT IT'S"). Use this only when the cut makes it necessary, never elsewhere; move the word's SFX with it, and the QA script's EARLY flag on that word is then expected.
4. **Caption size:** base caption font is about 100px on a 1080-wide frame. Hero words are about 200px, auto-fit to 950px width. Small 80px lines were rejected as too small.
5. **Mix in boxed captions.** Now and then (about 1 in 3–4 groups), show a caption whose words build up on solid rectangles (cream, yellow or coral, dark text, slight -2° tilt). These may be slightly smaller (about 86px), but don't shrink them more than that.
6. **No white flashes.** Light leaks are acceptable.
7. **Graphics must not cross cuts.** Every overlay graphic exits during the outgoing transition and is fully gone on the first frame of the next shot. Check every cut frame by frame (cut-2 … cut+2).
8. **Give graphic sequences screen time.** When an infographic builds in steps (e.g. YOU → AGENT = MANAGER → EMPLOYEE), reveal all parts in quick sequence so the complete graphic is on screen together before the shot ends. Keep the emphasis (a glow) on the word's spoken moment.
9. **SFX:** each infographic gets its own distinct tech-style sound family (no repeats, except for a repeated animation motif). Whooshes are very soft, around -34 dBFS peak. Other SFX peak around -36 to -23 dBFS against dialogue at about -16 LUFS. Tasteful, never distracting.
10. **Replacement audio:** if the user supplies an audio file, it fully replaces the video's audio track. Cross-correlate it with the original to check sync; MP3s often carry about 25ms encoder padding, so trim it with `atrim=start=…`.
11. **Deliverable:** MP4 H.264 + AAC, same length and fps as the source, under 30 MB so it can be sent (`-crf 21 -maxrate 7M -bufsize 14M -preset slow`). Name versions `<name>_kinetic_EN_vN.mp4`. If the user can't find a download button, tell them to click the file card with the play icon, then right-click the video and choose "Save video as".
12. **Background music** (when the user supplies a track): it plays *under* the original dialogue (it does not replace it, unlike rule 9). Dialogue ≈ -16 LUFS, music about 14 dB below (≈ -30 LUFS; a -3 dB dip at 2.5 kHz clears the voice), 0.25s fade-in, ~0.6s fade-out at the end, SFX on top.
13. **Instagram Reel delivery:** 1080x1920, `-profile:v high -level 4.1 -pix_fmt yuv420p -crf 19 -maxrate 9M -bufsize 18M -g 2×fps -c:a aac -b:a 192k -ar 48000 -movflags +faststart`. Master to -14 LUFS integrated, peak ≤ -1 dB (`volume` + `alimiter=limit=0.85`, verify with `ebur128=peak=true`). Keep captions/graphics inside the safe zone: nothing important above y≈150, below y≈1640, or right of x≈960 (IG buttons).
14. **16:9 source → 9:16:** full-screen shots are a cover-crop centred on the speaker's face (find face coordinates on a gridded frame grab per shot); card mode shows more of the frame. Mention to the user that the full-screen crop is a ~1.78× upscale.
15. **Two-person split screen (speaker + listener), use sparingly.** When the source has a wide shot with both people (or both are visible in the frame), an optional layout stacks two crops vertically: the speaker in one half, the listener reacting in the other (each a cover-crop on that person's face, thin divider, the same card styling). In this layout the kinetic captions move to the middle, sitting on the divider between the two halves (a per-group y override ≈ 960), and it replaces infographics / heavy typography for that stretch.
   - Use it at most once or twice per video, only in a stretch with no cuts and continuous speech flow (both crops must come from the same uncut shot, and it ends before the next cut like any other overlay).
   - It is a variety tool: worth adding when the video is somewhat longer, to alternate with full-screen and card-mode (infographic) sections. Don't force it into short clips that are already full of graphics.
   - Ramp in/out like card mode (≈0.45s easeInOut); add a soft servo/slide SFX for the split.
   - **Unlink the listener panel.** Interview footage is often already cut with jump cuts (same framing, a few frames removed) that only follow the speaker's audio. They are hidden on the speaker but glaring on a listener, and the listener may gesture or talk in between. Detect them per panel (frame-to-frame mean abs diff of a downscaled crop around each person; spikes ≥3× the median) and look at the listener's frames. Then drive the listener panel from its own frame map; the speaker panel stays linked to the audio.
     - If the listener *says something* during the split (an interjection you can hear), his panel must stay linked to the source while he says it, so the lips and gestures match the audio. Never show him silent while his voice is heard.
     - Best case: the uncut raw take of the listener. If the delivered clip has jump cuts in the split, ask the user for the original uncut reaction footage of that stretch (mention you don't have the raw). When it arrives, locate it by frame matching on a downscaled crop around the listener (mean abs diff ≈0.2 means identical frames; this also shows which raw frames the edit removed). Then play the raw continuously from the start of his line to the end of the split. He keeps reacting/nodding naturally: no dissolve, no ping-pong.
     - Without raw footage, after his line never cut his panel again for the rest of the split: dissolve (~0.3s, easeInOut, while he settles) from the last frame of his talking shot into the next clean listening stretch, then let that stretch play on (ping-pong forward/backward if it is too short) until the split ends.
     - Before his line, use the linked footage if it is clean, otherwise a clean listening stretch the same way.
     - Verify by measuring the rendered panel: frame-to-frame diff after the line must stay at the calm-listening level (no spikes).
   - Never ramp out of card mode back to full screen just before a cut into another layout (split screen, card): the zoom-out followed a few frames later by the new layout reads as jumpy. Stay in the current layout until the cut and let the whip carry it out; the graphic on screen also stays until the cut and leaves inside the whip.
   - When the user asks to remove lines (e.g. the interviewer's interjections), cut them out of both picture and audio (frame-aligned, 12–15 ms audio fades at each join), ideally so a join lands on an existing shot cut; re-run ASR on the joins to confirm nothing of the removed line is left, and re-time every caption, graphic and SFX from the shifted word list.
   - Mark the active speaker: coral border + glow and small audio bars driven by the real per-frame RMS on the speaking panel, listener panel dimmed ~28%; switch on the first word of each turn.
16. **Two speakers in the audio:** captions include the interviewer's words too (verbatim), in a distinct style (dark chips with a coral edge) so viewers can tell who is talking. Decide who said what from the picture, not the ASR: grab frames (crop around both mouths) across the disputed window; also an off-screen interjection ("yeah") during a close-up is the other person if the visible speaker's mouth is closed. Overlapping speech makes ASR invent words ("this year", "in here"); drop them unless the CTC variant scores and frames support them.

## Environment notes
- Hugging Face, download.pytorch.org and dl.fbaipublicfiles.com are blocked (no torch / torchaudio aligners). GitHub release downloads work. PyPI may work (`pip install onnxruntime kaldi-native-fbank` succeeded); numpy and scipy are preinstalled. Node `playwright` is preinstalled and works with the bundled Chromium (Python playwright may not be installed; a Node `render.js` is fine).
- ASR: download the sherpa-onnx Linux binary and Whisper models from GitHub releases:
  - `https://github.com/k2-fsa/sherpa-onnx/releases/download/v1.13.5/sherpa-onnx-v1.13.5-linux-x64-shared.tar.bz2`
  - `https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-medium.tar.bz2` (use medium for accuracy; extract only the int8 encoder, decoder and tokens files, and run download and extraction with nohup in the background because it takes several minutes).
  - Run: `LD_LIBRARY_PATH=$B/lib $B/bin/sherpa-onnx-offline --model-type=whisper --whisper-encoder=…int8.onnx --whisper-decoder=…int8.onnx --tokens=…tokens.txt --whisper-language=en --num-threads=2 file1.wav file2.wav …` (16 kHz mono WAV).
  - Second opinion with timestamps: `asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8.tar.bz2` (`--encoder/--decoder/--joiner … --model-type=nemo_transducer`). Its JSON has token `timestamps`, but they are only 80 ms-coarse emission times and can be 0.4s+ off; use it for text cross-checking, not final timing.
  - Forced aligner: `asr-models/sherpa-onnx-nemo-ctc-en-conformer-medium.tar.bz2` (BPE CTC, 40 ms frames, blank = last token id). Run `model.onnx` with onnxruntime on 80-bin kaldi-native-fbank features (dither 0, snip_edges False, per-utterance mean/std normalisation, input shape (1,80,T)), tokenize the exact transcript by greedy longest match on `tokens.txt` with `▁` word prefixes, and Viterbi-align (standard CTC trellis). The same trellis scores alternative phrasings on a window to settle disputed words.
- Rendering: Python Playwright with the preinstalled Chromium. Fonts: Inter Display Black (`/usr/share/fonts/opentype/inter/`) for captions, DejaVu Sans Mono Bold for terminal text. Google Fonts is blocked.
- Speed is about 0.5–0.8 s/frame, so a 28 s clip at 30 fps takes 7–11 minutes. Always run full renders with nohup in the background and poll. Note that `pgrep -f` can match the polling shell itself; match `^python3 render.py full`.
- Bash calls time out at 10 minutes, so never block on a long job in one call.

## Workflow
1. **Inspect:** run ffprobe (size, fps, duration), make a 1 fps contact sheet, and find shot cuts with `select='gt(scene,0.25)',showinfo`. Convert cut times to exact frame indices.
2. **Transcribe:**
   - Run a full pass, then chunked passes at energy dips (an RMS envelope at 10ms frames shows the pauses). The chunk texts tell you which words fall in which window.
   - Send the user a short progress message early.
   - Also run Parakeet and diff the texts; resolve every disagreement by CTC variant scoring + spectral check (rule 1). Fix the final transcript, punctuation-free, in `transcript.txt`.
3. **Word timing (forced alignment, then verify by ear-equivalent):**
   - CTC-align the exact transcript → each word's first/last token spike. Spikes sit *inside* the word (often on the stressed or last syllable), so they are anchors, not onsets.
   - Onset = end of the lowest-energy valley (full-band 48 kHz envelope, 10 ms hop) between the previous word's last spike and this word's first spike: take the last frame within +3 dB of the window minimum, so pauses don't make words appear early.
   - Then print a 20 ms lo(80–900 Hz)/mid(0.9–3.5 kHz)/hi(4–11 kHz) band chart with the onsets marked and check every word: stop bursts and fricatives (/t k s ð h dʒ/) show as H, vowels as L+M, closures as gaps. Correct by hand where the valley rule picked a syllable boundary inside a word (typical misses: the word after a long multi-syllable word, stretched vowels / filled pauses, the last 2–3 words of the clip).
   - When a manual correction disagrees with the CTC spike by more than ~0.15s, re-check it with formants before overriding: count vowel nuclei per word and match them to the spikes. In practice the CTC spikes were right on the final phrase (all / the / judgment / layer) and a by-eye band reading shifted it by a syllable.
   - Save as `words_final.json` `[word, onset, next_onset]`. Display time = onset + 0.02.
   - Earlier syllable-proportional distribution is only a fallback when no aligner is available, and the user must be told the timing is approximate.
4. **Plan the edit** per shot and phrase:
   - caption groups (2–7 words, with hero words for the key concepts);
   - one infographic per idea;
   - card-mode (split screen) windows;
   - punch-in times on hero words;
   - which cuts get whip transitions.
5. **Build `edit.html`** with a deterministic `render(t, frameIdx)` (structure below), then preview about 20 key frames as a contact sheet and fix issues before the full render.
6. **Full render:** pipe JPEG screenshots into ffmpeg (`-f image2pipe -c:v mjpeg -i - … libx264 -crf 17`).
7. **SFX:** synthesize with numpy and scipy (below), mix with `amix=normalize=0` and `alimiter`, then mux and re-encode under 30 MB.
8. **QA:**
   - frame count matches the source;
   - check frames around every cut and every hero word;
   - confirm no word or graphic appears before it is spoken;
   - run a caption QA script in the page (`groups` → every word): flag EARLY (display < onset), SHORT (on screen < 0.12s before its group exits) and PUNCT (any `.,!?;:` in the text). Must report 0 issues before the full render.
   - Derive all animation, punch-in and SFX times from `W(i)` (word index), never hard-coded seconds, so a timing fix propagates everywhere; re-run the SFX script after any timing change.
   - Send the file with SendUserFile.

## edit.html structure (single file, all state derived from t)
- Layers, bottom to top:
  - `#bg`: the same frame, blurred 38px, darkened, with a coral radial tint and a faint 60px grid. It is visible in card mode.
  - `#vid` with `#vimg`, a dim overlay and a border.
  - vignette;
  - `#gfx` (infographics);
  - `#cap` (captions);
  - light leak;
  - grain canvas (opacity .07, overlay blend, shifted per frame);
  - top progress bar (coral to yellow gradient).
- Source frames are pre-extracted with `ffmpeg -q:v 2 src/f_%04d.jpg`. `render` sets `img.src` and awaits `img.decode()`.
- Easing helpers: easeOutCubic, easeInOutCubic, easeOutExpo, easeOutBack, easeOutElastic; `prog(t,a,b)`, `lerp`, `win(t,a,b,fi,fo)`.
- **Camera:**
  - per-shot slow push of +4.5%;
  - an intro zoom from 1.16 to 1.0;
  - punch-ins of +6–14% with easeOutExpo over 0.22s, starting exactly on the hero word, reset at each shot;
  - the transform origin sits at the face (about 32% from the top on close-ups).
- **Card mode (split screen):** the video scales to 0.585 at the top (radius 54, white border, deep shadow), with the infographic in the lower area. Ramps are 0.45s in and 0.38s out with easeInOut, and must end exactly at the next cut.
- **Whip transitions** at selected cuts: 0.1s on each side, ±760px translateX, blur up to 26px, scale +6%. Graphics in that shot move with the whip and fade out within it.
- **Captions:**
  - Groups carry `{a, b, cls, y, w:[[text, t, flags, br]]}`.
  - Each word pops at its own `t`: scale .55→1 with easeOutBack, rise 46px, blur 7→0.
  - Hero words (`big`) scale 1.9→1 with elastic, letter-spacing .12→-.02em, in yellow, green, red or coral.
  - `hl` words are yellow with a coral underline bar that wipes in.
  - A group exits with a 0.09s blur-fade.
  - Default y is about 1300. In card mode it is about 1105, straddling the card's bottom edge. A per-group y override is allowed (e.g. 960, to sit a hero word on a split-screen divider).
- **Colors:** coral #FF4D6D, yellow #FFD23F, green #2EE59D, ink #0E0E12, cream #FFF6EA, red #FF3B3B.

## Infographic toolkit (pick per content; never invent data)
- Crowd grid of avatars popping in sequence ("many builders").
- Terminal B-roll (synthetic, since there is no stock footage access): typed command, check lines, progress bar, a "LIVE" line. Use neutral verbs that don't pre-empt spoken words.
- Difficulty or progress meter.
- Iceberg: a small tip above an animated waterline, with the large mass revealed below and labelled pills. The mass turns red on "hard".
- Dictionary card that redefines a term, with numbered lines and highlighter marks.
- Org chart: a manager node with lines drawing to agent nodes (with status dots), a dashed accountability enclosure and a shield icon.
- Equation chips: A → B = C → D, with drawing arrows.
- Exponential chart panel (glass panel with backdrop blur) with a curve, a moving dot and a counter.
- Architecture flow: robot-agent grid → agents regroup into a row → INTAKE pill (requests streaming in) → HARNESS hexagon (rotating dashed ring) → dispatch lines with travelling packets → green status dots per agent.
- Isometric layer stack (SVG diamonds with side faces, grid + icon on the top face, flat labels with leader lines on the left): each layer drops in with easeOutBack on its word, its "LAYER" tag appears on the word "layer", scan sweep on landing, cascade pulse at the end.

Illustrative numbers (10%/90%, counters) must be flagged to the user as illustrative. Don't add brand tags or claims the speaker didn't say.

## SFX palette (numpy/scipy synthesis, a distinct family per graphic)
| Moment | Sound |
|---|---|
| Hero words | sub thump (pitch-dropping sine plus a tiny click); positive two-tone blip for "easy"; soft low alert for "hard" |
| Crowd | rising square-blip arpeggio, panned across the grid |
| Terminal | key clicks, high check ticks, stepped bit-crushed data chirp, 3-note success |
| Meter | slider glide |
| Card mode | servo motor in and out, low |
| Iceberg | sonar ping with echo, glassy bell per label |
| Dictionary | hologram shimmer chord, dot-matrix blip bursts, scanner sweep |
| Org chart | power-on rise, bit-crushed data stream, FM robot boops (one pitch per agent), accelerating scan ticks, lock clicks plus a resonant tone, confirm chime |
| Equation | magnetic snaps, zip sweeps, bass blip on "=" |
| Chart | power-up hum, counter ticks that speed up with the curve, very soft riser |
| Architecture flow | magnetic snap + bass blip (intake), power-on + resonant tone (harness), data chirp + line zips (dispatch), FM boops (agents live) |
| Layer stack | sonar (base), lock clicks + resonant tone (security), scanner + dot-matrix (audit), hologram shimmer (judgment), confirm chime (final pulse) |
| Boxed captions | one soft pop-click per box (a repeated motif is fine) |

Normalize each sound, then place it at an absolute peak level. Re-time every SFX whenever the animation timings change.