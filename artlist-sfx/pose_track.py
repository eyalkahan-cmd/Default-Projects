"""Track the child's feet in every frame with MediaPipe Pose; dump per-frame keypoints."""
import sys, json, cv2
import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

video, model, out = sys.argv[1:4]
opts = vision.PoseLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=model),
    running_mode=vision.RunningMode.VIDEO,
    num_poses=3, min_pose_detection_confidence=0.3, min_tracking_confidence=0.3)
lm = vision.PoseLandmarker.create_from_options(opts)
cap = cv2.VideoCapture(video)
fps = cap.get(cv2.CAP_PROP_FPS)
KEEP = {"lhip": 23, "rhip": 24, "lknee": 25, "rknee": 26, "lank": 27, "rank": 28,
        "lheel": 29, "rheel": 30, "ltoe": 31, "rtoe": 32, "nose": 0}
rows, i = [], 0
while True:
    ok, frame = cap.read()
    if not ok:
        break
    h, w = frame.shape[:2]
    img = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    res = lm.detect_for_video(img, int(i * 1000 / fps))
    poses = []
    for p in res.pose_landmarks:
        poses.append({k: (p[j].x * w, p[j].y * h, p[j].visibility) for k, j in KEEP.items()})
    rows.append({"f": i, "t": i / fps, "poses": poses})
    i += 1
json.dump({"fps": fps, "w": w, "h": h, "frames": rows}, open(out, "w"))
print("frames", i, "fps", fps)
