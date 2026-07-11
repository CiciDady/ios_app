// Shared domain types for Pose Camera core logic (pure, no RN/Expo imports).

export type JointName =
  | 'nose'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'leftElbow'
  | 'rightElbow'
  | 'leftWrist'
  | 'rightWrist'
  | 'leftHip'
  | 'rightHip'
  | 'leftKnee'
  | 'rightKnee'
  | 'leftAnkle'
  | 'rightAnkle';

export interface Point {
  x: number;
  y: number;
}

/** A skeleton: joint name -> point. May be partial (some joints missing/occluded). */
export type Keypoints = Partial<Record<JointName, Point>>;

export type Orientation = 'portrait' | 'landscape' | 'square';
export type Subject = 'single' | 'couple' | 'group';

export interface Pose {
  id: string;
  name: string;
  /** Optional bundled image assets (added when real art is available). */
  thumbnail?: string;
  overlay?: string;
  /** Scenes this pose suits, e.g. ['beach','outdoor']. Drives recommendation. */
  sceneTags: string[];
  orientation: Orientation;
  subject: Subject;
  style?: string;
  /** Reference skeleton (any coordinate space; matching normalizes it). */
  keypoints: Keypoints;
  /** Per-pose auto-capture threshold (0..100). Defaults to 85 if omitted. */
  matchThreshold?: number;
}
