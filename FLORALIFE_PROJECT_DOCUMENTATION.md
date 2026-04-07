# FloraLife Project Documentation

## Table of Contents

1. Abstract
2. Introduction
3. Problem Statement
4. Objectives
5. Existing System and Gaps
6. Proposed System
7. System Modules
8. Technology Stack
9. Hardware and Software Requirements
10. Architecture and Data Flow
11. Application Workflow
12. Reminder System
13. AI Scanning System
14. Data Storage and Privacy
15. Project Structure
16. Installation and Execution
17. Testing and Current Working State
18. Branding Replacement Points
19. Limitations
20. Future Enhancements
21. Conclusion
22. References

## 1. Abstract

FloraLife is a plant care and disease support application developed as a final-year academic project. The app helps users track plants, manage reminders, record plant care activity, and scan leaves for disease or health assessment. The application combines a modern React and TypeScript frontend with Capacitor-based Android support. It offers both an online AI diagnosis mode using Gemini and an offline Android-only TensorFlow Lite model for environments where internet access is limited or unavailable.

The project is designed to be practical, presentation-ready, and easy to demonstrate. It stores user plant data locally, supports native reminders on Android, and provides detailed scan output without requiring a backend server. The current version is suitable for academic demonstration and future open-source improvement.

## 2. Introduction

Plant care applications often focus on either reminders or static reference information, but many do not combine tracking, diagnosis support, growth monitoring, and offline usability in a single lightweight mobile app. FloraLife was created to solve that by bringing together daily plant care management and AI-assisted scanning in one interface.

The project began as a Google AI Studio web app and was later adapted into a native Android application with Capacitor. Since then, features such as offline diagnosis, native reminders, growth-stage selection, and improved data handling were added to make the project more complete and more useful for demonstration purposes.

## 3. Problem Statement

Plant owners and students often face these problems:

- They forget watering, feeding, or harvesting schedules.
- They do not maintain a history of plant care.
- They cannot easily identify whether a leaf is healthy or diseased.
- They may not always have internet access for online diagnosis.
- Many simple reminder systems stop working once the app is closed.

FloraLife addresses these issues by combining tracking, reminders, care history, and both online and offline scan support.

## 4. Objectives

The main objectives of FloraLife are:

- To create a simple plant management application for daily use
- To support plant tracking and plant-specific care logs
- To allow scan-based disease support using AI
- To support both online and offline diagnosis modes
- To use native Android reminders that continue after the app is closed
- To keep the project lightweight and easy to demonstrate in a college setting

## 5. Existing System and Gaps

### Existing approach

Typical plant reminder or plant guide apps may provide:

- static care information
- basic reminder options
- internet-only diagnosis tools
- no native offline AI support
- no local-first plant timeline

### Gaps

- reminders may fail when the app is closed
- diagnosis often depends completely on internet access
- many apps do not allow easy care-history tracking
- plant details and growth-stage management are limited
- offline presentation support is weak

## 6. Proposed System

FloraLife introduces a local-first plant care system with a native Android wrapper and multiple functional modules:

- Home dashboard for quick overview
- My Plants area for managing tracked plants
- Plant detail screen for care logs, reminders, photos, and lifecycle view
- Plant library for choosing built-in species or adding custom plants
- Scan screen with online and offline modes
- Guides section for reference browsing
- Shop section for gardening suggestions

The app stores plant data locally, uses Gemini for the primary online scan mode, and uses a custom Android TensorFlow Lite plugin for offline scanning. Native reminders are used instead of web-only polling so notifications can continue after the app closes.

## 7. System Modules

### 7.1 Home

- Displays total plants, active plants, reminders, and harvested plants
- Offers shortcuts to plant library, scan, and guides
- Uses the dashboard counters as quick links into filtered plant lists

### 7.2 My Plants

- Shows all tracked plants
- Opens plant detail view
- Calculates progress based on planting date and duration
- Supports filtered views for all plants, active plants, plants with reminders, and harvested archive

### 7.3 Plant Detail

- Shows plant information and progress
- Records care actions such as watering, feeding, pruning, photo updates, and custom care entries
- Manages reminders
- Displays lifecycle stages and care history

### 7.4 Plant Library

- Contains built-in plant species
- Supports adding custom plants
- Lets the user choose a starting growth stage

### 7.5 Scan

- Online mode uses Gemini
- Offline mode uses TensorFlow Lite on Android
- Returns health assessment, disease name, symptoms, causes, prevention, and suggestions

### 7.6 Guides

- Displays guide content from the built-in species data

### 7.7 Shop

- Displays static product suggestions

## 8. Technology Stack

- Frontend: React 19, TypeScript, Vite
- Styling: Tailwind CSS
- Icons: Lucide React
- Native wrapper: Capacitor
- Android features: Camera, App, Local Notifications
- Online AI: Google Gemini API
- Offline AI: TensorFlow Lite through a custom Capacitor plugin
- Storage: browser/device local storage

## 9. Hardware and Software Requirements

### Software requirements

- Node.js
- npm
- Android Studio
- Java/Gradle environment through Android Studio
- A modern browser for web testing

### Hardware requirements

- A Windows laptop or desktop suitable for Vite and Android Studio
- Android emulator or Android phone for native testing
- Enough storage for the Android project, Gradle cache, and emulator images

## 10. Architecture and Data Flow

### High-level flow

1. The user interacts with the React application.
2. App state is controlled in `App.tsx`.
3. Plant and library data are read from `localStorage` through `storageService`.
4. Scan requests go through either:
   - `geminiService.ts` for online mode
   - `tfliteService.ts` for offline Android mode
5. Reminder data are scheduled through `nativeReminderService.ts`.
6. On Android, the custom TFLite plugin performs model inference and returns a label and confidence.

### Local-first design

- No backend database is required
- Plant data remain on the user device
- Reminders are synchronized with native Android local notifications

## 11. Application Workflow

### Plant tracking workflow

1. Open Plant Library
2. Choose a built-in plant or create a custom plant
3. Select a starting growth stage
4. Add the plant to My Plants
5. Log care actions over time
6. Review lifecycle, photos, and reminders in Plant Detail

### Scan workflow

1. Open Scan
2. Choose Online or Offline mode
3. Capture or upload a leaf image
4. Receive a scan result
5. Review description, confidence, symptoms, causes, recommendations, and prevention steps
6. If a scan is still running, the user can cancel it or confirm before leaving the screen

### Reminder workflow

1. Open a plant detail page
2. Add a reminder
3. Choose one-time, daily, or repeat-every-X-hours
4. Save the reminder
5. Native Android notifications continue even after closing the app

## 12. Reminder System

The reminder system was upgraded from a web-only approach to a native Android approach.

### Supported reminder types

- One-time reminder
- Daily reminder
- Interval reminder with user-defined hours

### Key behavior

- One-time reminders continue re-alerting every 5 minutes until marked done
- Daily reminders repeat at a fixed time
- Interval reminders repeat after the chosen number of hours
- Reminders can be paused, resumed, completed, or deleted

### Native behavior

- The app uses Capacitor Local Notifications
- Reminders continue after the app is closed
- Android notification sound can be changed from system notification settings

## 13. AI Scanning System

### Online scanning

- Primary mode for richer AI-based diagnosis
- Uses Gemini through the Google GenAI package
- Returns structured scan output and recommendations

### Offline scanning

- Runs only on Android through the custom TFLite plugin
- Uses the `model.tflite` and `labels.txt` assets
- Designed for demonstration and no-internet scenarios
- Uses hardcoded result profiles for supported classes so output remains detailed

### Offline model note

The offline classifier currently works with a compact set of trained disease and healthy leaf classes. It is intended for academic demonstration and offline convenience, not for certified agricultural decision-making.

### Presentation note for offline AI

- The most reliable demo images are single-leaf photos that closely resemble the PlantVillage training style
- A presentation guide is available in `OFFLINE_MODEL_SAMPLE_IMAGES.md`
- A local presentation sample pack is included in `presentation/offline-ai-samples/`

## 14. Data Storage and Privacy

FloraLife stores user data locally:

- tracked plants
- reminders
- care logs
- photos stored as base64 data
- local copy of the plant library

This means:

- no user account is required
- no external database is required
- user data stay on the current device/browser unless manually exported in the future

## 15. Project Structure

### Important root files

- `App.tsx`
- `types.ts`
- `constants.tsx`
- `index.html`
- `manifest.json`
- `package.json`
- `vite.config.ts`
- `capacitor.config.ts`

### Important service files

- `services/storageService.ts`
- `services/geminiService.ts`
- `services/tfliteService.ts`
- `services/nativeReminderService.ts`
- `services/offlineDiseaseProfiles.ts`

### Important Android files

- `android/app/src/main/java/com/demo/floralife/MainActivity.java`
- `android/app/src/main/java/com/demo/floralife/TFLitePlugin.java`
- `android/app/src/main/assets/model.tflite`
- `android/app/src/main/assets/labels.txt`
- `android/app/src/main/AndroidManifest.xml`

## 16. Installation and Execution

### Web mode

1. Install dependencies with `npm install`
2. Configure the Gemini API key
3. Run `npm run dev`

### Android mode

1. Build the app with `npm run build`
2. Run `npx cap sync android`
3. Open `android/` in Android Studio
4. Select an emulator or phone
5. Run the app

## 17. Testing and Current Working State

The currently working project state includes:

- working online scan mode
- working offline TensorFlow Lite scan mode on Android
- working native reminders
- working back navigation through the app and Android system back handling
- plant creation with starting growth stage selection
- plant detail custom care entries for medicine or special treatment logging
- Home counter shortcuts that open filtered plant lists
- filtered My Plants view for active, reminder, and harvested archive use
- scan cancel button and leave confirmation while scanning
- live overdue reminder highlighting while the app remains open

### Verification already completed

- TypeScript check passed
- Vite production build passed
- Capacitor Android sync passed
- Android debug build passed
- Offline scan tested successfully on emulator
- Native reminder behavior tested successfully on emulator

## 18. Branding Replacement Points

When the final FloraLife logo and icon are ready, update these places:

### Web and PWA

- `index.html` for the Apple touch icon
- `manifest.json` for the PWA icon entry

### Android launcher icon

- `android/app/src/main/res/mipmap-*`
- `android/app/src/main/res/mipmap-anydpi-v26/*`

### In-app logo placeholder

- `views/Scan.tsx`

## 19. Limitations

- The project is aimed at academic use, not production deployment
- Plant data are stored locally only and do not sync across devices
- Offline scanning is Android-only
- The offline classifier is limited to its trained classes
- No authentication or cloud backup is implemented yet
- Some static content still depends on curated in-app data rather than a backend service

## 20. Future Enhancements

- Final custom logo and launcher icon
- Data export and backup
- Cloud sync or account support
- Better scan history management
- Improved offline model and a larger training set
- A curated built-in offline sample image pack for demo mode
- More advanced custom guide generation
- Better notification controls and reminder categories
- APK release process and formal open-source publishing

## 21. Conclusion

FloraLife successfully combines plant tracking, care logging, AI-assisted scan support, offline diagnosis, and native reminders in one academic project. The project demonstrates how a web app can be extended into a native Android application while still keeping a local-first and lightweight design. In its current form, FloraLife is well suited for final-year project presentation, demonstration, and future open-source improvement.

## 22. References

### Core framework and frontend

- React documentation: https://react.dev/
- TypeScript documentation: https://www.typescriptlang.org/docs/
- Vite guide: https://vite.dev/guide/
- Tailwind CSS documentation: https://tailwindcss.com/docs
- Lucide React documentation: https://lucide.dev/guide/packages/lucide-react

### Capacitor and Android integration

- Capacitor documentation: https://capacitorjs.com/docs
- Capacitor App plugin: https://capacitorjs.com/docs/apis/app
- Capacitor Camera plugin: https://capacitorjs.com/docs/apis/camera
- Capacitor Local Notifications plugin: https://capacitorjs.com/docs/apis/local-notifications
- Capacitor Network plugin: https://capacitorjs.com/docs/apis/network
- Android Studio: https://developer.android.com/studio
- Android alarms and reminders: https://developer.android.com/develop/background-work/services/alarms
- Android exact alarms behavior: https://developer.android.com/about/versions/14/changes/schedule-exact-alarms

### AI and machine learning references

- Gemini API documentation: https://ai.google.dev/gemini-api/docs
- TensorFlow Lite on Android: https://www.tensorflow.org/lite/android
- Offline model asset reference used during development: https://github.com/akshayrana30/plant-disease-detection/tree/master/PlantSaverApp/app/src/main/assets
- PlantVillage dataset mirror used for presentation-aligned samples: https://github.com/spMohanty/PlantVillage-Dataset/tree/master/raw/color

### Project resource references

- Offline sample source manifest: `presentation/offline-ai-samples/sources.csv`
- Offline sample usage guide: `presentation/offline-ai-samples/README.md`
- Offline sample suggestion guide: `OFFLINE_MODEL_SAMPLE_IMAGES.md`
- Technical change log for the Codex work: `CODEX_WORKLOG.md`
