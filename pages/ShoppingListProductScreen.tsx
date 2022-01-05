import {
    Box,
    Fab,
    FlatList,
    Icon,
    IconButton,
    Pressable,
    VStack
} from 'native-base';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ListProduct from '../components/ListProduct';
import { RootStackParamList } from '../App';
import { useNavigation, useRoute } from '@react-navigation/core';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import { IDataProductItem } from '../data/models/IProduct';
import { ProductCol, ShoppingListCol } from '../data/useData';
import { doc, query, setDoc, where } from 'firebase/firestore';

type Props = {};

interface IDataItem {
    name: string;
    quantity: number;
    isChecked: boolean;
    id: string;
}

//@ts-ignore
type NavProps = NativeStackNavigationProp<
    RootStackParamList,
    'ShoppingListProduct'
>;

const ShoppingListProductScreen = ({}: Props): JSX.Element => {
    const navigation = useNavigation<NavProps>();
    const route = useRoute();
    const { ShoppingListId, ShoppingListTitle } = route.params as {
        ShoppingListId: string;
        ShoppingListTitle: string;
    };

    const [snapshot, loading] = useCollectionData<IDataProductItem>(
        query(
            ProductCol,
            where('refShoppingList', '==', doc(ShoppingListCol, ShoppingListId))
        ),
        {
            idField: 'id'
        }
    );

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: ShoppingListTitle,
            headerTitleStyle: {
                fontSize: 18,
                fontFamily: 'Roboto'
            },
            headerLeft: () => (
                <IconButton
                    icon={
                        <Icon as={MaterialIcons} name="arrow-back" size="sm" />
                    }
                    _pressed={{ borderRadius: 50 }}
                    onPress={() => navigation.goBack()}
                />
            ),
            headerRight: () => (
                <>
                    <IconButton
                        icon={
                            <Icon as={MaterialIcons} name="search" size="sm" />
                        }
                        onPress={() => navigation.navigate('SearchProduct')}
                    />
                    <IconButton
                        icon={
                            <Icon
                                as={MaterialCommunityIcons}
                                name="barcode-scan"
                                size="sm"
                            />
                        }
                        onPress={() => {
                            //@ts-ignore
                            navigation.navigate('AddProductScan', {
                                ShoppingListId: ShoppingListId
                            });
                        }}
                    />
                </>
            )
        });
    }, [ShoppingListId, ShoppingListTitle, navigation]);

    const toggleCheckProduct = async (
        id: string,
        currentState: boolean
    ): Promise<void> => {
        await setDoc(
            doc(ProductCol, id),
            {
                isChecked: !currentState
            },
            { merge: true }
        );
    };

    return (
        <>
            <Box
                w={{
                    base: '100%',
                    md: '25%'
                }}
                mt={2}
            >
                <FlatList
                    data={snapshot}
                    renderItem={({ item }: { item: IDataProductItem }) => {
                        return (
                            <Pressable
                                key={item.id}
                                delayLongPress={300}
                                onPress={() =>
                                    toggleCheckProduct(item.id, item.isChecked)
                                }
                                onLongPress={() => {
                                    //@ts-ignore
                                    navigation.navigate('EditProduct', {
                                        ProductId: item.id
                                    });
                                }}
                            >
                                {({ isHovered, isFocused, isPressed }) => {
                                    return (
                                        <ListProduct
                                            pirmaryText={`${item.title}`}
                                            secondaryText={`Quantity : ${item.quantity}`}
                                            picture={item.picture}
                                            isChecked={item.isChecked}
                                            isPressed={isPressed}
                                        />
                                    );
                                }}
                            </Pressable>
                        );
                    }}
                    keyExtractor={(item) => item.id}
                />
            </Box>
        </>
    );
};

export default ShoppingListProductScreen;
