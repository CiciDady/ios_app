# ios_app

## Cursor Cloud specific instructions

### Repository layout
- `apps/` — one directory per app. First app: `apps/snake-game/` (native Android + WebView HTML5 game).
- `tools/` — shared toolchains, **gitignored** (not in the repo, live only on the VM disk):
  - `tools/android-sdk/` — Android SDK (`cmdline-tools`, `platform-tools`, `platforms;android-35`, `build-tools;35.0.0`).
  - `tools/gradle-8.10.2/` — Gradle distribution used to bootstrap project wrappers.
- `setup-records/` — install records + raw logs (download URLs/sizes/SHA256). See `setup-records/INSTALL_RECORD.md`.
- `scripts/auto_commit_push.sh` — stage/commit/push current branch; meant for scheduled runs. See `docs/自动更新github.md`.
- `docs/` — Chinese reference docs (environment/tooling summary, GitHub auto-update scheduling).

### Environment constraints (important)
- VM is **x86_64 Linux, JDK 21, Node 22** — no macOS/Xcode, so **native iOS cannot be built here**.
- **No `/dev/kvm`** → **Android emulators cannot run** on this VM. APKs build fine but cannot be launched here; verify the APK by installing on a real device, and demo game/UI logic via the browser instead.

### Building the Android APK (Snake game)
- The `tools/android-sdk` and `tools/gradle-*` dirs are gitignored, so on a fresh VM they must be reinstalled before building (see `setup-records/INSTALL_RECORD.md` for exact steps; the update script does not reinstall them).
- Point Gradle at the SDK, then use the committed wrapper:
  ```bash
  cd apps/snake-game
  echo "sdk.dir=/workspace/tools/android-sdk" > local.properties   # gitignored
  export ANDROID_SDK_ROOT=/workspace/tools/android-sdk
  ./gradlew :app:assembleDebug
  ```
  Output: `apps/snake-game/app/build/outputs/apk/debug/app-debug.apk`.
- The game logic lives in `apps/snake-game/app/src/main/assets/snake.html` (loaded by a WebView). Preview/demo it with `python3 -m http.server` in that assets dir; append `?autoplay=1` for an AI self-play demo (shipped app loads without query params, staying manual).

### Git / workflow conventions (from the owner)
- **Everything must be committed and pushed to GitHub** for tracking/rollback.
- Owner wants twice-daily auto-push (12:30 and 21:30) from their working machine (their Mac) via `scripts/auto_commit_push.sh` + launchd/cron — see `docs/自动更新github.md`. Cloud agents already push after every change, so they do not need this timer.
- Keep large binaries (SDK, Gradle, APKs, `build/`) out of git — see root `.gitignore`.
