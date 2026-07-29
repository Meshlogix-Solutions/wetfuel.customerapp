#!/usr/bin/env bash
# Builds the WetFuel Customer Android APK end to end with production web settings:
#   ng build --configuration production -> cap sync android -> Gradle APK
#
# Run from anywhere:
#   bash wetfuel.customerapp/build-apk.sh          # installable debug APK
#   bash wetfuel.customerapp/build-apk.sh release  # release APK; signing config required
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BUILD_TYPE="${1:-debug}"
if [[ "$BUILD_TYPE" != "debug" && "$BUILD_TYPE" != "release" ]]; then
  echo "Usage: $0 [debug|release]" >&2
  exit 1
fi

# Capacitor Android requires JDK 21. Match the driver-app build setup when that portable
# JDK is present, while still allowing JAVA_HOME from the caller on other machines.
PORTABLE_JDK="C:/build-tools/jdk-21.0.11+10"
if [[ -d "$PORTABLE_JDK" ]]; then
  export JAVA_HOME="$PORTABLE_JDK"
fi

echo "==> Building Angular app with production settings..."
npx ng build --configuration production

echo "==> Syncing production web assets and plugins into Android..."
npx cap sync android

echo "==> Building the $BUILD_TYPE APK..."
cd android
if [[ "$BUILD_TYPE" == "debug" ]]; then
  ./gradlew.bat assembleDebug
  APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
else
  ./gradlew.bat assembleRelease
  if [[ -f "app/build/outputs/apk/release/app-release.apk" ]]; then
    APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
  else
    APK_PATH="android/app/build/outputs/apk/release/app-release-unsigned.apk"
  fi
fi
cd "$SCRIPT_DIR"

if [[ ! -f "$APK_PATH" ]]; then
  echo "Build finished but the APK wasn't found at the expected path: $APK_PATH" >&2
  exit 1
fi

echo ""
echo "==> APK ready: $SCRIPT_DIR/$APK_PATH"
ls -la "$APK_PATH"
