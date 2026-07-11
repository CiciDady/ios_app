import { matchScore, isMatch } from '../poseMatch';
import { Keypoints } from '../types';

const target: Keypoints = {
  nose: { x: 0.5, y: 0.1 },
  leftShoulder: { x: 0.42, y: 0.22 },
  rightShoulder: { x: 0.58, y: 0.22 },
  leftHip: { x: 0.45, y: 0.52 },
  rightHip: { x: 0.55, y: 0.52 },
  leftAnkle: { x: 0.43, y: 0.92 },
  rightAnkle: { x: 0.57, y: 0.92 },
};

const shift = (kp: Keypoints, dx: number, dy: number): Keypoints =>
  Object.fromEntries(
    Object.entries(kp).map(([k, p]) => [k, { x: p!.x + dx, y: p!.y + dy }]),
  ) as Keypoints;

const scale = (kp: Keypoints, s: number): Keypoints =>
  Object.fromEntries(
    Object.entries(kp).map(([k, p]) => [k, { x: p!.x * s, y: p!.y * s }]),
  ) as Keypoints;

describe('matchScore', () => {
  it('identical pose scores 100', () => {
    expect(matchScore(target, target)).toBe(100);
  });

  it('is translation-invariant', () => {
    expect(matchScore(shift(target, 0.3, -0.2), target)).toBe(100);
  });

  it('is scale-invariant', () => {
    expect(matchScore(scale(target, 3), target)).toBe(100);
  });

  it('scores a clearly different pose below the default threshold', () => {
    const different: Keypoints = {
      ...target,
      // arms/limbs thrown far off
      leftShoulder: { x: 0.1, y: 0.8 },
      rightShoulder: { x: 0.9, y: 0.05 },
      leftAnkle: { x: 0.9, y: 0.1 },
      rightAnkle: { x: 0.1, y: 0.1 },
    };
    const s = matchScore(different, target);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThan(85);
  });

  it('penalizes low joint coverage', () => {
    const partial: Keypoints = { nose: target.nose };
    // only 1 of 7 target joints detected -> coverage caps the score
    expect(matchScore(partial, target)).toBeLessThan(50);
  });

  it('returns 0 when there are no common joints', () => {
    const other: Keypoints = { leftKnee: { x: 0.4, y: 0.7 } };
    expect(matchScore(other, target)).toBe(0);
  });

  it('isMatch respects threshold', () => {
    expect(isMatch(90)).toBe(true);
    expect(isMatch(80)).toBe(false);
    expect(isMatch(80, 75)).toBe(true);
  });
});
