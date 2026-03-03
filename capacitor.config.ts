import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.courseschedule',
  appName: '课程表',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      signingType: 'apks',
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FEF7FF',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    CapacitorUpdater: {
      autoUpdate: false,
    }
  }
};

export default config;