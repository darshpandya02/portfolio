/**
 * Springs, sampled at build time into CSS linear() easings.
 *
 * A tween eases toward its target and stops there. A spring carries momentum
 * past the target and settles back, which is the whole reason it reads as
 * physical instead of animated. Sampling the spring into linear() keeps that
 * motion but hands it to the compositor, so nothing here runs in JS at runtime
 * and the browser can still drop the animation when a user asks it to.
 */

export type SpringSpec = {
  stiffness: number;
  damping: number;
  mass?: number;
};

export type Spring = {
  /** A CSS easing function: linear(0, 0.0421, ...) */
  easing: string;
  /** How long the spring takes to settle, rounded to the nearest 5ms */
  durationMs: number;
};

/** Settled once the decay envelope is inside 1% of the target. */
const SETTLED = 0.01;

export function spring({ stiffness, damping, mass = 1 }: SpringSpec, samples = 28): Spring {
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const seconds = -Math.log(SETTLED) / (zeta * w0);

  const positionAt = (fraction: number) => {
    const t = fraction * seconds;
    const decay = Math.exp(-zeta * w0 * t);
    if (zeta < 1) {
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      return 1 - decay * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
    }
    return 1 - decay * (1 + zeta * w0 * t);
  };

  const points: string[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const value = i === samples ? 1 : positionAt(i / samples);
    points.push(String(Number(value.toFixed(4))));
  }

  return {
    easing: `linear(${points.join(", ")})`,
    durationMs: Math.round((seconds * 1000) / 5) * 5,
  };
}

/** Page to page. Quick, and it overshoots by so little you feel it rather than see it. */
export const springPage = spring({ stiffness: 900, damping: 45 });

/** The nav pill. Looser, because this is the one thing you are actually watching move. */
export const springPill = spring({ stiffness: 700, damping: 30 });
