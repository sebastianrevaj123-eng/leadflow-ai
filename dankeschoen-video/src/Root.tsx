import { Composition } from "remotion";
import { Background } from "./Background";
import { COUNT_FPS, COUNT_TOTAL, FollowerCount } from "./FollowerCount";
import { FPS, HEIGHT, ThankYou, TOTAL, WIDTH } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Dankeschoen"
        component={ThankYou}
        durationInFrames={TOTAL}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="FollowerCount"
        component={FollowerCount}
        durationInFrames={COUNT_TOTAL}
        fps={COUNT_FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Background"
        component={Background}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
