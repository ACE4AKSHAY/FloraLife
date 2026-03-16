/// <reference types="@capacitor/app" />
/// <reference types="@capacitor/local-notifications" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.demo.floralife',
  appName: 'FloraLife',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
