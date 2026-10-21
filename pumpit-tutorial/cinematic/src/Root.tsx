import { Composition } from "remotion";
import { LookId, setLook } from "./theme";
import { T1Fan } from "./tests/T1Fan";
import { T2Seal } from "./tests/T2Seal";
import { T3Inflate } from "./tests/T3Inflate";
import { T4Flow } from "./tests/T4Flow";

type P = { look: LookId };
/** Sets the art-direction look for this render, then renders the test. */
const withLook = (C: React.FC) => {
  const Wrapped: React.FC<P> = ({ look }) => {
    setLook(look);
    return <C />;
  };
  return Wrapped;
};
const LD = { fps: 30, width: 1920, height: 1080, defaultProps: { look: "night" as LookId } };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="LD4-Flow" component={withLook(T4Flow)} durationInFrames={300} {...LD} />
    <Composition id="LD3-Inflate" component={withLook(T3Inflate)} durationInFrames={270} {...LD} />
    <Composition id="LD2-Seal" component={withLook(T2Seal)} durationInFrames={270} {...LD} />
    <Composition id="LD1-Fan" component={withLook(T1Fan)} durationInFrames={210} {...LD} />
  </>
);
