# Transition reel – bike to wind tunnel (9:16, 14.6s)

Remotion project that edits the AI transition clip (photo 1 → photo 2) into a Reels/TikTok edit.

- **0–1.8s hook**: both photos slam in as cards – "רק 2 תמונות" / "תראו איזה מעבר גדילה יצרנו"
- **1.8–2.2s**: photo 1 flies to full screen and becomes the first frame of the clip
- **2.2–11.6s**: the AI clip with speed ramps (1.25x ride → 0.5x slow-mo takeoff on the music drop → 1x morph → 0.8x tunnel reveal), flash and shake on hits, captions, and a top progress bar from photo 1 to photo 2
- **11.6–14.6s**: before/after slider of the two photos with a growth-video line; persistent "קטע מעבר מתוך סרטון גדילה" badge and "רוצים סרטון גדילה? פרטים באתר: OneStory.co.il" CTA from 2s

Music: "Get Up (Gear Up) – Instrumental" by OLLiGAN (Artlist, licensed under the account's plan); the drop (70.27s) lands on the takeoff.
SFX (whoosh, boom, riser, snap) are synthesized by `audio/make_sfx.py`.

```bash
npm i
npx remotion studio
npx remotion render TransitionReel out/transition-reel.mp4 --codec=h264 --crf=18
```
