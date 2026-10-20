import { Composition } from "remotion";
import "./theme";
import { T1Fan } from "./tests/T1Fan";
import { T2Seal } from "./tests/T2Seal";
import { T3Inflate } from "./tests/T3Inflate";
import { T4Flow } from "./tests/T4Flow";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="LD4-Flow" component={T4Flow} durationInFrames={300} fps={30} width={1920} height={1080} />
    <Composition id="LD3-Inflate" component={T3Inflate} durationInFrames={270} fps={30} width={1920} height={1080} />
    <Composition id="LD2-Seal" component={T2Seal} durationInFrames={270} fps={30} width={1920} height={1080} />
    <Composition id="LD1-Fan" component={T1Fan} durationInFrames={210} fps={30} width={1920} height={1080} />
  </>
);
