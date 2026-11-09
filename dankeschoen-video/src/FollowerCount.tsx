import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const COUNT_FPS = 30;
export const COUNT_TOTAL = 240; // 8 Sekunden

const BG = "#0b0b0d";
const FG = "#ffffff";
const ACCENT = "#f5c451";
const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";
const TARGET = 150;

export const FollowerCount: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const count = Math.round(
    interpolate(frame, [10, 85], [0, TARGET], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (t) => 1 - Math.pow(1 - t, 3),
    }),
  );
  const done = frame >= 85;

  // Kleiner Pop beim Erreichen der 150
  const pop = spring({
    frame: frame - 85,
    fps,
    config: { damping: 8, stiffness: 160 },
  });
  const scale = done ? 1 + 0.12 * (1 - pop) + 0.0 : 1;

  const labelP = spring({
    frame: frame - 20,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });
  const lift = spring({
    frame: frame - 105,
    fps,
    config: { damping: 200 },
    durationInFrames: 25,
  });
  const textP = (delay: number) =>
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 200 },
      durationInFrames: 20,
    });
  const t1 = textP(125);
  const t2 = textP(155);
  const fadeOut = interpolate(frame, [COUNT_TOTAL - 10, COUNT_TOTAL], [1, 0], {
    extrapolateLeft: "clamp",
  });
  const glow = interpolate(frame, [85, 100], [0.12, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        backgroundImage: `radial-gradient(circle at 50% 44%, rgba(245,196,81,${glow}), transparent 55%)`,
        fontFamily: FONT,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        paddingBottom: 120,
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `translateY(${interpolate(lift, [0, 1], [0, -170])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 460,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -14,
            color: done ? ACCENT : FG,
            transform: `scale(${scale})`,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {count}
        </div>
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: FG,
            letterSpacing: -2,
            opacity: labelP,
            transform: `translateY(${interpolate(labelP, [0, 1], [40, 0])}px)`,
          }}
        >
          Follower
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1130,
          width: "100%",
          padding: "0 90px",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontSize: 58,
            fontWeight: 700,
            whiteSpace: "nowrap",
            color: FG,
            lineHeight: 1.2,
            opacity: t1,
            transform: `translateY(${interpolate(t1, [0, 1], [40, 0])}px)`,
          }}
        >
          Danke für die 150 Follower.
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 68,
            fontWeight: 800,
            color: ACCENT,
            lineHeight: 1.2,
            opacity: t2,
            transform: `translateY(${interpolate(t2, [0, 1], [40, 0])}px)`,
          }}
        >
          Danke euch
          <br />
          von ganzem Herzen.&nbsp;❤️
        </div>
      </div>
    </AbsoluteFill>
  );
};
