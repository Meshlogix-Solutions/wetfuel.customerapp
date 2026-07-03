#!/usr/bin/env bash
# Builds the Angular app, syncs it into the Capacitor Android project,
# and assembles an APK with Gradle.
#
# Usage:
#   ./build-apk.sh          # debug APK (unsigned, for testing)
#   ./build-apk.sh release  # release APK (needs signing config in android/app/build.gradle)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BUILD_TYPE="${1:-debug}"
if [[ "$BUILD_TYPE" != "debug" && "$BUILD_TYPE" != "release" ]]; then
  echo "Usage: $0 [debug|release]" >&2
  exit 1
fi

echo "==> Building Angular app (production)"
npx ng build --configuration production

echo "==> Syncing web assets into android/"
npx cap sync android

echo "==> Assembling $BUILD_TYPE APK with Gradle"
cd android
if [[ "$BUILD_TYPE" == "debug" ]]; then
  ./gradlew assembleDebug
  APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
else
  ./gradlew assembleRelease
  APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
fi
cd "$SCRIPT_DIR"

if [[ -f "$APK_PATH" ]]; then
  APK_ABS_PATH="$(cd "$(dirname "$APK_PATH")" && pwd)/$(basename "$APK_PATH")"
  APK_DIR="$(dirname "$APK_ABS_PATH")"
  echo "==> APK folder: $APK_DIR"
  echo "==> APK file:   $APK_ABS_PATH"
else
  echo "==> Gradle finished but expected APK was not found at $APK_PATH" >&2
  exit 1
fi
