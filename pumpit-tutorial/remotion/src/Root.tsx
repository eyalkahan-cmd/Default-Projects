import { Composition } from "remotion";
import { Main } from "./Main";
import { f, FPS, H, TOTAL_SEC, W } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PumpitTutorial"
      component={Main}
      durationInFrames={f(TOTAL_SEC)}
      fps={FPS}
      width={W}
      height={H}
    />
  );
};
