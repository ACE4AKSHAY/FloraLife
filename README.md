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

## API Key Setup

### For developers

- Keep real Gemini keys only in `.env.local`
- Do not commit `.env.local` to GitHub
- Use `.env.example` as the template
- Add your private key like this:

```env
VITE_GEMINI_API_KEY=your_key_here
```

### For project members and users

- FloraLife now supports a personal Gemini key saved only on the current device
- Open `Scan`
- Switch to `Online AI`
- Tap `Add Personal Key`
- Paste the key and save it

If no Gemini key is available, Online AI will stay unavailable, but Offline AI and the rest of the app can still be used.

### Important security note

- A key inside `.env.local` stays out of GitHub if you do not commit it
- But any key bundled into a public APK or web build can still be extracted
- For public releases, it is safer to ship the app without a developer key and let each user add their own personal key
- A future backend proxy is the correct long-term solution if you want to fully protect a shared project key

## Main Functional Areas

### Plant management

- Add plants from the built-in library
- Add custom plant profiles
- Choose a starting growth stage when creating a plant
- Record watering, feeding, pruning, photo events, and custom care entries such as medicine or special treatment
- Use Home dashboard counters as shortcuts into filtered plant lists
- Keep harvested plants in a simple archive for review and presentation

### Scanning

- Online scan is the primary diagnosis mode
- Offline scan uses the Android TensorFlow Lite model for no-internet use
- Offline result text is fully hardcoded in the app for presentation-friendly output
- Running scans can be canceled directly from the scan screen
- Leaving the scan screen during an active scan now asks for confirmation instead of silently stopping

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
- `FLORALIFE_PRINT_DOCUMENTATION.md`: shorter print-friendly project document
- `APK_RELEASE_GUIDE.md`: GitHub-safe APK and API key guide
- `.env.example`: template for private developer Gemini key setup
- `OFFLINE_MODEL_SAMPLE_IMAGES.md`: sample image suggestions for the offline model classes
- `presentation/offline-ai-samples/`: included presentation image pack for the offline model
- `CODEX_WORKLOG.md`: technical change log during Codex work

## APK Release Prep

- Debug APK: `npm run apk:debug`
- Release APK: `npm run apk:release`
- Release prep guide: `APK_RELEASE_GUIDE.md`

For team sharing through GitHub, the recommended flow is:

- keep the repo public/private without any real Gemini key
- let teammates use `.env.local` for private local builds
- or let them save a personal Gemini key directly inside the app
- avoid distributing a public APK that contains your own developer key

## Notes

- This project is currently aimed at academic use, not production use.
- User data is stored locally on the device/browser through local storage.
- The offline model is intended for presentation support and no-internet usage, not medical or agricultural certification.

## References And Resources

- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/docs/
- Vite: https://vite.dev/guide/
- Tailwind CSS: https://tailwindcss.com/docs
- Capacitor: https://capacitorjs.com/docs
- Capacitor App plugin: https://capacitorjs.com/docs/apis/app
- Capacitor Camera plugin: https://capacitorjs.com/docs/apis/camera
- Capacitor Local Notifications plugin: https://capacitorjs.com/docs/apis/local-notifications
- Gemini API docs: https://ai.google.dev/gemini-api/docs
- TensorFlow Lite on Android: https://www.tensorflow.org/lite/android
- Offline model asset reference: https://github.com/akshayrana30/plant-disease-detection/tree/master/PlantSaverApp/app/src/main/assets
- PlantVillage dataset mirror: https://github.com/spMohanty/PlantVillage-Dataset/tree/master/raw/color
- Local sample-source manifest: `presentation/offline-ai-samples/sources.csv`
