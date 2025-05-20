#!/bin/bash

APK_FILE=$1

if [ -z "$APK_FILE" ]; then
  echo "❌ No APK file provided!"
  exit 1
fi

APK_NAME=$(basename "$APK_FILE" .apk)
APK_PATH="/app/uploads/$APK_FILE"
OUTPUT_DIR="/app/output/$APK_NAME"

mkdir -p "$OUTPUT_DIR"

echo "📦 Decompiling $APK_FILE..."
/opt/jadx/bin/jadx -d "$OUTPUT_DIR" "$APK_PATH"

echo "📁 Generating JSON structure..."
python3 /app/generate_json.py "$OUTPUT_DIR"

echo "✅ Done! Decompiled files and JSON structure are in $OUTPUT_DIR"
