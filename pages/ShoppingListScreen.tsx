import { Box, Fab, FlatList, Icon, IconButton, Pressable } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import ListItem from '../components/ListItem';
import { RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/core';
import { useImmer } from 'use-immer';

import {
    setDoc,
    doc,
    addDoc,
    Timestamp,
    query,
    where
} from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { IDataShoppingListItem } from '../data/models/IShoppingList';
import { firestore, ShoppingListCol } from '../data/useData';
import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

type Props = {};

//@ts-ignore
type NavProps = NativeStackNavigationProp<RootStackParamList, 'ShoppingList'>;

const ShoppingListScreen = (props: Props): JSX.Element => {
    const navigation = useNavigation<NavProps>();
    const { platformId } = useAppContext();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Waddle',
            headerTitleStyle: {
                fontSize: 18,
                fontFamily: 'Roboto'
            }
        });
    }, [navigation]);

    console.log(platformId);

    const [snapshot, loading] = useCollectionData<IDataShoppingListItem>(
        platformId
            ? query(
                  ShoppingListCol,
                  where('allowedDeviceIds', 'array-contains', platformId)
              )
            : undefined,
        {
            idField: 'id'
        }
    );

    const [data, setData] = useImmer<Map<string, boolean>>(new Map());

    useEffect((): void => {
        if (snapshot) {
            setData((draft) => {
                snapshot.forEach((n) => {
                    draft.set(n.id, false);
                });
            });
        }
    }, [setData, snapshot]);

    const buttonAction = (
        shoppingListId: string,
        ShoppingListTitle: string
    ): void => {
        //@ts-ignore
        navigation.navigate('ShoppingListProduct', {
            ShoppingListId: shoppingListId,
            ShoppingListTitle: ShoppingListTitle
        });
    };

    const addListItem = async (
        item: Partial<IDataShoppingListItem>
    ): Promise<void> => {
        await addDoc(ShoppingListCol, {
            ...item,
            timestamp: Timestamp.now().toMillis()
        });
    };
    const renameListItem = async (id: string, title: string): Promise<void> => {
        await setDoc(
            doc(ShoppingListCol, id),
            {
                title: title
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
                    renderItem={({ item }: { item: IDataShoppingListItem }) => {
                        const missingItems =
                            item.productQuantity - item.productValidated;
                        const status = missingItems > 1 ? 2 : missingItems;
                        return (
                            <Pressable
                                onPress={() =>
                                    buttonAction(item.id, item.title)
                                }
                                delayLongPress={300}
                                onLongPress={() => {
                                    setData((draft) => {
                                        draft.set(item.id, true);
                                    });
                                }}
                            >
                                {({ isHovered, isFocused, isPressed }) => {
                                    return (
                                        <ListItem
                                            pirmaryText={item.title}
                                            secondaryText={
                                                missingItems
                                                    ? `🛒 Missing ${missingItems} items`
                                                    : 'Complete✨'
                                            }
                                            status={status}
                                            isHovered={isHovered}
                                            isPressed={isPressed}
                                            isEdit={data.get(item.id)}
                                            onEdited={async (text) => {
                                                console.log('Edited');
                                                await renameListItem(
                                                    item.id,
                                                    text
                                                );
                                                setData((draft) => {
                                                    draft.set(item.id, false);
                                                });
                                            }}
                                        />
                                    );
                                }}
                            </Pressable>
                        );
                    }}
                    keyExtractor={(item) => item.id}
                />
            </Box>
            <Box position="absolute" w="100%" bottom={0}>
                <Fab
                    placement="bottom-right"
                    renderInPortal={false}
                    size="sm"
                    icon={
                        <Icon
                            color="white"
                            as={MaterialIcons}
                            name="add"
                            size="sm"
                            onPress={() =>
                                addListItem({
                                    title: '',
                                    productQuantity: 0,
                                    productValidated: 0
                                })
                            }
                        />
                    }
                />
            </Box>
        </>
    );
};

// Color Switch Component
// function ToggleDarkMode() {
//     const { colorMode, toggleColorMode } = useColorMode();
//     return (
//         <HStack space={2} alignItems="center">
//             <Text>Dark</Text>
//             <Switch
//                 isChecked={colorMode === 'light' ? true : false}
//                 onToggle={toggleColorMode}
//                 aria-label={
//                     colorMode === 'light'
//                         ? 'switch to dark mode'
//                         : 'switch to light mode'
//                 }
//             />
//             <Text>Light</Text>
//         </HStack>
//     );
// }

export default ShoppingListScreen;
