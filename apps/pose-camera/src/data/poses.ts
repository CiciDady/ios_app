import { Pose, Keypoints } from '../core/types';

/**
 * PLACEHOLDER pose library — coordinates are in a rough 0..1 image space
 * (x: left→right, y: top→bottom). They exist to make the full flow work end to
 * end; replace `keypoints` (and add real `thumbnail`/`overlay` art) with curated
 * data later. Matching normalizes these, so exact scale/position does not matter.
 */

// A neutral standing skeleton; individual poses override the arms/legs.
const base: Keypoints = {
  nose: { x: 0.5, y: 0.1 },
  leftShoulder: { x: 0.42, y: 0.22 },
  rightShoulder: { x: 0.58, y: 0.22 },
  leftElbow: { x: 0.38, y: 0.35 },
  rightElbow: { x: 0.62, y: 0.35 },
  leftWrist: { x: 0.36, y: 0.48 },
  rightWrist: { x: 0.64, y: 0.48 },
  leftHip: { x: 0.45, y: 0.52 },
  rightHip: { x: 0.55, y: 0.52 },
  leftKnee: { x: 0.44, y: 0.72 },
  rightKnee: { x: 0.56, y: 0.72 },
  leftAnkle: { x: 0.43, y: 0.92 },
  rightAnkle: { x: 0.57, y: 0.92 },
};

const mk = (over: Keypoints): Keypoints => ({ ...base, ...over });

export const POSES: Pose[] = [
  {
    id: 'stand_hands_hips',
    name: 'Hands on hips',
    sceneTags: ['wall', 'street', 'indoor'],
    orientation: 'portrait',
    subject: 'single',
    style: 'confident',
    keypoints: mk({
      leftElbow: { x: 0.34, y: 0.4 },
      rightElbow: { x: 0.66, y: 0.4 },
      leftWrist: { x: 0.44, y: 0.5 },
      rightWrist: { x: 0.56, y: 0.5 },
    }),
  },
  {
    id: 'wave_hi',
    name: 'Waving hello',
    sceneTags: ['beach', 'outdoor', 'sunset'],
    orientation: 'portrait',
    subject: 'single',
    style: 'cheerful',
    keypoints: mk({
      rightElbow: { x: 0.66, y: 0.2 },
      rightWrist: { x: 0.72, y: 0.08 },
    }),
  },
  {
    id: 'arms_up',
    name: 'Arms up',
    sceneTags: ['beach', 'outdoor', 'sunset', 'mountain'],
    orientation: 'portrait',
    subject: 'single',
    style: 'joyful',
    keypoints: mk({
      leftElbow: { x: 0.4, y: 0.15 },
      rightElbow: { x: 0.6, y: 0.15 },
      leftWrist: { x: 0.42, y: 0.03 },
      rightWrist: { x: 0.58, y: 0.03 },
    }),
  },
  {
    id: 'lean_wall',
    name: 'Leaning',
    sceneTags: ['wall', 'street', 'urban'],
    orientation: 'portrait',
    subject: 'single',
    style: 'casual',
    keypoints: mk({
      nose: { x: 0.54, y: 0.11 },
      leftWrist: { x: 0.4, y: 0.5 },
      rightWrist: { x: 0.6, y: 0.46 },
    }),
  },
  {
    id: 'walking',
    name: 'Walking',
    sceneTags: ['street', 'outdoor', 'urban'],
    orientation: 'portrait',
    subject: 'single',
    style: 'candid',
    keypoints: mk({
      leftKnee: { x: 0.42, y: 0.7 },
      rightKnee: { x: 0.58, y: 0.74 },
      leftAnkle: { x: 0.38, y: 0.9 },
      rightAnkle: { x: 0.62, y: 0.94 },
    }),
  },
  {
    id: 'look_back',
    name: 'Looking back',
    sceneTags: ['beach', 'outdoor', 'field'],
    orientation: 'portrait',
    subject: 'single',
    style: 'elegant',
    keypoints: mk({
      nose: { x: 0.46, y: 0.1 },
      leftShoulder: { x: 0.4, y: 0.24 },
      rightShoulder: { x: 0.56, y: 0.2 },
    }),
  },
  {
    id: 'sit_relaxed',
    name: 'Sitting relaxed',
    sceneTags: ['cafe', 'indoor', 'stairs'],
    orientation: 'square',
    subject: 'single',
    style: 'relaxed',
    keypoints: mk({
      leftHip: { x: 0.45, y: 0.58 },
      rightHip: { x: 0.55, y: 0.58 },
      leftKnee: { x: 0.4, y: 0.66 },
      rightKnee: { x: 0.6, y: 0.66 },
      leftAnkle: { x: 0.42, y: 0.8 },
      rightAnkle: { x: 0.58, y: 0.8 },
    }),
  },
  {
    id: 'crouch',
    name: 'Crouching',
    sceneTags: ['street', 'urban', 'wall'],
    orientation: 'square',
    subject: 'single',
    style: 'street',
    keypoints: mk({
      leftHip: { x: 0.45, y: 0.6 },
      rightHip: { x: 0.55, y: 0.6 },
      leftKnee: { x: 0.4, y: 0.68 },
      rightKnee: { x: 0.6, y: 0.68 },
      leftAnkle: { x: 0.44, y: 0.82 },
      rightAnkle: { x: 0.56, y: 0.82 },
    }),
  },
  {
    id: 'hand_in_hair',
    name: 'Hand in hair',
    sceneTags: ['indoor', 'cafe', 'wall'],
    orientation: 'portrait',
    subject: 'single',
    style: 'soft',
    keypoints: mk({
      rightElbow: { x: 0.64, y: 0.18 },
      rightWrist: { x: 0.56, y: 0.08 },
    }),
  },
  {
    id: 'jump',
    name: 'Jumping',
    sceneTags: ['beach', 'outdoor', 'field', 'mountain'],
    orientation: 'landscape',
    subject: 'single',
    style: 'energetic',
    keypoints: mk({
      leftElbow: { x: 0.36, y: 0.16 },
      rightElbow: { x: 0.64, y: 0.16 },
      leftWrist: { x: 0.34, y: 0.05 },
      rightWrist: { x: 0.66, y: 0.05 },
      leftKnee: { x: 0.42, y: 0.66 },
      rightKnee: { x: 0.58, y: 0.66 },
      leftAnkle: { x: 0.4, y: 0.78 },
      rightAnkle: { x: 0.6, y: 0.78 },
    }),
  },
];

/** Distinct scene tags across the library (for the scene picker UI). */
export const ALL_SCENE_TAGS: string[] = Array.from(
  new Set(POSES.flatMap((p) => p.sceneTags)),
).sort();
