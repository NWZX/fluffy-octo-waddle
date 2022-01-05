import { ExpoConfig, ConfigContext } from '@expo/config';
import 'dotenv/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'Waddle',
    slug: 'waddle',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff'
    },
    updates: {
        fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ['**/*'],
    ios: {
        buildNumber: '1.0.0',
        supportsTablet: true
    },
    android: {
        package: 'com.nwzx.waddle',
        versionCode: 1,
        adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#FFFFFF'
        }
    },
    web: {
        favicon: './assets/favicon.png'
    },
    extra: {
        gatewayAPI: '',
        firebaseConfig: process.env.FIREBASE_CONFIG || '{}'
    }
});
