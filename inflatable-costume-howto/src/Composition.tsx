import { AbsoluteFill, Composition, Sequence, staticFile, interpolate } from "remotion";
import { Audio } from "@remotion/media";
import { Captions, Wipe } from "./components";
import {
  ConnectScene,
  HookScene,
  InflateScene,
  PowerScene,
  SealScene,
  SwitchScene,
} from "./scenes";
import { C, FPS, H, SCENES, TOTAL_SECONDS, W, s } from "./theme";

const NARRATION_END = 44.2;

export const InflatableHowTo: React.FC = () => {
  const scenes: [keyof typeof SCENES, React.FC, string, string][] = [
    ["hook", HookScene, C.lime, C.pink],
    ["power", PowerScene, C.yellow, C.purple],
    ["connect", ConnectScene, C.pink, C.cyan],
    ["seal", SealScene, C.red, C.yellow],
    ["switchOn", SwitchScene, C.cyan, C.lime],
    ["inflate", InflateScene, C.lime, C.pink],
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bgDeep }}>
      {scenes.map(([key, Scene]) => {
        const [a, b] = SCENES[key];
        return (
          <Sequence key={key} name={key} from={s(a)} durationInFrames={s(b) - s(a)}>
            <Scene />
          </Sequence>
        );
      })}
      {scenes.slice(1).map(([key, , c1, c2]) => (
        <Wipe key={key} at={s(SCENES[key][0])} c1={c1} c2={c2} />
      ))}
      <Captions />
      <Audio src={staticFile("narration.mp3")} />
      <Audio
        src={staticFile("music.mp3")}
        volume={(f) =>
          interpolate(f, [0, s(NARRATION_END), s(NARRATION_END + 0.6)], [0.13, 0.13, 0.4], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </AbsoluteFill>
  );
};

export const MyComposition = () => {
  return (
    <Composition
      id="InflatableHowTo"
      component={InflatableHowTo}
      durationInFrames={s(TOTAL_SECONDS)}
      fps={FPS}
      width={W}
      height={H}
    />
  );
};
