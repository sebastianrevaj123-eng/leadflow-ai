import { Composition } from "remotion";
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
    </>
  );
};
