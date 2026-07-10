# Android APK 构建工具 安装记录

> 本文件记录在 **Cloud Agent 云端服务器** 上下载/安装「制作 Android APK 的工具」的全过程：
> 下载文件的来源、路径、大小、SHA256，以及各组件的存放位置。

## 0. 铁律 · 工作边界

- **所有工作限定在本工作目录内**：`/workspace/android-app/`
- 如需**访问或修改本目录之外**的任何文件/目录，**必须先征求用户同意**。
- **已知必要例外**（已向用户说明）：
  - Git 版本库元数据在 `/workspace/.git`（本目录之外）；`git add/commit/push`、建 PR 会用到它。
  - 系统预装的 **JDK 21**（`/usr/bin/java`）仅**调用**、不修改。
- 本次安装**未使用 apt / 未修改任何系统目录**（curl/unzip/sha256sum 均为系统已装工具，仅调用）。

## 1. 目录结构

```
/workspace/android-app/                     ← 工作边界根目录
├── .gitignore                              ← 排除大体积二进制（android-sdk/、downloads/）
├── android-sdk/                            ← Android SDK（468M，已 gitignore，仅存磁盘）
│   ├── cmdline-tools/latest/               ← sdkmanager 等命令行工具
│   ├── platform-tools/                     ← adb 等
│   ├── platforms/android-35/               ← 编译目标平台
│   └── build-tools/35.0.0/                 ← aapt2 / d8 / r8 等打包工具
└── _setup-records/                         ← 过程记录目录
    ├── 安装记录.md                          ← 本文件
    ├── downloads/                          ← 下载的安装包（已 gitignore）
    │   └── commandlinetools-linux-13114758_latest.zip
    └── logs/                               ← 安装过程日志
        ├── download_cmdline-tools.log
        ├── licenses.log
        └── sdk_install.log
```

## 2. 下载文件清单

| 文件 | 来源 URL | 存放路径 | 大小 (字节) | 大小 (人类可读) | SHA256 |
|------|---------|---------|------------|----------------|--------|
| commandlinetools-linux-13114758_latest.zip | https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip | `/workspace/android-app/_setup-records/downloads/commandlinetools-linux-13114758_latest.zip` | 164,760,899 | 158M | `7ec965280a073311c339e571cd5de778b9975026cfcbe79f2b1cdcb1e15317ee` |

> 说明：该 zip 解压后得到 `cmdline-tools`（含 `sdkmanager`），随后用 `sdkmanager` 从 Google 仓库在线下载其余组件（platform-tools / platforms / build-tools），这些组件由 sdkmanager 直接写入 `android-sdk/`，无单独 zip 留存。

## 3. 已安装 SDK 组件

| 组件 (Path) | 版本 | 存放位置 | 大小 |
|-------------|------|---------|------|
| cmdline-tools | 19.0 | `android-sdk/cmdline-tools/latest/` | 159M |
| platform-tools | 37.0.0（adb 1.0.41）| `android-sdk/platform-tools/` | 22M |
| platforms;android-35 | 2 | `android-sdk/platforms/android-35/` | 142M |
| build-tools;35.0.0 | 35.0.0 | `android-sdk/build-tools/35.0.0/` | 147M |
| **SDK 合计** | | `android-sdk/` | **468M** |

## 4. 环境变量（每次使用前设置，不写入 shell 配置文件）

```bash
export ANDROID_SDK_ROOT="/workspace/android-app/android-sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export PATH="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"
```

> 未修改 `~/.bashrc` 等配置文件（那属于工作目录之外）。如需持久化，请先告知。

## 5. 验证状态

- ✅ `sdkmanager --version` → 19.0（兼容 JDK 21）
- ✅ `adb --version` → 1.0.41
- ✅ `build-tools;35.0.0` 的 `aapt2` / `d8` 存在
- ✅ 许可已接受（`licenses.log`）

## 6. 还差什么才能真正打出 APK

- **Gradle**：一般由具体项目自带的 **Gradle Wrapper（`gradlew`）** 在首次构建时自动下载（约 130MB），无需全局安装。
- **一个项目**：还没有 App 工程。下一步创建（Expo 或原生 Android）后，用 `./gradlew assembleDebug` 即可产出 APK。
- ⚠️ 云端**无 `/dev/kvm`**，无法运行 Android 模拟器；APK 需下载到真机安装查看界面。

## 7. 省 Token 方式（规划）

| 方式 | 说明 |
|------|------|
| **日志落盘，只读末尾** | 冗长命令（下载/安装/构建）输出重定向到 `logs/*.log`，只 `tail` 关键几行，而不是把整段刷屏读进上下文 |
| **静默安装** | `npm install --silent`、`curl --progress-bar`（进度写文件）、`sdkmanager` 输出转日志 |
| **批处理命令** | 相互独立的检查/操作合并到一次 shell 调用，减少来回轮次 |
| **精准搜索** | 用 Grep/Glob 定位文件，避免整目录遍历或整文件朗读 |
| **明确、完整的需求** | 一次把目标/约束讲清，减少反复澄清的往返 |
| **大文件不进上下文** | 二进制/大依赖用 `.gitignore` 排除，不读取其内容；只记录路径与大小 |
| **复用记录** | 把结论沉淀到本记录与 `AGENTS.md`，后续直接引用，不重复分析 |
| **控制截图/录屏** | 仅在需要可视化验证时录屏，且只录关键片段 |

## 8. 追加：Gradle 与首个 APK 构建（2026-07-10）

> 目录结构已重构为英文：`tools/`（共享工具链，gitignore）、`apps/`（每个 app 一个目录）、`setup-records/`。SDK 已从 `android-app/android-sdk` 移动到 `tools/android-sdk`。

### 8.1 新增下载文件

| 文件 | 来源 URL | 存放路径 | 大小 (字节) | 人类可读 | SHA256 |
|------|---------|---------|------------|---------|--------|
| gradle-8.10.2-bin.zip | https://services.gradle.org/distributions/gradle-8.10.2-bin.zip | `setup-records/downloads/gradle-8.10.2-bin.zip` | 136,715,430 | 131M | `31c55713e40233a8303827ceb42ca48a47267a0ad4bab9177123121e71524c26` |

- 解压到 `tools/gradle-8.10.2/`（146M，已 gitignore），用于生成项目的 Gradle Wrapper。

### 8.2 首个 APK（贪吃蛇）

- 工程：`apps/snake-game/`（原生 Android + Java + WebView 承载 HTML5 Canvas 贪吃蛇）。
- 构建命令：
  ```bash
  cd apps/snake-game
  echo "sdk.dir=/workspace/tools/android-sdk" > local.properties
  export ANDROID_SDK_ROOT=/workspace/tools/android-sdk
  ./gradlew :app:assembleDebug
  ```
- 产物：`apps/snake-game/app/build/outputs/apk/debug/app-debug.apk`（约 13.9 KB，`build/` 已 gitignore）。
- 结果：**BUILD SUCCESSFUL** —— 证明当前云端环境**已可生成 APK**。
- ⚠️ 云端无 `/dev/kvm`，无法运行模拟器；APK 需装到真机查看，游戏画面已用浏览器演示验证。

### 8.3 构建日志

- `logs/download_gradle.log`、`logs/gradle_wrapper.log`、`logs/build_apk.log`、`logs/build_apk2.log`
