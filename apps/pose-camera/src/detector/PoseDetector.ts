import { Keypoints } from '../core/types';

/**
 * Abstraction over on-device pose detection so the app/logic can be built and
 * unit-tested without the native model. The real implementation (phase 2) will
 * use react-native-vision-camera frame processors + ML Kit/MediaPipe/MoveNet
 * and requires an Expo Dev Build (cannot run in Expo Go or the cloud VM).
 */
export interface PoseDetector {
  /** True when a real, running detector is wired up. */
  readonly available: boolean;
  /** Latest detected skeleton, or null if unavailable this frame. */
  detectFromLatestFrame(): Keypoints | null;
}

/** No-op detector used until the native frame processor is integrated. */
export class MockPoseDetector implements PoseDetector {
  readonly available = false;
  detectFromLatestFrame(): Keypoints | null {
    return null;
  }
}
