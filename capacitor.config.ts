import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.courseschedule',
  appName: '课程表',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FEF7FF',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    }
  }
};

export default config;