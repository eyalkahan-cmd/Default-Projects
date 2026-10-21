# Kling credit ledger: Pumpit tutorial

Approved: **Hybrid plan, ceiling 750 credits** (user approval, 2026-10-20).
Starting balance: **1567** credits.

| # | Scene | Model / mode | Settings | Est. | Balance before | Balance after | Actual | Result | Remaining of 750 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K6 keyframe: inflated T-Rex (2 variants) | Kling Image 3.0 Omni, image-to-image | 2K, 16:9 | ~2–4 | 1567 | 1563 | **4** (verified) | ✅ v2 selected (faithful to product) | 746 |

## Verified rates (from eyalkahan-cmd/kling, measured on this account)
- kling-video-v4_0, 1080p, first/tail frames: **13.5 credits/s** (6 s ≈ 81, 8 s = 108)
- kling-video-v3_0, 1080p, no audio: **8 credits/s**
- kling-video-v3_0_omni, 1080p, with audio: ~12 credits/s
- Kling Image 3.0 Omni, 2K: 2 credits/image (measured here: 2 images = 4)

## Revised plan within the 750 ceiling (6 s default per user rule)
| Shot | Model | Duration | Est. | Retake reserve |
|---|---|---|---|---|
| K6 inflation (deflated → inflated) | v4.0 | 8 s | 108 | 108 |
| K3 stepping into the costume | v4.0 | 6 s | 81 | 81 |
| K1 opening | v4.0 | 6 s | 81 | 0 |
| K7 celebration | v4.0 | 6 s | 81 | 0 |
| K5 zipper macro | v3.0, no audio | 5 s | 40 | 40 |
| Keyframe images | Image 3.0 Omni | | ~30 | |
| **Total** | | | **min ~421 · max ~650** | |

Process: work autonomously within the 750 ceiling (user: "I trust you"). Stop and report on any charge anomaly, an extra retake beyond plan, or an error.
| 2 | K6 keyframe: deflated T-Rex (edit of v2, 2 variants) | Kling Image 3.0 Omni, image-to-image | 2K, 16:9 | 4 | 1563 | 1559 | 4 | ❌ rejected: print pattern lost, shape not credible | 742 |
| 3 | K6 inflation: generate DEFLATION from inflated v2, reverse in edit | Kling 4.0, image-to-video, first frame only | 1080p, 8 s | 108 | 1559 | 1451 | **108** (verified) | ⚠️ identity and print held, but the costume collapses flat to the floor with nobody inside (not realistic with a wearer). Awaiting decision | 634 |
| 4 | K6 retake: realistic deflated start frame (2 variants) | **Nano Banana Pro**, image-to-image | 2K, 16:9 | ~4–8 (estimated) | 1451 | 1411 | **40** (verified). ⚠️ ANOMALY: 20/image, ~10× the estimate | v1 ✅ print preserved, half-deflated pose. v2 still in queue | 486 |

## Cinematic rebuild 3.0: Kling inflation test (user approval 2026-10-21: 81 cr, max 162 with one retake)
Context: the 3.0 brief barred Kling; the user explicitly re-authorised this single test after reviewing the plan, prompt and cost.
| # | Shot | Model / mode | Settings | Est. | Balance before | Balance after | Actual | Result |
|---|---|---|---|---|---|---|---|---|
| 5 | Inflation test: first = kf_deflated_nbp_v1, tail = kf_inflated_v2 reframed 1.12× (push-in) | Kling 4.0, image-to-video, first + tail frames | 1080p, 6 s, 1 video | 81 | 1431 | 1350 | **81** (verified) | ✅ print and identity held, real push-in, natural head lift; arms gesture mid-shot; start already fairly full (inflation range moderate). Awaiting user review |

Note: balance before #5 was 1431, 20 above the 1411 recorded after #4 (likely refund of the unfinished Nano Banana Pro v2).
