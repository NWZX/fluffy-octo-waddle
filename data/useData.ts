// Get the imports
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    CollectionReference,
    collection,
    DocumentData
} from 'firebase/firestore';

// Init the firebase app
const firebaseConfig = Constants.manifest?.extra?.firebaseConfig;
export const firebaseApp = initializeApp(JSON.parse(firebaseConfig));

// Export firestore incase we need to access it directly
export const firestore = getFirestore();
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
