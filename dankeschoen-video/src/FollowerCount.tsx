import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
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

// Orbit-Partikel: jeder Punkt = ein Follower
const CX = 540;
const CY = 830; // Mittelpunkt der Zahl
const FLIGHT = 42; // Frames, die ein Punkt zum Zentrum braucht
const FIRST_ARRIVAL = 40;
const LAST_ARRIVAL = 85;

type Particle = {
  arrival: number;
  r0: number;
  a0: number;
  sweep: number;
  size: number;
  gold: boolean;
};

const PARTICLES: Particle[] = Array.from({ length: TARGET }, (_, i) => ({
  arrival: Math.round(
    FIRST_ARRIVAL + (i / (TARGET - 1)) * (LAST_ARRIVAL - FIRST_ARRIVAL),
  ),
  r0: 520 + random(`r${i}`) * 520,
  a0: random(`a${i}`) * Math.PI * 2,
  sweep: Math.PI * (1.4 + random(`s${i}`) * 0.8),
  size: 9 + random(`z${i}`) * 9,
  gold: random(`g${i}`) > 0.45,
}));

const position = (p: Particle, progress: number) => {
  // Spirale nach innen: Radius schrumpft, Winkel dreht sich weiter
  const r = p.r0 * Math.pow(1 - progress, 1.7);
  const a = p.a0 + p.sweep * progress;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
};

const Orbit: React.FC = () => {
  const frame = useCurrentFrame();
  const ringOpacity = interpolate(frame, [0, 15, 80, 100], [0, 0.1, 0.1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      {[260, 440, 640].map((r) => (
        <circle
          key={r}
          cx={CX}
          cy={CY}
          r={r}
          fill="none"
          stroke={FG}
          strokeWidth={2}
          opacity={ringOpacity}
        />
      ))}
      {PARTICLES.map((p, i) => {
        const start = p.arrival - FLIGHT;
        const t = (frame - start) / FLIGHT;
        if (t <= 0 || t >= 1) return null;
        const fade = Math.min(1, t * 8) * Math.min(1, (1 - t) * 10);
        const color = p.gold ? ACCENT : FG;
        const head = position(p, t);
        return (
          <g key={i}>
            {[1, 2, 3, 4, 5].map((k) => {
              const tt = t - k * 0.018;
              if (tt <= 0) return null;
              const q = position(p, tt);
              return (
                <circle
                  key={k}
                  cx={q.x}
                  cy={q.y}
                  r={p.size * (1 - k * 0.14) * 0.5}
                  fill={color}
                  opacity={fade * (0.45 - k * 0.07)}
                />
              );
            })}
            <circle
              cx={head.x}
              cy={head.y}
              r={p.size * 0.5}
              fill={color}
              opacity={fade}
            />
          </g>
        );
      })}
    </svg>
  );
};

export const FollowerCount: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Zähler = Anzahl der Punkte, die das Zentrum erreicht haben
  const count = PARTICLES.filter((p) => p.arrival <= frame).length;
  const done = frame >= LAST_ARRIVAL;

  // Kleiner Pop beim Erreichen der 150
  const pop = spring({
    frame: frame - LAST_ARRIVAL,
    fps,
    config: { damping: 8, stiffness: 160 },
  });
  const scale = done ? 1 + 0.12 * (1 - pop) : 1;

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
  // Glow wächst mit jedem Follower
  const glow = 0.06 + 0.24 * (count / TARGET);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        backgroundImage: `radial-gradient(circle at 50% ${(CY / 1920) * 100}%, rgba(245,196,81,${glow}), transparent 55%)`,
        fontFamily: FONT,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        paddingBottom: 120,
        opacity: fadeOut,
      }}
    >
      <Orbit />
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
