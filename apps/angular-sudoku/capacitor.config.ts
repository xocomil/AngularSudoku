import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.angular-sudoku',
  appName: 'ng-sudoku',
  webDir: '../../dist/apps/angular-sudoku',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
    },
  },
};

export default config;
