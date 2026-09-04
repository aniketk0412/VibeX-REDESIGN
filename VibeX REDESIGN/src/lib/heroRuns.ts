import { RUNS_A } from "./runsA";
import { RUNS_B } from "./runsB";

export type { HeroRun, HeroFile, Stage, Tone } from "./heroTypes";

/** All fifteen pre-authored builds. */
export const HERO_RUNS = [...RUNS_A, ...RUNS_B];

/**
 * Shuffled play order so two visits rarely open on the same build,
 * while still guaranteeing every run appears before any repeats.
 */
export function shuffledOrder(): number[] {
  const idx = HERO_RUNS.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}
