import { Keypoints, JointName } from './types';

/** List of joint names present in a skeleton. */
export function jointNames(kp: Keypoints): JointName[] {
  return Object.keys(kp) as JointName[];
}

/**
 * Normalize a skeleton to be translation- and scale-invariant:
 * - center on the centroid of available joints
 * - scale so the RMS distance from the centroid is 1
 * This lets us compare two poses regardless of where the person stands or how
 * large they appear in frame. (Rotation is intentionally NOT removed.)
 */
export function normalize(kp: Keypoints): Keypoints {
  const names = jointNames(kp);
  if (names.length === 0) return {};

  let cx = 0;
  let cy = 0;
  for (const n of names) {
    const p = kp[n]!;
    cx += p.x;
    cy += p.y;
  }
  cx /= names.length;
  cy /= names.length;

  let ss = 0;
  for (const n of names) {
    const p = kp[n]!;
    ss += (p.x - cx) ** 2 + (p.y - cy) ** 2;
  }
  const scale = Math.sqrt(ss / names.length) || 1;

  const out: Keypoints = {};
  for (const n of names) {
    const p = kp[n]!;
    out[n] = { x: (p.x - cx) / scale, y: (p.y - cy) / scale };
  }
  return out;
}
