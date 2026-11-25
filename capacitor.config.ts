import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'me.andrew.strelchenko.todo',
  appName: 'Todo',
  webDir: 'www',
  android: {
    includePlugins: [
      '@aparajita/capacitor-biometric-auth',
      '@capacitor-community/speech-recognition',
      '@capacitor/action-sheet',
      '@capacitor/app',
      '@capacitor/camera',
      '@capacitor/haptics',
      '@capacitor/keyboard',
      '@capacitor/network',
      '@capacitor/status-bar',
    ],
  },
  experimental: {
    ios: {
      spm: {
        swiftToolsVersion: '6.1',
        packageTraits: {
          '@capacitor-firebase/authentication': ['Google'],
        },
      },
    },
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ['google.com'],
    },
  },
};

export default config;
