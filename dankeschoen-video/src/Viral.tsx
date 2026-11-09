import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const VIRAL_FPS = 30;
export const VIRAL_TOTAL = 270; // 9 Sekunden, 120 BPM -> 1 Beat = 15 Frames

const INK = "#0a0a0a";
const LIME = "#c8ff2e";
const PINK = "#ff3d9a";
const WHITE = "#ffffff";
const MUTED = "#a9a9b3";
const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";

const IMPACT = 105; // Frame, in dem die 150 einrastet
const SPIN_START = 45;
const DANKE_IN = 135;
const CTA_IN = 195;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/* ------------------------------------------------------------------ */
/* Hintergrund: Neon-Mesh, Perspektiv-Grid, Halftone, Beat-Puls        */
/* ------------------------------------------------------------------ */
const ViralBG: React.FC = () => {
  const frame = useCurrentFrame();
  const beat = frame % 15;
  const pulse = Math.exp(-beat / 4);
  const drift = frame / VIRAL_TOTAL;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(circle at ${20 + 12 * Math.sin(drift * 6.28)}% ${14 + 6 * Math.cos(drift * 6.28)}%, rgba(255,61,154,0.42), transparent 48%),
            radial-gradient(circle at ${82 + 8 * Math.cos(drift * 6.28)}% ${86 + 5 * Math.sin(drift * 6.28)}%, rgba(200,255,46,0.30), transparent 50%),
            radial-gradient(circle at 50% 46%, rgba(120,70,255,0.22), transparent 60%)`,
        }}
      />
      {/* Perspektiv-Grid am Boden */}
      <div
        style={{
          position: "absolute",
          left: "-60%",
          width: "220%",
          top: 1020,
          height: 1500,
          transform: "perspective(650px) rotateX(64deg)",
          transformOrigin: "50% 0",
          backgroundImage: `linear-gradient(rgba(200,255,46,0.45) 3px, transparent 3px), linear-gradient(90deg, rgba(200,255,46,0.45) 3px, transparent 3px)`,
          backgroundSize: "110px 110px",
          backgroundPosition: `0 ${(frame * 9) % 110}px`,
          WebkitMaskImage: "linear-gradient(transparent 0%, #000 35%)",
          maskImage: "linear-gradient(transparent 0%, #000 35%)",
          opacity: 0.55,
        }}
      />
      {/* Halftone-Punkte */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.09) 1.6px, transparent 1.8px)",
          backgroundSize: "26px 26px",
        }}
      />
      {/* Beat-Puls */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 45%, rgba(255,255,255,${0.1 * pulse}), transparent 55%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Glitch-Slam-Text für den Hook                                       */
/* ------------------------------------------------------------------ */
const SlamText: React.FC<{
  children: React.ReactNode;
  start: number;
  top: number;
  size: number;
  color?: string;
  rot?: number;
}> = ({ children, start, top, size, color = WHITE, rot = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - start;
  if (t < 0) return null;
  const s = spring({
    frame: t,
    fps,
    config: { damping: 11, stiffness: 240, mass: 0.6 },
  });
  const scale = interpolate(s, [0, 1], [1.9, 1]);
  const g = Math.max(0, 1 - t / 9) * 22;
  const base: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    top,
    textAlign: "center",
    fontSize: size,
    fontWeight: 900,
    letterSpacing: -4,
    lineHeight: 1,
    whiteSpace: "nowrap",
    opacity: clamp(t / 2),
  };
  const tf = (dx: number) =>
    `translateX(${dx}px) scale(${scale}) rotate(${rot}deg)`;
  return (
    <>
      <div
        style={{
          ...base,
          color: "#ff0040",
          transform: tf(-g),
          mixBlendMode: "screen",
        }}
      >
        {children}
      </div>
      <div
        style={{
          ...base,
          color: "#00e5ff",
          transform: tf(g),
          mixBlendMode: "screen",
        }}
      >
        {children}
      </div>
      <div style={{ ...base, color, transform: tf(0) }}>{children}</div>
    </>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  // "Whip-Cut": zoomt kurz vor dem Schnitt weg
  const whip = clamp((frame - 38) / 7);
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${1 + whip * 1.8})`,
        opacity: 1 - whip,
        filter: `blur(${whip * 18}px)`,
      }}
    >
      <SlamText start={0} top={740} size={116}>
        Ich hab's selbst
      </SlamText>
      <SlamText start={15} top={890} size={130} color={LIME} rot={-2}>
        kaum geglaubt…
      </SlamText>
      {frame >= 30 && (
        <div
          style={{
            position: "absolute",
            top: 1070,
            width: "100%",
            textAlign: "center",
            fontSize: 70,
            opacity: clamp((frame - 30) / 4),
          }}
        >
          😳
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Slot-Machine-Zähler                                                  */
/* ------------------------------------------------------------------ */
const CELL = 440;
const COL_W = 300;

const Column: React.FC<{
  target: number;
  loops: number;
  stop: number;
}> = ({ target, loops, stop }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = loops * 10 + target;
  const pos = (f: number) =>
    total * easeOutCubic(clamp((f - SPIN_START) / (stop - SPIN_START)));
  const cur = pos(frame);
  const speed = cur - pos(frame - 1);
  const blur = Math.min(22, speed * CELL * 0.05);
  const landed = frame >= stop;
  const pop = spring({
    frame: frame - stop,
    fps,
    config: { damping: 7, stiffness: 220 },
  });
  const punch = landed ? 1 + 0.1 * (1 - pop) : 1;
  const first = Math.max(0, Math.floor(cur) - 1);
  const last = Math.min(total, Math.ceil(cur) + 2);
  const cells = [];
  for (let i = first; i <= last; i++) {
    cells.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: 0,
          width: COL_W,
          height: CELL,
          top: (i - cur) * CELL,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 500,
          fontWeight: 900,
          letterSpacing: -12,
          color: frame >= IMPACT ? LIME : WHITE,
        }}
      >
        {i % 10}
      </div>,
    );
  }
  return (
    <div
      style={{
        position: "relative",
        width: COL_W,
        height: CELL,
        overflow: "hidden",
        transform: `scale(${punch})`,
        filter: `blur(${blur}px)`,
      }}
    >
      {cells}
    </div>
  );
};

const Sticker: React.FC<{
  children: React.ReactNode;
  bg: string;
  color?: string;
  rot: number;
  size: number;
  start: number;
}> = ({ children, bg, color = INK, rot, size, start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - start,
    fps,
    config: { damping: 9, stiffness: 200 },
  });
  return (
    <div
      style={{
        display: "inline-block",
        background: bg,
        color,
        fontSize: size,
        fontWeight: 900,
        letterSpacing: -2,
        padding: "10px 44px 14px",
        borderRadius: 22,
        transform: `rotate(${rot}deg) scale(${s})`,
        boxShadow: `10px 10px 0 ${INK}, 10px 10px 0 4px rgba(255,255,255,0.9)`,
      }}
    >
      {children}
    </div>
  );
};

const Counter: React.FC = () => {
  const frame = useCurrentFrame();
  // Layout-Phasen: Mitte -> oben (Danke) -> noch kleiner (CTA)
  const toB = easeOutCubic(clamp((frame - DANKE_IN) / 14));
  const toC = easeOutCubic(clamp((frame - CTA_IN) / 14));
  const top = interpolate(toB, [0, 1], [560, 330]) + toC * -80;
  const scale = interpolate(toB, [0, 1], [1, 0.62]) - toC * 0.12;
  const appear = clamp((frame - SPIN_START + 4) / 6);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        transform: `scale(${scale})`,
        transformOrigin: "50% 0",
        opacity: appear,
      }}
    >
      <div style={{ display: "flex", width: COL_W * 3 }}>
        <Column target={1} loops={1} stop={78} />
        <Column target={5} loops={3} stop={92} />
        <Column target={0} loops={4} stop={IMPACT} />
      </div>
      <Sticker
        bg={frame >= IMPACT ? LIME : WHITE}
        rot={-4}
        size={120}
        start={SPIN_START + 8}
      >
        FOLLOWER
      </Sticker>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Impact-Effekte: Shockwave, Konfetti, Ticker-Bänder                  */
/* ------------------------------------------------------------------ */
const Shockwave: React.FC = () => {
  const t = useCurrentFrame() - IMPACT;
  if (t < 0 || t > 30) return null;
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      {[0, 5].map((d) => {
        const k = t - d;
        if (k < 0) return null;
        return (
          <circle
            key={d}
            cx={540}
            cy={780}
            r={60 + k * 46}
            fill="none"
            stroke={d ? PINK : LIME}
            strokeWidth={Math.max(0, 22 * (1 - k / 26))}
            opacity={Math.max(0, 1 - k / 26)}
          />
        );
      })}
    </svg>
  );
};

const CONFETTI = Array.from({ length: 150 }, (_, i) => ({
  a: random(`ca${i}`) * Math.PI * 2,
  v: 9 + random(`cv${i}`) * 30,
  w: 14 + random(`cw${i}`) * 18,
  h: 8 + random(`ch${i}`) * 12,
  rs: (random(`cr${i}`) - 0.5) * 40,
  r0: random(`c0${i}`) * 360,
  c: [LIME, PINK, WHITE, "#ffd23d", "#7c5cff"][
    Math.floor(random(`cc${i}`) * 5)
  ],
}));

const Confetti: React.FC = () => {
  const t = useCurrentFrame() - IMPACT;
  if (t < 0 || t > 130) return null;
  return (
    <AbsoluteFill>
      {CONFETTI.map((p, i) => {
        let x = 540;
        let y = 780;
        let vx = Math.cos(p.a) * p.v;
        let vy = Math.sin(p.a) * p.v - 8;
        for (let k = 0; k < t; k++) {
          x += vx;
          y += vy;
          vx *= 0.955;
          vy = vy * 0.955 + 0.95;
        }
        const op = clamp((130 - t) / 30);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.w,
              height: p.h,
              background: p.c,
              opacity: op,
              transform: `rotate(${p.r0 + p.rs * t}deg) rotateX(${t * 18}deg)`,
              borderRadius: 2,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Ticker: React.FC<{
  top: number;
  rot: number;
  bg: string;
  dir: 1 | -1;
  delay: number;
  text: string;
}> = ({ top, rot, bg, dir, delay, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - (IMPACT + delay);
  if (t < 0) return null;
  const s = spring({ frame: t, fps, config: { damping: 16, stiffness: 140 } });
  const UNIT = 820;
  const off = (frame * 10 * dir) % UNIT;
  return (
    <div
      style={{
        position: "absolute",
        left: -200,
        width: 1480,
        top,
        height: 118,
        background: bg,
        transform: `rotate(${rot}deg) scaleX(${s})`,
        transformOrigin: dir === 1 ? "0% 50%" : "100% 50%",
        overflow: "hidden",
        boxShadow: `0 10px 0 ${INK}`,
      }}
    >
      <div
        style={{
          display: "flex",
          height: "100%",
          alignItems: "center",
          transform: `translateX(${off - UNIT}px)`,
          width: UNIT * 8,
        }}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            style={{
              width: UNIT,
              flexShrink: 0,
              textAlign: "center",
              fontSize: 62,
              fontWeight: 900,
              letterSpacing: -1,
              color: INK,
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Danke- und CTA-Szene                                                 */
/* ------------------------------------------------------------------ */
const useIn = (start: number, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - start,
    fps,
    config: { damping, stiffness: 200, mass: 0.7 },
  });
};

const Danke: React.FC = () => {
  const frame = useCurrentFrame();
  const a = useIn(DANKE_IN);
  const b = useIn(DANKE_IN + 10);
  const c = useIn(DANKE_IN + 20);
  const out = easeOutCubic(clamp((frame - (CTA_IN - 8)) / 8));
  return (
    <AbsoluteFill
      style={{
        opacity: 1 - out,
        transform: `translateY(${-out * 120}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 780,
          width: "100%",
          textAlign: "center",
          fontSize: 235,
          fontWeight: 900,
          letterSpacing: -10,
          lineHeight: 1,
          color: WHITE,
          textShadow: `10px 10px 0 ${PINK}`,
          transform: `scale(${interpolate(a, [0, 1], [2.2, 1])}) rotate(${interpolate(a, [0, 1], [-8, -3])}deg)`,
          opacity: clamp(a * 2),
        }}
      >
        DANKE.
      </div>
      <div
        style={{
          position: "absolute",
          top: 1050,
          width: "100%",
          textAlign: "center",
          fontSize: 72,
          fontWeight: 800,
          color: WHITE,
          opacity: b,
          transform: `translateY(${(1 - b) * 50}px)`,
        }}
      >
        für die 150 Follower.
      </div>
      <div
        style={{
          position: "absolute",
          top: 1150,
          width: "100%",
          textAlign: "center",
          fontSize: 66,
          fontWeight: 800,
          color: LIME,
          opacity: c,
          transform: `translateY(${(1 - c) * 50}px)`,
        }}
      >
        Euch von ganzem Herzen. ❤️
      </div>
    </AbsoluteFill>
  );
};

const Chip: React.FC<{
  bg: string;
  rot: number;
  start: number;
  top: number;
  children: React.ReactNode;
}> = ({ bg, rot, start, top, children }) => {
  const s = useIn(start, 9);
  return (
    <div
      style={{
        position: "absolute",
        top,
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: bg,
          color: INK,
          fontSize: 66,
          fontWeight: 900,
          padding: "26px 60px 30px",
          borderRadius: 999,
          transform: `rotate(${rot}deg) scale(${s})`,
          boxShadow: `9px 9px 0 rgba(255,255,255,0.92)`,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Cta: React.FC = () => {
  const a = useIn(CTA_IN);
  const h = useIn(CTA_IN + 40);
  const k = useIn(CTA_IN + 34);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 760,
          width: "100%",
          textAlign: "center",
          fontSize: 112,
          fontWeight: 900,
          letterSpacing: -3,
          lineHeight: 1,
          color: WHITE,
          opacity: clamp(a * 2),
          transform: `scale(${interpolate(a, [0, 1], [1.6, 1])})`,
        }}
      >
        Wer bist du?
      </div>
      <Chip bg={LIME} rot={-3} start={CTA_IN + 10} top={940}>
        🆕 Neu hier
      </Chip>
      <Chip bg={PINK} rot={2.5} start={CTA_IN + 20} top={1110}>
        🔥 Von Anfang an dabei
      </Chip>
      <div
        style={{
          position: "absolute",
          top: 1290,
          width: "100%",
          textAlign: "center",
          fontSize: 50,
          fontWeight: 700,
          color: MUTED,
          opacity: clamp(k * 1.5),
        }}
      >
        Schreib's in die Kommentare 👇
      </div>
      <div
        style={{
          position: "absolute",
          top: 1630,
          width: "100%",
          textAlign: "center",
          fontSize: 46,
          fontWeight: 800,
          color: WHITE,
          letterSpacing: 1,
          opacity: h,
        }}
      >
        <span style={{ color: LIME }}>●</span> @sebis.freedom.path
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Kamera: Shake auf Wort-Hits, Slot-Stopps und Impact                  */
/* ------------------------------------------------------------------ */
const shakeAmp = (frame: number) => {
  const hits: [number, number][] = [
    [0, 10],
    [15, 12],
    [78, 8],
    [92, 9],
    [IMPACT, 34],
    [DANKE_IN, 16],
    [CTA_IN, 10],
  ];
  let amp = 0;
  for (const [f, a] of hits) {
    const t = frame - f;
    if (t >= 0) amp += a * Math.exp(-t / 4.5);
  }
  return amp;
};

export const Viral: React.FC = () => {
  const frame = useCurrentFrame();
  const amp = shakeAmp(frame);
  const sx = (random(`shx${frame}`) - 0.5) * 2 * amp;
  const sy = (random(`shy${frame}`) - 0.5) * 2 * amp;
  const sr = (random(`shr${frame}`) - 0.5) * amp * 0.06;
  const flash =
    frame >= IMPACT ? Math.max(0, 1 - (frame - IMPACT) / 6) * 0.9 : 0;
  const endFade = clamp((frame - (VIRAL_TOTAL - 8)) / 8);

  return (
    <AbsoluteFill style={{ background: INK, fontFamily: FONT }}>
      <Audio src={staticFile("beat.wav")} />
      <AbsoluteFill
        style={{ transform: `translate(${sx}px, ${sy}px) rotate(${sr}deg)` }}
      >
        <ViralBG />
        <Sequence durationInFrames={SPIN_START}>
          <Hook />
        </Sequence>
        <Counter />
        <Shockwave />
        <Ticker
          top={170}
          rot={-6}
          bg={LIME}
          dir={1}
          delay={2}
          text="150 FOLLOWER ✦ DANKE ✦"
        />
        <Ticker
          top={1490}
          rot={5}
          bg={PINK}
          dir={-1}
          delay={6}
          text="DANKE ✦ 150 FOLLOWER ✦"
        />
        {frame >= DANKE_IN && <Danke />}
        {frame >= CTA_IN && <Cta />}
        <Confetti />
      </AbsoluteFill>
      {/* Fortschrittsbalken (Retention-Look) */}
      <div
        style={{
          position: "absolute",
          top: 64,
          left: 40,
          right: 40,
          height: 8,
          borderRadius: 4,
          background: "rgba(255,255,255,0.18)",
        }}
      >
        <div
          style={{
            width: `${(frame / VIRAL_TOTAL) * 100}%`,
            height: "100%",
            borderRadius: 4,
            background: LIME,
          }}
        />
      </div>
      <AbsoluteFill style={{ background: WHITE, opacity: flash }} />
      <AbsoluteFill style={{ background: INK, opacity: endFade }} />
    </AbsoluteFill>
  );
};
