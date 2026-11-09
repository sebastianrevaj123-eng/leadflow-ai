import React from "react";
import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const W = 1080;
const H = 1920;

type Blob = {
  color: string;
  size: number;
  cx: number;
  cy: number;
  ax: number;
  ay: number;
  speed: number;
  phase: number;
  alpha: number;
};

// Nebel-Glühen: Gold (Marke), tiefes Violett, warmes Orange, kühles Blau
const BLOBS: Blob[] = [
  {
    color: "245,196,81",
    size: 1100,
    cx: 540,
    cy: 820,
    ax: 120,
    ay: 90,
    speed: 1,
    phase: 0,
    alpha: 0.2,
  },
  {
    color: "110,60,200",
    size: 1300,
    cx: 150,
    cy: 300,
    ax: 160,
    ay: 220,
    speed: 0.7,
    phase: 2,
    alpha: 0.28,
  },
  {
    color: "255,120,60",
    size: 1000,
    cx: 930,
    cy: 1500,
    ax: 140,
    ay: 160,
    speed: 0.85,
    phase: 4,
    alpha: 0.16,
  },
  {
    color: "40,90,220",
    size: 1200,
    cx: 900,
    cy: 200,
    ax: 120,
    ay: 140,
    speed: 0.6,
    phase: 1,
    alpha: 0.2,
  },
  {
    color: "150,60,180",
    size: 1100,
    cx: 200,
    cy: 1600,
    ax: 150,
    ay: 120,
    speed: 0.75,
    phase: 5,
    alpha: 0.18,
  },
];

const STARS = Array.from({ length: 140 }, (_, i) => ({
  x: random(`sx${i}`) * W,
  y: random(`sy${i}`) * H,
  r: 0.8 + random(`sr${i}`) * 2.2,
  depth: 0.3 + random(`sd${i}`) * 0.7, // Parallax: nähere Sterne bewegen sich schneller
  tw: random(`st${i}`) * Math.PI * 2,
  twSpeed: 0.05 + random(`ss${i}`) * 0.1,
  gold: random(`sg${i}`) > 0.7,
}));

export const Background: React.FC<{ intensity?: number }> = ({
  intensity = 1.9,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // Alles läuft über ganze Perioden pro Videolänge -> nahtlos loopbar
  const loop = (frame / durationInFrames) * Math.PI * 2;

  return (
    <AbsoluteFill style={{ backgroundColor: "#06060a" }}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #05050a 0%, #0b0817 55%, #07060d 100%)",
        }}
      />
      {BLOBS.map((b, i) => {
        const x =
          b.cx + b.ax * Math.sin(loop * Math.round(b.speed * 2) + b.phase);
        const y =
          b.cy +
          b.ay * Math.cos(loop * Math.round(b.speed * 2) + b.phase * 1.3);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - b.size / 2,
              top: y - b.size / 2,
              width: b.size,
              height: b.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${b.color},${b.alpha * intensity}) 0%, rgba(${b.color},0) 65%)`,
            }}
          />
        );
      })}
      {/* Langsam rotierende Lichtstrahlen aus der Mitte */}
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${(loop * 180) / Math.PI / 4}deg at 50% 44%, rgba(245,196,81,0.10) 0deg 6deg, rgba(245,196,81,0) 6deg 30deg)`,
          WebkitMaskImage:
            "radial-gradient(circle at 50% 44%, #000 0%, transparent 70%)",
          maskImage:
            "radial-gradient(circle at 50% 44%, #000 0%, transparent 70%)",
        }}
      />
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        {STARS.map((s, i) => {
          // Sterne steigen langsam auf und laufen nahtlos oben wieder ein
          const rise = (frame / durationInFrames) * H * 0.35 * s.depth;
          const y = (((s.y - rise) % H) + H) % H;
          const twinkle = 0.55 + 0.45 * Math.sin(loop * 6 + s.tw * 3);
          return (
            <circle
              key={i}
              cx={s.x}
              cy={y}
              r={s.r}
              fill={s.gold ? "#f5c451" : "#ffffff"}
              opacity={(0.25 + 0.6 * s.depth) * twinkle}
            />
          );
        })}
      </svg>
      {/* Vignette: zieht den Blick zur Bildmitte */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
