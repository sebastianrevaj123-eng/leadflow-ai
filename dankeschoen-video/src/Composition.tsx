import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

const BG = "#0b0b0d";
const FG = "#ffffff";
const MUTED = "#9a9aa3";
const ACCENT = "#f5c451";
const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";

// Szenenlängen in Frames (30 fps)
const S1 = 105; // Hook + Zähler
const S2 = 120; // Kein Gewinnspiel
const S3 = 120; // Nur ein Vater
const S4 = 105; // Danke
const S5 = 90; // Frage
export const TOTAL = S1 + S2 + S3 + S4 + S5;

/** Weiches Einblenden von unten für Textzeilen */
const useRise = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  return {
    opacity: p,
    transform: `translateY(${interpolate(p, [0, 1], [50, 0])}px)`,
  };
};

const Line: React.FC<{
  children: React.ReactNode;
  delay: number;
  size?: number;
  color?: string;
  weight?: number;
}> = ({ children, delay, size = 96, color = FG, weight = 800 }) => {
  const style = useRise(delay);
  return (
    <div
      style={{
        ...style,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight: 1.12,
        letterSpacing: -1.5,
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
};

const Avatar: React.FC<{ size: number; delay?: number }> = ({
  size,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 12 } });
  const pulse = 1 + 0.015 * Math.sin(frame / 8);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        padding: 10,
        background: `linear-gradient(135deg, ${ACCENT}, #ffffff)`,
        transform: `scale(${p * pulse})`,
        boxShadow: `0 0 ${80 * p}px rgba(245,196,81,0.35)`,
      }}
    >
      <Img
        src={staticFile("avatar.png")}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
};

const Center: React.FC<{ children: React.ReactNode; gap?: number }> = ({
  children,
  gap = 36,
}) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      gap,
      padding: "0 80px",
      paddingBottom: 120,
    }}
  >
    {children}
  </AbsoluteFill>
);

/* ---------- Szenen ---------- */

const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const count = Math.round(
    interpolate(frame, [10, 70], [0, 150], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (t) => 1 - Math.pow(1 - t, 3),
    }),
  );
  const done = frame >= 70;
  const pop = done
    ? interpolate(frame, [70, 80, 92], [1, 1.12, 1], {
        extrapolateRight: "clamp",
      })
    : 1;
  return (
    <Center gap={30}>
      <Avatar size={340} />
      <div
        style={{
          fontSize: 300,
          fontWeight: 900,
          color: done ? ACCENT : FG,
          lineHeight: 1,
          letterSpacing: -8,
          transform: `scale(${pop})`,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {count}
      </div>
      <Line delay={6} size={92}>
        Follower. 😂
      </Line>
    </Center>
  );
};

const Scene2: React.FC = () => (
  <Center gap={44}>
    <Line delay={0} size={100}>
      Kein Gewinnspiel.
    </Line>
    <Line delay={20} size={100}>
      Kein Trick.
    </Line>
    <Line delay={40} size={100} color={ACCENT}>
      Kein Lamborghini.
    </Line>
    <Line delay={64} size={56} color={MUTED} weight={600}>
      Ihr seid einfach geblieben.
    </Line>
  </Center>
);

const Scene3: React.FC = () => (
  <Center gap={44}>
    <Line delay={0} size={72}>
      Nur ein angestellter Vater,
    </Line>
    <Line delay={22} size={72}>
      der neben Job und Familie
    </Line>
    <Line delay={44} size={72} color={ACCENT}>
      was Eigenes aufbaut.
    </Line>
    <Line delay={70} size={56} color={MUTED} weight={600}>
      Schritt für Schritt.
    </Line>
  </Center>
);

const Scene4: React.FC = () => (
  <Center gap={50}>
    <Avatar size={300} />
    <Line delay={8} size={150} weight={900}>
      Danke.
    </Line>
    <Line delay={26} size={64} color={MUTED} weight={600}>
      Dass du dabei bist.
    </Line>
    <Line delay={44} size={64} color={FG} weight={700}>
      Das bedeutet mir echt was. 🙏
    </Line>
  </Center>
);

const Pill: React.FC<{ label: string; delay: number }> = ({ label, delay }) => {
  const style = useRise(delay);
  return (
    <div
      style={{
        ...style,
        fontSize: 64,
        fontWeight: 800,
        padding: "34px 70px",
        borderRadius: 999,
        border: `4px solid ${ACCENT}`,
        color: FG,
      }}
    >
      {label}
    </div>
  );
};

const Scene5: React.FC = () => (
  <Center gap={50}>
    <Line delay={0} size={78}>
      Morgens oder abends –
    </Line>
    <Line delay={10} size={78}>
      wann arbeitest du
    </Line>
    <Line delay={20} size={78} color={ACCENT}>
      an deinem Ding?
    </Line>
    <div style={{ height: 20 }} />
    <Pill label="☀️ Morgens" delay={36} />
    <Pill label="🌙 Abends" delay={46} />
    <Line delay={60} size={46} color={MUTED} weight={600}>
      Schreib's in die Kommentare
    </Line>
  </Center>
);

/** Weicher Ein-/Ausblend-Übergang pro Szene */
const Fade: React.FC<{ duration: number; children: React.ReactNode }> = ({
  duration,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 6, duration - 8, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const ThankYou: React.FC = () => {
  const frame = useCurrentFrame();
  // Dezent wandernder Glow im Hintergrund
  const gx = 50 + 10 * Math.sin(frame / 60);
  const gy = 38 + 6 * Math.cos(frame / 75);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        backgroundImage: `radial-gradient(circle at ${gx}% ${gy}%, rgba(245,196,81,0.16), transparent 55%)`,
        fontFamily: FONT,
      }}
    >
      <Sequence durationInFrames={S1}>
        <Fade duration={S1}>
          <Scene1 />
        </Fade>
      </Sequence>
      <Sequence from={S1} durationInFrames={S2}>
        <Fade duration={S2}>
          <Scene2 />
        </Fade>
      </Sequence>
      <Sequence from={S1 + S2} durationInFrames={S3}>
        <Fade duration={S3}>
          <Scene3 />
        </Fade>
      </Sequence>
      <Sequence from={S1 + S2 + S3} durationInFrames={S4}>
        <Fade duration={S4}>
          <Scene4 />
        </Fade>
      </Sequence>
      <Sequence from={S1 + S2 + S3 + S4} durationInFrames={S5}>
        <Fade duration={S5}>
          <Scene5 />
        </Fade>
      </Sequence>
      <div
        style={{
          position: "absolute",
          top: 150,
          width: "100%",
          textAlign: "center",
          fontSize: 38,
          fontWeight: 600,
          color: MUTED,
          letterSpacing: 1,
        }}
      >
        @sebis.freedom.path
      </div>
    </AbsoluteFill>
  );
};
