# Video 1: SFX cue sheet (v3, frame-level)

How the timing was set:
- MediaPipe Pose tracked the child in every frame (25 fps).
- Every footstep was checked by eye on 25 fps full-body close-ups (`bodysheet.py`) and placed on the frame where the foot lands.
- Ambience fades sit exactly on the visual morph between locations. For example, the sea only fades in at 107.0–108.0 s, as the water enters the frame.

## Ambience (fade-in → fade-out, seconds)
| Location | In | Out | Sound |
|---|---|---|---|
| Space | 0.0–1.6 | — | silent (space) |
| Into the clouds | 1.6–2.5 | 3.4–4.4 | howling wind (low) |
| Aerial city | 3.4–3.9 | 4.9–5.5 | daytime city |
| Living room | 4.9–5.5 | 19.2–19.8 | room tone |
| Playground | 19.2–19.7 | 30.1–30.6 | park birds/leaves |
| House interiors (marble room, twins, couch, hallway) | 30.1–30.6 | 51.1–51.6 | room tone |
| Front garden → park | 51.1–51.6 | 68.3–68.8 | garden birds (+ far city from 59.2, when the skyline appears) |
| Wet plaza | 68.3–68.8 | 74.2–74.7 | dripping, wet street |
| Wooden studio | 74.2–74.7 | 80.8–81.4 | room tone |
| Lawn (firefighter) | 80.8–81.4 | 90.6–91.2 | garden birds |
| Farm + field | 90.6–91.2 | 106.0–107.0 | countryside |
| Beach | 107.0–108.0 | end | gentle waves |

## Footsteps (surface → recording)
| Time | Surface | Steps |
|---|---|---|
| 9.3–11.6 | foam mat → rug (crawling) | 9 |
| 17.9–19.4 | rug, barefoot | 5 |
| 19.6–21.4 | playground rubber, barefoot | 7 |
| 29.0–30.2 | off the swing, running on rubber | 9 |
| 30.4–32.5 | marble floor, barefoot | 12 |
| 36.7–37.4 | marble, gets up from the chair | 4 |
| 50.6–50.9 | hallway floor, shoes | 2 |
| 51.3–52.7 | stone entrance | 5 |
| 53.1–54.4, 57.6–58.1 | stone steps | 8 |
| 58.6–61.1 | garden turf | 10 |
| 61.6–66.0 | wooden ladder rungs | 10 |
| 66.4–68.4 | turf | 10 |
| 68.6–74.2 | wet plaza | 22 |
| 74.4–81.0 | wooden studio floor (incl. kneel/crawl) | 16 |
| 81.3–84.4, 88.1–90.5 | lawn | 24 |
| 90.8–92.2, 97.6–99.2 | farm dirt | 15 |
| 92.4–92.6 | wooden mounting block | 2 |
| 99.4–105.9 | field grass | 12 |
| 106.1–108.2 | beach sand | 11 |

Removed: all laughs, toy sounds, transition whooshes, horse snort, door.
