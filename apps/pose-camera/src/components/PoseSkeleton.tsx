import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Keypoints } from '../core/types';
import { BONES } from '../core/skeleton';

interface Props {
  keypoints: Keypoints;
  width: number;
  height: number;
  /** Mirror horizontally (useful for front camera / left-right variants). */
  flip?: boolean;
  opacity?: number;
  color?: string;
  strokeWidth?: number;
  jointRadius?: number;
}

/**
 * Renders a skeleton (keypoints in 0..1 space) as an SVG overlay scaled to the
 * given width/height. Used both for the live camera guide and for thumbnails.
 */
export default function PoseSkeleton({
  keypoints,
  width,
  height,
  flip = false,
  opacity = 0.6,
  color = '#38e07b',
  strokeWidth = 4,
  jointRadius = 5,
}: Props) {
  const px = (x: number) => (flip ? 1 - x : x) * width;
  const py = (y: number) => y * height;

  return (
    <Svg width={width} height={height} opacity={opacity}>
      {BONES.map(([a, b], i) => {
        const pa = keypoints[a];
        const pb = keypoints[b];
        if (!pa || !pb) return null;
        return (
          <Line
            key={`b${i}`}
            x1={px(pa.x)}
            y1={py(pa.y)}
            x2={px(pb.x)}
            y2={py(pb.y)}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        );
      })}
      {(Object.keys(keypoints) as (keyof typeof keypoints)[]).map((name) => {
        const p = keypoints[name];
        if (!p) return null;
        return (
          <Circle key={String(name)} cx={px(p.x)} cy={py(p.y)} r={jointRadius} fill={color} />
        );
      })}
    </Svg>
  );
}
