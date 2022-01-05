import { ExpoConfig, ConfigContext } from '@expo/config';
import 'dotenv/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'Sheddle',
    slug: 'sheddle',
    scheme: 'sheddle',
    version: '1.0.1',
    orientation: 'portrait',
    icon: './assets/maskable_icon_alpha.png',
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
        buildNumber: '1.0.1',
        supportsTablet: true
    },
    android: {
        package: 'com.nwzx.sheddle',
        versionCode: 2,
        adaptiveIcon: {
            foregroundImage: './assets/maskable_icon_alpha.png',
            backgroundColor: '#FFFFFF'
        }
    },
    web: {
        favicon: './assets/favicon.png'
    },
    extra: {
        gatewayAPI: '',
        firebaseConfig: process.env.FIREBASE_CONFIG || '{}',
        AlgoliaId: process.env.ALGOLIA_APP_ID || '{}',
        AlgoliaKey: process.env.ALGOLIA_SEARCH_KEY || '{}'
    }
});
