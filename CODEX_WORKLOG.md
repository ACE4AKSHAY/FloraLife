# Codex Worklog

## Branch

- `codex/offline-tflite-debug`

## 2026-03-16

- Reviewed the React, Capacitor, and Android TFLite integration paths.
- Inspected logcat file `C:\Users\aksha\Downloads\Pixel-7-(2)-Android-16_2026-03-15_183305.logcat`.
- Confirmed the first offline scan failure is bridge registration, not model inference:
  - Logcat shows `TFLite error: Error: "TFLite" plugin is not implemented on android`.
  - Capacitor startup logs show built-in plugins registering, but not `TFLite`.
- Root cause found in `MainActivity`:
  - `registerPlugin(TFLitePlugin.class)` was being called after `BridgeActivity` had already loaded plugins.
- Applied fix:
  - Moved custom plugin registration into `load()` so it runs before the Capacitor bridge is created.
- Added extra Android log statements inside `TFLitePlugin` to trace:
  - model/label loading
  - prediction entry
  - prediction completion
  - prediction failures
- Verification:
  - Android Gradle build completed successfully with `.\gradlew.bat :app:assembleDebug`.
- Inspected follow-up logcat file `C:\Users\aksha\Downloads\Pixel-7-(2)-Android-16_2026-03-16_104214.logcat`.
- Confirmed the second offline scan failure is tensor input type mismatch:
  - The custom plugin is now registered and running.
  - The model loads successfully.
  - Inference failed because the model expects `FLOAT32`, while the plugin was sending `UINT8`-compatible byte arrays.
- Applied fix:
  - Updated `TFLitePlugin` to inspect the input tensor type dynamically.
  - If the model expects `FLOAT32`, the image is converted to normalized float values.
  - If the model expects `UINT8`, the existing byte path is still supported.
  - Added logs for model input/output tensor shape and type.
- Verification:
  - Android Gradle build completed successfully again after the Float32 input fix.
