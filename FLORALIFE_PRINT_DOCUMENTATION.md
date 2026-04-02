# FloraLife

## Compact Project Documentation

### Print Details

- Student Name: [Add before print]
- Hall Ticket / Roll Number: [Add before print]
- Department / College: [Add before print]
- Guide / Supervisor: [Add before print]

### Project Type

Final-year academic project for plant care management, offline diagnosis support, and native reminder scheduling.

### Abstract

FloraLife is a local-first plant care application built for academic demonstration using React, TypeScript, Vite, and Capacitor. The system helps users track plants, record plant care activity, maintain reminder schedules, and scan leaves for disease or health assessment. It combines an online Gemini-based diagnosis mode with an offline Android TensorFlow Lite model so the project can still be demonstrated when internet access is not available. The application stores user data locally, supports native Android reminders after the app is closed, and presents structured results in a simple mobile interface.

### Problem Statement

Many plant care apps focus only on reminders or static care information. They usually do not combine plant tracking, care history, native reminders, and offline disease support in one lightweight system. In many cases, reminders stop working after the app closes, and diagnosis depends completely on internet access. FloraLife was developed to solve these practical gaps in a compact and presentation-friendly form.

### Objectives

- Build a simple mobile-friendly plant management application
- Let users track plants and their growth progress
- Record care activity such as watering, feeding, pruning, photos, and custom medicine actions
- Support both online and offline plant diagnosis
- Use native reminders that continue after the app is closed
- Keep the project lightweight enough for final-year demonstration and printing

### Existing System

The common existing approach in small plant apps includes static care information, basic reminders, and limited logging support. Many reminder systems rely on web timers, which stop when the app is closed. Many diagnosis tools also require internet access and cannot be demonstrated properly in offline situations. These limits make such systems less useful in real classroom demonstrations.

### Proposed System

FloraLife provides a combined solution with the following modules:

- Home dashboard with shortcuts and counts
- My Plants section with active, reminder-based, and harvested filters
- Plant Detail view with care logs, lifecycle, reminders, and photo history
- Plant Library with built-in species and custom plant support
- Online AI scan using Gemini
- Offline AI scan using a TensorFlow Lite model on Android
- Native reminder system using Android local notifications

The project follows a local-first design. Plant data, reminder data, care logs, and images are stored on the device through local storage. Native reminder schedules are synchronized through Capacitor Local Notifications.

### Technology Stack

- Frontend: React 19, TypeScript, Vite
- Styling: Tailwind CSS
- Native wrapper: Capacitor
- Android features: Camera, App, Local Notifications
- Online AI: Google Gemini API
- Offline AI: TensorFlow Lite through a custom Android Capacitor plugin
- Persistence: local storage

### System Workflow

#### Plant management workflow

1. The user opens the plant library.
2. A plant is selected from the built-in library or created as a custom plant.
3. A starting growth stage can be selected.
4. The plant is added to My Plants.
5. The user records watering, feeding, pruning, photos, reminders, or custom care entries.

#### Scan workflow

1. The user opens the Scan screen.
2. Online AI or Offline AI mode is selected.
3. A leaf image is captured or uploaded.
4. The app analyzes the image.
5. The result shows health status, disease name, confidence, and treatment guidance.

#### Reminder workflow

1. The user opens a plant detail page.
2. A reminder is created as one-time, daily, or interval-based.
3. The reminder is saved natively on Android.
4. The notification can still appear even when the app is closed.

### Key Features Implemented

- Plant tracking with growth progress
- Plant photo journal
- Lifecycle view and care history
- Custom care entry for medicine or special treatment
- Native reminders with repeat support
- One-time reminders that re-alert every 5 minutes until completed
- Home dashboard counters that open filtered plant lists
- Offline scan result profiles for presentation-friendly output
- Sample offline demo image pack for safer presentation

### Offline AI Note

The offline TensorFlow Lite model is intended for academic demonstration and offline use, not for production diagnosis. It performs best when given a single clear leaf image that closely matches its trained classes. A curated demo image pack is included in `presentation/offline-ai-samples/` for presentation use.

### Current Working State

The current FloraLife build includes:

- working online scan mode
- working offline scan mode on Android
- working native reminders
- working Android and in-app back navigation
- filtered plant lists from Home shortcuts
- custom care logging
- scan cancel and scan-leave confirmation
- presentation sample images for offline AI

### Limitations

- The project is intended for academic use, not production deployment
- Data stays on the current device and does not sync across devices
- Offline AI works only on Android
- The offline model is limited to its trained classes
- No login, cloud backup, or admin panel is included

### Future Scope

- Final branding, logo, and launcher icon
- Cloud backup or export support
- Improved scan history and reporting
- Larger offline dataset and model improvement
- More advanced guide content and analytics
- Open-source publishing and wider device testing

### Conclusion

FloraLife successfully combines plant management, care logging, AI-assisted scanning, offline diagnosis support, and native reminders in one academic project. It is practical to demonstrate, simple enough to print as a compact project document, and flexible enough for future open-source improvement.

### References

- Google Gemini API documentation
- Capacitor App plugin
- Capacitor Local Notifications plugin
- Capacitor Camera plugin
- TensorFlow Lite Android integration
- PlantVillage-style class dataset used for offline-model-aligned presentation samples
