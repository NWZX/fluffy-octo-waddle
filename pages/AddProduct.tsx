import {
    Box,
    HStack,
    Icon,
    IconButton,
    Image,
    Input,
    Pressable,
    Spinner,
    Text,
    VStack
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useNavigation, useRoute } from '@react-navigation/core';
import { IDataProductItem } from '../data/models/IProduct';
import { ProductCol, ShoppingListCol } from '../data/useData';
import { addDoc, doc, Timestamp } from 'firebase/firestore';

type Props = {};

interface IDataItem {
    name: string;
    quantity: number;
    isChecked: boolean;
    id: string;
}

//@ts-ignore
type NavProps = NativeStackNavigationProp<RootStackParamList, 'ListScreen'>;

const AddProduct = ({}: Props): JSX.Element => {
    const navigation = useNavigation<NavProps>();
    const route = useRoute();
    const {
        ShoppingListId,
        title: scanTitle,
        picture: scanPicture,
        ean: scanEan
    } = route.params as {
        ShoppingListId: string;
        title?: string;
        picture?: string;
        ean?: string;
    };

    const [imagePress, setImagePress] = useState(false);
    const [checkPress, setCheckPress] = useState(false);

    const [quantity, setQuantity] = useState(1);
    const [title, setTitle] = useState(scanTitle || '');

    const addProductItem = async (
        item: Partial<IDataProductItem>
    ): Promise<void> => {
        await addDoc(ProductCol, {
            ...item,
            timestamp: Timestamp.now().toMillis()
        });
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Product',
            headerTitleStyle: {
                fontSize: 18,
                fontFamily: 'Roboto'
            },
            headerLeft: () => (
                <IconButton
                    icon={<Icon as={MaterialIcons} name="close" size="sm" />}
                    _pressed={{ borderRadius: 50 }}
                    disabled={checkPress}
                    onPress={() => navigation.pop(2)}
                />
            ),
            headerRight: () =>
                checkPress ? (
                    <Spinner accessibilityLabel="Loading change" />
                ) : (
                    <IconButton
                        icon={
                            <Icon
                                as={MaterialIcons}
                                name="check"
                                size="sm"
                                color={
                                    title.length < 2
                                        ? 'coolGray.200'
                                        : undefined
                                }
                            />
                        }
                        _pressed={{ borderRadius: 50 }}
                        onPress={async () => {
                            await addProductItem({
                                title: title,
                                quantity: quantity,
                                isChecked: false,
                                picture: scanPicture,
                                ean: scanEan || null,
                                refShoppingList: doc(
                                    ShoppingListCol,
                                    ShoppingListId
                                )
                            });
                            navigation.pop(2);
                        }}
                        disabled={title.length < 2}
                    />
                )
        });
    }, [
        ShoppingListId,
        checkPress,
        navigation,
        quantity,
        scanEan,
        scanPicture,
        title
    ]);

    return (
        <>
            <Box
                w={{
                    base: '100%',
                    md: '25%'
                }}
                mt={2}
            >
                <VStack alignItems={'center'}>
                    <Pressable
                        onPressIn={() => {
                            setImagePress(true);
                        }}
                        onPressOut={() => {
                            setImagePress(false);
                        }}
                    >
                        <Image
                            key={scanPicture}
                            source={{
                                uri:
                                    scanPicture ||
                                    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/240px-No_image_available.svg.png'
                            }}
                            alt="Alternate Text"
                            size="lg"
                            borderRadius={5}
                            opacity={imagePress ? 0.7 : 1}
                        />
                    </Pressable>
                    <Input
                        fontSize={18}
                        placeholder="Product Name"
                        borderWidth={0}
                        value={title}
                        onChangeText={(text: string) => setTitle(text)}
                        textAlign={'center'}
                    />
                    <HStack alignItems="center">
                        <IconButton
                            icon={
                                <Icon
                                    as={MaterialIcons}
                                    name="remove"
                                    size="sm"
                                />
                            }
                            _pressed={{ borderRadius: 10 }}
                            onPress={() =>
                                quantity > 1 && setQuantity(quantity - 1)
                            }
                        />
                        <Text fontWeight="bold" fontSize="md" mx={3}>
                            {quantity}
                        </Text>
                        <IconButton
                            icon={
                                <Icon as={MaterialIcons} name="add" size="sm" />
                            }
                            _pressed={{ borderRadius: 10 }}
                            onPress={() =>
                                quantity < 10000 && setQuantity(quantity + 1)
                            }
                        />
                    </HStack>
                </VStack>
            </Box>
        </>
    );
};

export default AddProduct;
