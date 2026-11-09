import { Composition } from "remotion";
import { FPS, HEIGHT, ThankYou, TOTAL, WIDTH } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Dankeschoen"
      component={ThankYou}
      durationInFrames={TOTAL}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
