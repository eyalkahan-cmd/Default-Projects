import { Composition } from "remotion";
import { LookId, setLook } from "./theme";
import { T1Fan } from "./tests/T1Fan";
import { T2Seal } from "./tests/T2Seal";
import { T3Inflate } from "./tests/T3Inflate";
import { T4Flow } from "./tests/T4Flow";
import { Opening } from "./film/Opening";
import { Power } from "./film/Power";
import { AirLeak } from "./film/AirLeak";
import { Film, FILM_FRAMES } from "./film/Film";
import { F2, FilmV2Audio, FilmV2Full, FilmV2Test, V2 } from "./film/v2/FilmV2";
import { WearIn, WearPack } from "./film/Wear";
import { EndCard, KeepRunning, Lineup } from "./film/Finale";

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
const SC = { fps: 30, width: 1920, height: 1080, defaultProps: { look: "daylight" as LookId } };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="FilmV2" component={withLook(FilmV2Full)} durationInFrames={F2.total} {...SC} />
    <Composition id="FilmV2Audio" component={FilmV2Audio} durationInFrames={F2.total} fps={30} width={1920} height={1080} />
    <Composition id="FilmV2Test" component={withLook(FilmV2Test)} durationInFrames={V2.end} {...SC} />
    <Composition id="Film" component={withLook(Film)} durationInFrames={FILM_FRAMES} {...SC} />
    <Composition id="LD4-Flow" component={withLook(T4Flow)} durationInFrames={300} {...LD} />
    <Composition id="LD3-Inflate" component={withLook(T3Inflate)} durationInFrames={270} {...LD} />
    <Composition id="LD2-Seal" component={withLook(T2Seal)} durationInFrames={270} {...LD} />
    <Composition id="SC-Opening" component={withLook(Opening)} durationInFrames={192} {...SC} />
    <Composition id="SC-Power" component={withLook(Power)} durationInFrames={408} {...SC} />
    <Composition id="SC-WearIn" component={withLook(WearIn)} durationInFrames={120} {...SC} />
    <Composition id="SC-WearPack" component={withLook(WearPack)} durationInFrames={226} {...SC} />
    <Composition id="SC-AirLeak" component={withLook(AirLeak)} durationInFrames={246} {...SC} />
    <Composition id="SC-Lineup" component={withLook(Lineup)} durationInFrames={80} {...SC} />
    <Composition id="SC-KeepRunning" component={withLook(KeepRunning)} durationInFrames={140} {...SC} />
    <Composition id="SC-EndCard" component={withLook(EndCard)} durationInFrames={100} {...SC} />
    <Composition id="LD1-Fan" component={withLook(T1Fan)} durationInFrames={210} {...LD} />
  </>
);
