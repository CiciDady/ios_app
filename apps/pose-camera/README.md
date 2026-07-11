# Pose Camera（摆拍引导相机）

摆拍引导相机 app。核心目标:①根据背景推荐好看的姿势;②人物摆到轮廓阈值就自动拍。
架构与决策见 [`DESIGN.md`](./DESIGN.md)。

技术栈:**Expo (React Native, TypeScript)** + `expo-camera` + `react-native-svg` +（下一步）`react-native-vision-camera` frame processor 做姿态检测。

## 目录结构
```
src/
  core/        纯逻辑（可在云端/Node 单测，无 RN 依赖）
    types.ts       领域类型（关键点、姿势）
    keypoints.ts   骨架归一化（去位置/大小）
    poseMatch.ts   姿势匹配打分（0–100）+ 阈值判断
    recommend.ts   场景标签 → 加权随机推荐 5 个
    skeleton.ts    骨骼连线定义（画骨架用）
    __tests__/     单元测试
  data/poses.ts    占位姿势库（10 个，带归一化关键点）
  components/PoseSkeleton.tsx  SVG 骨架（叠加引导 & 缩略图）
  detector/PoseDetector.ts     姿态检测接口 + Mock（真实实现见下）
  screens/CameraScreen.tsx     主相机界面
```

## 开发运行
```bash
cd apps/pose-camera
npm install
npm start          # Expo Dev Server；手机装 Expo Go 扫码即可预览（基础相机功能）
# 或 npm run android / npm run ios
```

## 测试 / 检查（云端可跑，无需设备）
```bash
npm test           # 核心算法单元测试（匹配 + 推荐），15 个用例
npm run typecheck  # tsc --noEmit
npx expo export --platform android   # 验证可打包
```

## 当前状态
- ✅ 已实现:基础相机预览、姿势轮廓叠加、场景选择、推荐/换一批、透明度/翻转、2–10s 倒计时快门、存相册。
- ✅ 已实现并单测:姿势匹配打分、姿势推荐(两大核心的「大脑」)。
- ⏳ 下一步(需 **Expo Dev Build**,真机验证):
  - 实时姿态检测(vision-camera frame processor) → 「人进轮廓自动拍」(核心功能 2)。
  - 端侧场景识别(ML Kit Image Labeling)替代手动选场景(核心功能 1 增强)。

## 说明
- **`expo-camera` 基础功能可在 Expo Go 直接体验**;姿态检测需自定义原生模块,须 Dev Build。
- 占位姿势库仅用于跑通流程,后续用真实姿势素材 + 关键点替换。
