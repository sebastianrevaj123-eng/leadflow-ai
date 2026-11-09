"""Synthetisiert einen kurzen, eigenen Beat (keine fremden Samples -> lizenzfrei).
Timing: 30 fps, 120 BPM -> ein Beat = 15 Frames = 0.5 s. Impact bei Frame 105 = 3.5 s.
"""
import sys
import wave

import numpy as np

SR = 44100
DUR = 9.0
BEAT = 0.5
IMPACT = 3.5
rng = np.random.default_rng(7)
N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    seg = sig[: N - i]
    L[i : i + len(seg)] += seg * gain * (1 - max(0, pan))
    R[i : i + len(seg)] += seg * gain * (1 + min(0, pan))


def env(n, decay):
    return np.exp(-np.arange(n) / (decay * SR))


def kick(power=1.0):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env(n, 0.12)
    click = rng.standard_normal(n) * env(n, 0.004) * 0.25
    return (s + click) * power


def clap():
    n = int(0.22 * SR)
    noise = rng.standard_normal(n)
    noise = np.diff(noise, prepend=0)  # grobes Highpass
    e = env(n, 0.05)
    # kleine "Flams" vorne
    e[: int(0.01 * SR)] *= 0.5
    return noise * e * 0.5


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    noise = np.diff(rng.standard_normal(n), n=2, prepend=[0, 0])
    return noise * env(n, 0.08 if open_ else 0.015) * 0.22


def tick(freq):
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * freq * t) * env(n, 0.006) * 0.5


def word_hit():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    f = 900 * np.exp(-t * 14) + 90
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(n, 0.07) * 0.6


def riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = np.diff(rng.standard_normal(n), prepend=0)
    amp = (t / dur) ** 2
    f = 200 + 2800 * (t / dur) ** 2
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (noise * 0.35 + np.sin(ph) * 0.35) * amp


def boom():
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    f = 70 * np.exp(-t * 1.4) + 28
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env(n, 0.6)
    crash = np.diff(rng.standard_normal(n), prepend=0) * env(n, 0.35) * 0.35
    return s * 1.1 + crash


def bass(freq, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(4 * np.pi * freq * t)
    return s * np.minimum(1, t / 0.01) * env(n, dur * 0.7) * 0.55


def pluck(freq):
    n = int(0.28 * SR)
    t = np.arange(n) / SR
    s = (
        np.sign(np.sin(2 * np.pi * freq * t)) * 0.5
        + np.sin(2 * np.pi * freq * 2 * t) * 0.3
    )
    return s * env(n, 0.09) * 0.22


# --- Hook (0 - 3.5 s): trockene Kicks + Wort-Hits auf den Beats ---------------
for b in range(0, int(IMPACT / BEAT)):
    t = b * BEAT
    add(kick(0.8), t, 0.9)
    if b % 2 == 1:
        add(clap(), t, 0.8)
    if b >= 3:
        for h in (0, 0.25):
            add(hat(), t + h, 0.7, pan=0.2)
add(word_hit(), 0.0, 0.9)
add(word_hit(), 0.5, 0.9)

# Riser unter dem Slot-Roll (Frame 45 -> 105)
add(riser(2.0), 1.5, 0.9)

# Slot-Ticks: wenn eine Ziffer an der Anzeige vorbeiläuft
def ease_out(p):
    return 1 - (1 - p) ** 3


def pos(f, total, stop):
    p = np.clip((f - 45) / (stop - 45), 0, 1)
    return total * ease_out(p)


for total, stop, freq, g in ((11, 78, 1500, 0.5), (35, 92, 1900, 0.45), (40, 105, 2400, 0.6)):
    frames = np.arange(45, stop + 1, 0.1)
    p = pos(frames, total, stop)
    steps = np.floor(p)
    changes = np.where(np.diff(steps) > 0)[0]
    for c in changes:
        add(tick(freq), frames[c + 1] / 30, g, pan=-0.3 if freq < 2000 else 0.3)

# --- Impact bei 3.5 s ---------------------------------------------------------
add(boom(), IMPACT, 1.0)
add(kick(1.2), IMPACT, 1.0)

# --- Drop (3.5 - 9 s): Kick, Clap, Hats, Bass, Pluck-Arp ----------------------
bass_notes = [55.0, 55.0, 65.41, 49.0]  # A1 A1 C2 G1
for b in range(int(IMPACT / BEAT), int(DUR / BEAT)):
    t = b * BEAT
    add(kick(1.0), t, 1.0)
    if b % 2 == 1:
        add(clap(), t, 0.9)
    for h in (0, 0.25):
        add(hat(open_=False), t + h, 0.8, pan=0.2)
    add(hat(open_=True), t + 0.25, 0.5, pan=-0.2)
    note = bass_notes[(b // 2) % 4]
    add(bass(note, BEAT * 0.95), t + 0.0, 0.9)
    arp = [note * 8, note * 12, note * 10, note * 12]
    for k in range(4):
        add(pluck(arp[k]), t + k * BEAT / 4, 0.8, pan=-0.3 + 0.2 * k)

# Fade-out in den letzten 0.6 s
fade = np.ones(N)
fn = int(0.6 * SR)
fade[-fn:] = np.linspace(1, 0, fn)
L *= fade
R *= fade

# Normalisieren + weiches Clipping
peak = max(np.abs(L).max(), np.abs(R).max())
L = np.tanh(L / peak * 1.6) * 0.85
R = np.tanh(R / peak * 1.6) * 0.85

out = sys.argv[1]
data = (np.stack([L, R], axis=1) * 32767).astype(np.int16)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(data.tobytes())
print("ok", out, len(data) / SR, "s")
