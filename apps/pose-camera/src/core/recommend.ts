import { Pose, Orientation, Subject } from './types';

export type Rng = () => number;

export interface RecommendOptions {
  /** How many poses to return (default 5). */
  count?: number;
  /** Preferred frame orientation; matching poses get a small boost. */
  orientation?: Orientation;
  /** Restrict to a subject type (single/couple/group). */
  subject?: Subject;
  /** Injectable RNG for deterministic tests (default Math.random). */
  rng?: Rng;
}

/**
 * Affinity score of a pose for a set of scene tags (+ optional orientation).
 * Higher = better suited to the current background.
 */
export function scorePose(pose: Pose, sceneTags: string[], orientation?: Orientation): number {
  const wanted = new Set(sceneTags.map((t) => t.toLowerCase()));
  let score = 0;
  for (const tag of pose.sceneTags) {
    if (wanted.has(tag.toLowerCase())) score += 2;
  }
  if (orientation && pose.orientation === orientation) score += 1;
  return score;
}

/**
 * Recommend N poses for the given background scene tags.
 * Uses weighted random sampling WITHOUT replacement: poses matching the scene
 * are favored, but non-matching ones can still appear (variety). Calling again
 * (e.g. the "refresh" button) yields a fresh sample.
 */
export function recommendPoses(
  all: Pose[],
  sceneTags: string[],
  opts: RecommendOptions = {},
): Pose[] {
  const count = opts.count ?? 5;
  const rng = opts.rng ?? Math.random;

  let pool = all;
  if (opts.subject) pool = pool.filter((p) => p.subject === opts.subject);

  const weighted = pool.map((p) => ({
    pose: p,
    weight: 1 + scorePose(p, sceneTags, opts.orientation),
  }));

  return weightedSampleWithoutReplacement(weighted, count, rng);
}

function weightedSampleWithoutReplacement(
  items: { pose: Pose; weight: number }[],
  count: number,
  rng: Rng,
): Pose[] {
  const pool = items.slice();
  const picked: Pose[] = [];
  const n = Math.min(count, pool.length);

  for (let i = 0; i < n; i++) {
    const total = pool.reduce((s, it) => s + it.weight, 0);
    let r = rng() * total;
    let idx = 0;
    for (let j = 0; j < pool.length; j++) {
      r -= pool[j].weight;
      if (r <= 0) {
        idx = j;
        break;
      }
      idx = j;
    }
    picked.push(pool[idx].pose);
    pool.splice(idx, 1);
  }
  return picked;
}
