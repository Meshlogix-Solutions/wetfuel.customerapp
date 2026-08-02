import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.wetfuel.customer',
  appName: 'WetFuel Customer',
  webDir: 'www/browser',
  plugins: {
    FirebaseMessaging: {
      presentationOptions: ['alert', 'badge', 'sound']
    }
  }
};
export default config;
