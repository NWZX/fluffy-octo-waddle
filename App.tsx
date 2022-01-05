import AppLoading from 'expo-app-loading';

import React from 'react';
import { IconButton, NativeBaseProvider } from 'native-base';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { getApps, initializeApp } from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import ShoppingListScreen from './pages/ShoppingListScreen';
import ShoppingListProductScreen from './pages/ShoppingListProductScreen';
import SearchProduct from './pages/SearchProductScreen';
import EditProduct from './pages/EditProduct';
import AddProduct from './pages/AddProduct';
import { enableMapSet } from 'immer';
import { LogBox } from 'react-native';
import AddProductScan from './pages/AddProductScan';
import { AppContextProvider } from './context/AppContext';
enableMapSet();

LogBox.ignoreAllLogs(true);

export type RootStackParamList = {
    ShoppingList: undefined;
    ShoppingListProduct: undefined;
    SearchProduct: undefined;
    EditProduct: undefined;
    AddProductScan: undefined;
    AddProduct: undefined;
};

const App = (): JSX.Element => {
    const buttonAction = (): void => {};
    const Stack = createNativeStackNavigator<RootStackParamList>();

    return (
        <AppContextProvider>
            <NativeBaseProvider>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen
                            name="ShoppingList"
                            component={ShoppingListScreen}
                            options={{
                                headerTitleAlign: 'center'
                            }}
                        />
                        <Stack.Screen
                            name="ShoppingListProduct"
                            component={ShoppingListProductScreen}
                            options={{
                                headerTitleAlign: 'left'
                            }}
                        />
                        <Stack.Screen
                            name="SearchProduct"
                            component={SearchProduct}
                            options={{
                                headerTitleAlign: 'left'
                            }}
                        />
                        <Stack.Screen
                            name="EditProduct"
                            component={EditProduct}
                            options={{
                                headerTitleAlign: 'center'
                            }}
                        />
                        <Stack.Screen
                            name="AddProductScan"
                            component={AddProductScan}
                            options={{
                                headerTitleAlign: 'center'
                            }}
                        />
                        <Stack.Screen
                            name="AddProduct"
                            component={AddProduct}
                            options={{
                                headerTitleAlign: 'center'
                            }}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </NativeBaseProvider>
        </AppContextProvider>
    );
};

export default App;
