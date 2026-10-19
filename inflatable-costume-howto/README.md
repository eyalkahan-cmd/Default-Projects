# איך מנפחים תחפושת מתנפחת — How-to video (16:9)

47-second 1920×1080 motion-graphics explainer with Hebrew narration.

- **Final render:** `out/inflatable-costume-howto.mp4`
- **Narration:** ElevenLabs `eleven_v3`, voice "Itai – Upbeat Social Creator" (`public/narration.mp3`)
- **Images:** dinosaur costume generated with ElevenLabs (GPT Image 2.5), background removed with BiRefNet (`public/dino_cut.png`; source `public/dino1.png`)
- **Motion graphics:** Remotion (React/SVG). Battery box, power bank, fan, zipper, switch are hand-built SVG in `src/illustrations.tsx`
- **Music & SFX:** original, synthesized by `scripts/make_audio.py`
- **Font:** Rubik (OFL), bundled in `public/fonts/`

## Structure

| Scene | Time | Content |
|---|---|---|
| Hook | 0–3.2s | Dino springs/inflates in, title |
| 01 מקור כוח | 3.2–11.5s | AA batteries drop into the box · or Power Bank → USB → fan |
| 02 חיבור והצמדה | 11.5–21.2s | Plug into the box, dive into the costume, clip onto belt |
| 03 אוטמים | 21.2–34.4s | Warning, air leaking, zipper closing, seal-point checklist |
| 04 הפעלה | 34.4–39.1s | Toggle to ON, fan sucks in air |
| Finale | 39.1–47s | Costume inflates with a 1–2 min timer, confetti |

Scene timings and captions live in `src/theme.ts` (aligned to pauses in the narration).

## Commands

```bash
npm i
npm run dev                      # Remotion Studio
python3 scripts/make_audio.py    # regenerate music + SFX
# render (point at a local Chrome if Remotion can't download one)
REMOTION_CHROME=/path/to/chrome npx remotion render InflatableHowTo out/inflatable-costume-howto.mp4 --crf=18
```
