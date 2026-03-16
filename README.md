# FloraLife

FloraLife is a local-first plant care app built with React, TypeScript, Vite, and Capacitor for Android. It was originally generated in Google AI Studio and then extended into a native Android project with offline scanning, native reminders, and plant tracking features for a college final-year project.

## Current Scope

- Track plants, care logs, growth stages, and photo history
- Browse a built-in plant library and add custom plants
- Scan plant leaves with:
  - Online Gemini diagnosis when internet is available
  - Offline TensorFlow Lite diagnosis on Android
- Schedule native reminders that continue working after the app is closed
- Use one-time, daily, or repeat-every-X-hours reminders

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Capacitor Android
- Capacitor Camera
- Capacitor App
- Capacitor Local Notifications
- Google Gemini API
- Custom Android TensorFlow Lite plugin

## Project Structure

- `App.tsx`: app shell, tab navigation, refresh flow, Android back handling
- `views/`: screen-level UI such as Home, My Plants, Scan, Guides, Shop, Plant Detail, and Plant Library
- `services/storageService.ts`: local storage layer for plants and library data
- `services/geminiService.ts`: online AI scan and generated plant content
- `services/tfliteService.ts`: offline scan bridge for Android TensorFlow Lite
- `services/nativeReminderService.ts`: native reminder scheduling and sync
- `services/offlineDiseaseProfiles.ts`: hardcoded offline result content for the model classes
- `android/`: Capacitor Android project and custom TFLite plugin

## Running The App

### Web development

1. Install dependencies with `npm install`
2. Provide the Gemini API key in your environment setup
3. Run `npm run dev`

### Android build

1. Build the web app with `npm run build`
2. Sync Capacitor with `npx cap sync android`
3. Open the Android project in Android Studio from `android/`
4. Run the app on an emulator or real device

## Main Functional Areas

### Plant management

- Add plants from the built-in library
- Add custom plant profiles
- Choose a starting growth stage when creating a plant
- Record watering, feeding, pruning, and photo events

### Scanning

- Online scan is the primary diagnosis mode
- Offline scan uses the Android TensorFlow Lite model for no-internet use
- Offline result text is fully hardcoded in the app for presentation-friendly output

### Reminders

- Native Android reminders are used instead of web-only polling
- One-time reminders can continue re-alerting every 5 minutes until marked done
- Daily and interval reminders can stay active without recreating them

## Branding Replacement Points

When you create the final logo and icon, update these places:

- Web app icon: `index.html`
- PWA icon: `manifest.json`
- Android launcher icons: `android/app/src/main/res/mipmap-*`
- Android adaptive icon config: `android/app/src/main/res/mipmap-anydpi-v26/*`
- In-app placeholder logo icon: `views/Scan.tsx`

## Documentation Files

- `README.md`: GitHub-friendly overview
- `FLORALIFE_PROJECT_DOCUMENTATION.md`: full project write-up and usage guide
- `OFFLINE_MODEL_SAMPLE_IMAGES.md`: sample image suggestions for the offline model classes
- `CODEX_WORKLOG.md`: technical change log during Codex work

## Notes

- This project is currently aimed at academic use, not production use.
- User data is stored locally on the device/browser through local storage.
- The offline model is intended for presentation support and no-internet usage, not medical or agricultural certification.
