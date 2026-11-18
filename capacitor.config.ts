import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pawspot.tracker',
  appName: 'Paws & Pots',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#f1f5f9',
  },
  plugins: {
    SystemBars: {
      insetsHandling: 'native',
    },
  },
};

export default config;
