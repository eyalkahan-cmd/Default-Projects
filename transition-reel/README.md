# Transition reel – bike to wind tunnel (9:16, 14.6s)

Remotion project that edits the AI transition clip (photo 1 → photo 2) into a Reels/TikTok edit.

- **0–1.8s hook**: both photos slam in as cards – "רק 2 תמונות" / "תראו איזה מעבר גדילה יצרנו"
- **1.8–2.2s**: photo 1 flies to full screen and becomes the first frame of the clip
- **2.2–10.9s**: the AI clip with speed ramps (1.25x ride → 0.5x slow-mo takeoff on the music drop → 1x morph → 0.8x tunnel reveal), flash and shake on hits, captions, and a top progress bar from photo 1 to photo 2
- **10.87–14.6s** (on the first strong beat after the thumbs-up; per-version `cut` frame): before/after slider of the two photos with a growth-video line; persistent "קטע מעבר מתוך סרטון גדילה" badge and "רוצים סרטון גדילה? פרטים באתר: OneStory.co.il" CTA from the music drop (takeoff)

Music: "Get Up (Gear Up) – Instrumental" by OLLiGAN (Artlist, licensed under the account's plan); the first bass kick of the drop (70.47s) lands exactly on the takeoff from the ramp lip (frame ~135).
Off-road riding SFX: "Mountain Biking – Riding on Dirt Road, Fast" by Marcello Del Monaco (Artlist), under the ride (from 3s) up to the takeoff; wind bed "Under the Weather – Freezing Wind" by DT Sound (Artlist) runs over the freefall shot and eases out before the FlyBox reveal. Extra layers (Artlist): helmet visor snap "Modern Motorcycle – Lowering Helmet Visor" (MAD ROBOT Sound Lab) when the goggles come down (frame 78); "High Winds – Strong Wind Ambience, Gusts Howling" (Cinematic Sound Design) as a second wind layer from the takeoff through the tunnel; "Terrific Textiles – Cotton Fabric, Fast, Flapping" (Milciclos) for clothes flapping in the freefall and tunnel airflow. Whoosh, boom, riser and snap are synthesized by `audio/make_sfx.py`.

### Version 2 – different music (`TransitionReelV2`)
Same edit with "Own the Moment" by Korshun (Artlist, 93 BPM). The heavy section of the track starts at 41.82s and lands exactly on the takeoff, and it runs through to the end of the reel; the groove before it plays under the hook and the ride. The CTA pulse follows the track's tempo. Music versions are defined in `MUSIC_V1` / `MUSIC_V2` / `MUSIC_V3` / `MUSIC_V4` in `src/Composition.tsx`.

### Version 3 – "Break It Down" by Ikoliks (`TransitionReelV3`)
Artlist, 105 BPM. The drum roll at the end of the build runs under the riser and the heavy section (104.0s) lands on the takeoff, running to the end of the reel.

### Version 4 – "Run It Up" by Ikoliks (`TransitionReelV4`)
Artlist, 100 BPM. The build and the moment of silence before the drop run under the riser; the drop (57.78s) lands on the takeoff, and the full section runs to the end of the reel.

```bash
npm i
npm run frames
npx remotion studio
npx remotion render TransitionReel out/transition-reel.mp4 --codec=h264 --crf=18
npx remotion render TransitionReelV2 out/transition-reel-music2.mp4 --codec=h264 --crf=18
npx remotion render TransitionReelV3 out/transition-reel-music3.mp4 --codec=h264 --crf=18
npx remotion render TransitionReelV4 out/transition-reel-music4.mp4 --codec=h264 --crf=18
```
