// Get the imports
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as Linking from 'expo-linking';
//import * as WebBrowser from 'expo-web-browser';

import { getApps, initializeApp } from 'firebase/app';
import {
    getFirestore,
    CollectionReference,
    collection,
    DocumentData
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const AlgoliaConfig = {
    id: Constants.manifest?.extra?.AlgoliaId as string,
    key: Constants.manifest?.extra?.AlgoliaKey as string
};

// Init the firebase app
const firebaseConfig = Constants.manifest?.extra?.firebaseConfig;
if (getApps().length === 0) initializeApp(JSON.parse(firebaseConfig));

// Export firestore incase we need to access it directly
export const firestore = getFirestore();
export const functions = getFunctions();

// This is just a helper to add the type to the db responses
const typedCollection = <T = DocumentData>(
    collectionName: string
): CollectionReference<T> => {
    return collection(firestore, collectionName) as CollectionReference<T>;
};

// Import all your model types

import { IDataShoppingListItem } from './models/IShoppingList';
import { IDataProductItem } from './models/IProduct';
import { Platform } from 'react-native';

// Export all your collections

/**
 * Shopping list collection
 */
export const ShoppingListCol =
    typedCollection<IDataShoppingListItem>('shoppingLists');

/**
 * Product collection
 */
export const ProductCol = typedCollection<IDataProductItem>('products');

export const getPlatformId = async (): Promise<string | undefined> => {
    if (Platform.OS === 'android') {
        return Application.androidId || undefined;
    } else if (Platform.OS === 'ios') {
        return (await Application.getIosIdForVendorAsync()) || undefined;
    } else {
        return undefined;
    }
};

//Http Function

const getShareLink = httpsCallable<
    { id: string },
    { code: number; message: string; data: any }
>(functions, 'getShareLink');
export const generateShareLink = async (shoppingListId: string) => {
    try {
        const result = await getShareLink({ id: shoppingListId });
        console.log(result.data);
        return result.data;
    } catch (error: any) {
        console.log(error.message);
        return { code: 500, message: error.message, data: null };
    }
};

const accessShare = httpsCallable<
    {
        id: string;
        platformId?: string;
    },
    { code: number; message: string }
>(functions, 'accessShare');
export const handleRedirect = async (
    event: Linking.EventType,
    url?: string
): Promise<void> => {
    let data = Linking.parse(event.url);
    console.log(data);
    if (data.path === 'openShare' && data.queryParams?.id) {
        try {
            const platformId = await getPlatformId();
            const result = await accessShare({
                id: data.queryParams.id,
                platformId: platformId
            });
            console.log(result.data);
        } catch (error: any) {
            console.log(error.message);
        }
    }
};
