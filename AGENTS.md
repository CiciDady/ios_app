# ios_app

## Cursor Cloud specific instructions

- As of this writing, this repository is a **placeholder**: it contains only `README.md` (`# ios_app`) with no source code, no dependency manifest (`Package.swift`, `Podfile`, `*.xcodeproj`, `package.json`, etc.), and no build/run/test commands. There is nothing to install, lint, test, build, or run yet.
- The name suggests an intended **iOS application**. iOS apps require macOS + Xcode (and typically Swift Package Manager or CocoaPods). The Cloud Agent VM is **x86_64 Linux with no macOS/Xcode toolchain**, so a native iOS project cannot be built or run in this environment. Do not attempt to provision an iOS toolchain here.
- The startup update script is intentionally a near no-op until real project scaffolding and a dependency manifest are committed. Once source and a manifest exist, revisit both the update script (dependency install) and this file (how to lint/test/build/run).
