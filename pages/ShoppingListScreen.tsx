import * as Clipboard from 'expo-clipboard';
import { useAssets } from 'expo-asset';
import {
    Box,
    Fab,
    FlatList,
    Icon,
    Image,
    Pressable,
    useToast
} from 'native-base';
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
    where,
    arrayRemove
} from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { IDataShoppingListItem } from '../data/models/IShoppingList';
import { generateShareLink, ShoppingListCol } from '../data/useData';
import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const LogoTitle = (): JSX.Element | null => {
    const [assets, error] = useAssets([require('../assets/favicon.png')]);
    return assets ? (
        <Image width="50px" height="50px" source={{ uri: assets[0].uri }} />
    ) : null;
};

type Props = {};

//@ts-ignore
type NavProps = NativeStackNavigationProp<RootStackParamList, 'ShoppingList'>;

const ShoppingListScreen = (props: Props): JSX.Element => {
    const navigation = useNavigation<NavProps>();
    const toast = useToast();
    const { platformId } = useAppContext();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => <LogoTitle />,
            headerTitleStyle: {
                fontSize: 18,
                fontFamily: 'Roboto'
            }
        });
    }, [navigation]);

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
    const [newList, setNewList] = useState<IDataShoppingListItem | undefined>();

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
            allowedDeviceIds: [platformId],
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
                    data={
                        snapshot
                            ? newList
                                ? [newList, ...snapshot]
                                : snapshot
                            : []
                    }
                    renderItem={({ item }: { item: IDataShoppingListItem }) => {
                        if (item.id === 'fresh-item') {
                            return (
                                <ListItem
                                    key={item.id}
                                    pirmaryText={''}
                                    isEdit={true}
                                    onDelete={async () => {
                                        setNewList(undefined);
                                    }}
                                    onEdited={async (text) => {
                                        setNewList(undefined);
                                        if (text.length > 0) {
                                            await addListItem({
                                                title: text,
                                                productQuantity: 0,
                                                productValidated: 0
                                            });
                                            setNewList(undefined);
                                        }
                                    }}
                                />
                            );
                        }
                        const missingItems =
                            item.productQuantity - item.productValidated;
                        const status = missingItems > 1 ? 2 : missingItems;
                        return (
                            <Pressable
                                key={item.id}
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
                                            onShare={async () => {
                                                const linkData =
                                                    await generateShareLink(
                                                        item.id
                                                    );
                                                const link =
                                                    linkData.data?.linkUrl;
                                                Clipboard.setString(link);
                                                toast.show({
                                                    description:
                                                        'Copy to clipboard'
                                                });
                                            }}
                                            onDelete={async () => {
                                                setDoc(
                                                    doc(
                                                        ShoppingListCol,
                                                        item.id
                                                    ),
                                                    {
                                                        allowedDeviceIds:
                                                            arrayRemove(
                                                                platformId
                                                            )
                                                    },
                                                    { merge: true }
                                                );
                                            }}
                                            onEdited={async (text) => {
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
                                setNewList({
                                    id: 'fresh-item',
                                    title: '',
                                    productQuantity: 0,
                                    productValidated: 0,
                                    timestamp: 0,
                                    allowedDeviceIds: []
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
