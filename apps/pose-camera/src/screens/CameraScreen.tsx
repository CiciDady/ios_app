import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

import { Pose } from '../core/types';
import { recommendPoses } from '../core/recommend';
import { POSES, ALL_SCENE_TAGS } from '../data/poses';
import { MockPoseDetector } from '../detector/PoseDetector';
import PoseSkeleton from '../components/PoseSkeleton';

const TIMERS: Array<0 | 2 | 5 | 10> = [0, 2, 5, 10];

export default function CameraScreen() {
  const { width, height } = useWindowDimensions();
  const [camPerm, requestCam] = useCameraPermissions();
  const [mediaPerm, requestMedia] = MediaLibrary.usePermissions();
  const cameraRef = useRef<CameraView>(null);

  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [scene, setScene] = useState<string | null>(null);
  const [recs, setRecs] = useState<Pose[]>([]);
  const [selected, setSelected] = useState<Pose | null>(null);
  const [opacity, setOpacity] = useState(0.5);
  const [flip, setFlip] = useState(false);
  const [timer, setTimer] = useState<0 | 2 | 5 | 10>(0);
  const [countdown, setCountdown] = useState(0);

  // Real detection (pose-match auto-capture) is phase 2 — needs a dev build.
  const detector = useMemo(() => new MockPoseDetector(), []);

  const refresh = useCallback(() => {
    const next = recommendPoses(POSES, scene ? [scene] : [], { count: 5 });
    setRecs(next);
    setSelected((prev) =>
      prev && next.some((p) => p.id === prev.id) ? prev : next[0] ?? null,
    );
  }, [scene]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const doShoot = useCallback(async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync();
      if (!photo?.uri) return;
      if (!mediaPerm?.granted) {
        const res = await requestMedia();
        if (!res.granted) {
          Alert.alert('已拍照', '未授权相册，照片未保存。');
          return;
        }
      }
      await MediaLibrary.saveToLibraryAsync(photo.uri);
      Alert.alert('已保存', '照片已保存到相册。');
    } catch (e) {
      Alert.alert('拍照失败', String(e));
    }
  }, [mediaPerm, requestMedia]);

  const capture = useCallback(() => {
    if (timer === 0) {
      void doShoot();
      return;
    }
    let n = timer;
    setCountdown(n);
    const id = setInterval(() => {
      n -= 1;
      setCountdown(n);
      if (n <= 0) {
        clearInterval(id);
        setCountdown(0);
        void doShoot();
      }
    }, 1000);
  }, [timer, doShoot]);

  // ----- Permission gate -----
  if (!camPerm) {
    return (
      <View style={styles.center}>
        <Text style={styles.info}>正在检查相机权限…</Text>
      </View>
    );
  }
  if (!camPerm.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>需要相机权限</Text>
        <Text style={styles.info}>本应用需要使用相机来引导摆拍与拍照。</Text>
        <Pressable style={styles.primaryBtn} onPress={requestCam}>
          <Text style={styles.primaryBtnText}>授权相机</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />

      {/* Pose guide overlay */}
      {selected && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <PoseSkeleton
            keypoints={selected.keypoints}
            width={width}
            height={height}
            flip={flip}
            opacity={opacity}
          />
        </View>
      )}

      {/* Countdown */}
      {countdown > 0 && (
        <View pointerEvents="none" style={styles.countdownWrap}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      {/* Top: scene chips (stand-in for on-device scene detection, phase 2) */}
      <View style={styles.topBar}>
        <Text style={styles.caption}>背景场景</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {ALL_SCENE_TAGS.map((tag) => {
            const on = scene === tag;
            return (
              <Pressable
                key={tag}
                onPress={() => setScene(on ? null : tag)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{tag}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottom}>
        {/* Recommended poses + refresh */}
        <View style={styles.recRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recs.map((p) => {
              const on = selected?.id === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setSelected(p)}
                  style={[styles.thumb, on && styles.thumbOn]}
                >
                  <PoseSkeleton
                    keypoints={p.keypoints}
                    width={44}
                    height={64}
                    opacity={0.9}
                    strokeWidth={2}
                    jointRadius={2.5}
                    color={on ? '#7dffb0' : '#cbd5ff'}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable style={styles.refreshBtn} onPress={refresh}>
            <Text style={styles.refreshText}>换一批</Text>
          </Pressable>
        </View>

        {/* Adjustments */}
        <View style={styles.adjustRow}>
          <SmallBtn label="透明-" onPress={() => setOpacity((o) => Math.max(0.1, o - 0.1))} />
          <SmallBtn label="透明+" onPress={() => setOpacity((o) => Math.min(1, o + 0.1))} />
          <SmallBtn label={flip ? '翻转:开' : '翻转:关'} onPress={() => setFlip((f) => !f)} />
          <SmallBtn
            label={`延迟:${timer === 0 ? '关' : timer + 's'}`}
            onPress={() =>
              setTimer((t) => TIMERS[(TIMERS.indexOf(t) + 1) % TIMERS.length])
            }
          />
        </View>

        {/* Shutter row */}
        <View style={styles.shutterRow}>
          <SmallBtn
            label={facing === 'back' ? '后置' : '前置'}
            onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
          />
          <Pressable style={styles.shutter} onPress={capture}>
            <View style={styles.shutterInner} />
          </Pressable>
          <View style={styles.autoNote}>
            <Text style={styles.autoNoteText}>
              自动拍{detector.available ? '' : '(需 Dev Build)'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function SmallBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.smallBtn} onPress={onPress}>
      <Text style={styles.smallBtnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b1021',
    padding: 24,
    gap: 12,
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  info: { color: '#c7cede', textAlign: 'center' },
  primaryBtn: {
    backgroundColor: '#38e07b',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  primaryBtnText: { color: '#04240f', fontWeight: '700' },
  topBar: { position: 'absolute', top: 48, left: 12, right: 12, gap: 6 },
  caption: { color: '#e6ebff', fontSize: 12, opacity: 0.8 },
  chip: {
    backgroundColor: 'rgba(20,26,51,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  chipOn: { backgroundColor: '#38e07b' },
  chipText: { color: '#e6ebff', fontSize: 13 },
  chipTextOn: { color: '#04240f', fontWeight: '700' },
  countdownWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: { color: '#fff', fontSize: 120, fontWeight: '800' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, gap: 10 },
  recRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  thumb: {
    width: 52,
    height: 72,
    borderRadius: 10,
    backgroundColor: 'rgba(20,26,51,0.7)',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbOn: { borderColor: '#38e07b' },
  refreshBtn: {
    backgroundColor: 'rgba(20,26,51,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  refreshText: { color: '#e6ebff', fontWeight: '600' },
  adjustRow: { flexDirection: 'row', gap: 8 },
  smallBtn: {
    backgroundColor: 'rgba(20,26,51,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  smallBtnText: { color: '#e6ebff', fontSize: 12 },
  shutterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' },
  autoNote: { width: 72, alignItems: 'center' },
  autoNoteText: { color: '#c7cede', fontSize: 10, textAlign: 'center' },
});
