import { recommendPoses, scorePose, Rng } from '../recommend';
import { POSES } from '../../data/poses';

// Deterministic PRNG for reproducible tests.
function mulberry32(seed: number): Rng {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('scorePose', () => {
  it('rewards matching scene tags and orientation', () => {
    const beachPose = POSES.find((p) => p.id === 'arms_up')!;
    const indoorPose = POSES.find((p) => p.id === 'stand_hands_hips')!;
    expect(scorePose(beachPose, ['beach'])).toBeGreaterThan(
      scorePose(indoorPose, ['beach']),
    );
    expect(scorePose(beachPose, ['beach'], 'portrait')).toBeGreaterThan(
      scorePose(beachPose, ['beach'], 'landscape'),
    );
  });

  it('is case-insensitive on tags', () => {
    const beachPose = POSES.find((p) => p.id === 'arms_up')!;
    expect(scorePose(beachPose, ['BEACH'])).toBe(scorePose(beachPose, ['beach']));
  });
});

describe('recommendPoses', () => {
  it('returns the requested count (default 5)', () => {
    const out = recommendPoses(POSES, ['beach'], { rng: mulberry32(1) });
    expect(out).toHaveLength(5);
  });

  it('never returns duplicates', () => {
    const out = recommendPoses(POSES, ['outdoor'], { count: 8, rng: mulberry32(7) });
    const ids = out.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('caps at pool size when count exceeds it', () => {
    const out = recommendPoses(POSES, [], { count: 999, rng: mulberry32(3) });
    expect(out).toHaveLength(POSES.length);
  });

  it('is deterministic for a fixed seed and varies with "refresh"', () => {
    const a = recommendPoses(POSES, ['beach'], { rng: mulberry32(42) }).map((p) => p.id);
    const b = recommendPoses(POSES, ['beach'], { rng: mulberry32(42) }).map((p) => p.id);
    const c = recommendPoses(POSES, ['beach'], { rng: mulberry32(43) }).map((p) => p.id);
    expect(a).toEqual(b); // same seed -> same result
    expect(a).not.toEqual(c); // different seed (refresh) -> different sample
  });

  it('filters by subject', () => {
    const out = recommendPoses(POSES, ['beach'], { subject: 'single', rng: mulberry32(5) });
    expect(out.every((p) => p.subject === 'single')).toBe(true);
  });

  it('favors scene-matching poses on average', () => {
    // Over many draws of a single pick, beach poses should dominate for a beach scene.
    let beachFirst = 0;
    const trials = 400;
    for (let i = 0; i < trials; i++) {
      const [first] = recommendPoses(POSES, ['beach'], { count: 1, rng: mulberry32(i * 101 + 1) });
      if (first.sceneTags.includes('beach')) beachFirst++;
    }
    // Beach poses are a minority of the library but weighted higher -> should
    // clearly exceed their unweighted share.
    const beachShare = POSES.filter((p) => p.sceneTags.includes('beach')).length / POSES.length;
    expect(beachFirst / trials).toBeGreaterThan(beachShare);
  });
});
