# Snake Game (Android)

The first app in this repo: a classic **Snake** game.

It is a native Android app (Java, `com.example.snake`) whose UI is a full-screen `WebView`
that loads an HTML5 Canvas Snake game bundled in assets
(`app/src/main/assets/snake.html`). This keeps the game logic in one portable file
while still producing a real installable Android APK.

## Controls
- Arrow keys / WASD (hardware keyboard)
- Swipe on the board
- On-screen direction pad

## Requirements
- JDK 17+ (repo VM uses JDK 21)
- Android SDK with `platform-tools`, `platforms;android-35`, `build-tools;35.0.0`
- Gradle is provided via the committed wrapper (`./gradlew`), which auto-downloads Gradle 8.10.2

## Build a debug APK
```bash
cd apps/snake-game
# tell Gradle where the SDK is (or set ANDROID_SDK_ROOT / ANDROID_HOME)
echo "sdk.dir=/absolute/path/to/android-sdk" > local.properties
./gradlew :app:assembleDebug
```
Output APK: `app/build/outputs/apk/debug/app-debug.apk`

Install on a device/emulator:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## Preview the game without an APK (browser)
The game is plain HTML/JS, so you can run it directly:
```bash
cd apps/snake-game/app/src/main/assets
python3 -m http.server 8080
# open http://localhost:8080/snake.html
```
Demo/self-play mode (a built-in AI plays automatically): append `?autoplay=1`
(optionally `&speed=240` to slow it down). The shipped app loads the file without
query params, so it stays fully manual.
