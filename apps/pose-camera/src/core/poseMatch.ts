import { Keypoints, JointName } from './types';
import { normalize, jointNames } from './keypoints';

/** Normalized-distance scale that maps to the 0..100 score. Tunable. */
export const DEFAULT_TOLERANCE = 1.0;

/**
 * Compare a detected skeleton against a target pose skeleton.
 * Returns a 0..100 match score (100 = perfect). Both are normalized first, so
 * the score is invariant to the subject's position and size in frame.
 *
 * The score is scaled by joint "coverage" (how many of the target's joints were
 * actually detected), so a partial detection can't accidentally score high.
 */
export function matchScore(
  detected: Keypoints,
  target: Keypoints,
  tolerance: number = DEFAULT_TOLERANCE,
): number {
  const a = normalize(detected);
  const b = normalize(target);

  const targetJoints = jointNames(b);
  const common = (jointNames(a) as JointName[]).filter((n) => b[n] !== undefined);
  if (common.length === 0 || targetJoints.length === 0) return 0;

  let sum = 0;
  for (const n of common) {
    const pa = a[n]!;
    const pb = b[n]!;
    sum += Math.hypot(pa.x - pb.x, pa.y - pb.y);
  }
  const meanDist = sum / common.length;
  const base = Math.max(0, 1 - meanDist / tolerance);
  const coverage = common.length / targetJoints.length;
  return Math.round(base * coverage * 100);
}

/** Whether a score clears the (per-pose or default) threshold. */
export function isMatch(score: number, threshold: number = 85): boolean {
  return score >= threshold;
}
