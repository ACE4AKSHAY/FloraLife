# FloraLife APK Release Guide

## Goal

This guide is for sharing FloraLife on GitHub and preparing APK builds without exposing a developer Gemini API key.

## API Key Policy

- Do not commit a real Gemini API key to the repository.
- Use `.env.local` only for private local builds.
- `.env.local` is ignored by Git.
- For public APK sharing, the safest option is to build the app without a bundled developer key and let each user add their own personal Gemini key inside the app.

## Why This Matters

FloraLife uses Gemini directly from the client app for online AI. That means:

- A key kept in `.env.local` will stay out of GitHub if you do not commit it.
- But if you build a public APK with a developer key inside it, that key can still be extracted from the app bundle.
- For a fully protected key, a backend proxy would be needed in the future.

## Developer Setup

1. Copy `.env.example` to `.env.local`
2. Add your Gemini key:

```env
VITE_GEMINI_API_KEY=your_key_here
```

3. Build the web app:

```powershell
npm run build:web
```

4. Sync Android:

```powershell
npm run sync:android
```

## User Setup Inside The App

- Open `Scan`
- Switch to `Online AI`
- Tap `Add Personal Key`
- Paste a Gemini API key
- Tap `Save Key`

The personal key is stored only on that device in local storage. It is not pushed to GitHub by FloraLife.

## Build Commands

### Debug APK

```powershell
npm run apk:debug
```

Expected output:

- `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK

```powershell
npm run apk:release
```

Expected output:

- `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## Recommended Public GitHub Flow

If you want to upload FloraLife publicly on GitHub:

- Keep the repo without any real Gemini key
- Keep `.env.local` private on your machine
- Share the source code freely
- Let users add their own personal Gemini key inside the app if they want Online AI
- Offline AI and the rest of the app can still work without bundling your developer key

## Signed Release Later

When you want a proper signed APK later:

1. Open the Android project in Android Studio
2. Use `Build > Generate Signed Bundle / APK`
3. Create or choose a keystore
4. Build the signed release APK

For now, the unsigned release build is enough for preparation and testing.
