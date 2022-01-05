import {
    Box,
    Button,
    Center,
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
import React, { useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useNavigation, useRoute } from '@react-navigation/core';

import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { IDataProductItem } from '../data/models/IProduct';
import { ProductCol } from '../data/useData';
import LPIconButton from '../components/LPIconButton';

type Props = {};

interface IDataItem {
    name: string;
    quantity: number;
    isChecked: boolean;
    id: string;
}

//@ts-ignore
type NavProps = NativeStackNavigationProp<RootStackParamList, 'ListScreen'>;

const EditProduct = ({}: Props): JSX.Element => {
    const navigation = useNavigation<NavProps>();
    const route = useRoute();
    const { ProductId } = route.params as { ProductId: string };

    const [snapshot, loading] = useDocumentDataOnce<IDataProductItem>(
        ProductId ? doc(ProductCol, ProductId) : undefined,
        {
            idField: 'id'
        }
    );

    const [imagePress, setImagePress] = useState(false);
    const [checkPress, setCheckPress] = useState(false);
    const [deletePress, setDeletePress] = useState(false);

    const [quantity, setQuantity] = useState(1);
    const [title, setTitle] = useState('');

    const editProductItem = async (
        item: Partial<IDataProductItem>
    ): Promise<void> => {
        await setDoc(
            doc(ProductCol, item.id),
            {
                title: item.title,
                quantity: item.quantity
            },
            { merge: true }
        );
    };

    useEffect(() => {
        if (snapshot) {
            setTitle(snapshot.title);
            setQuantity(snapshot.quantity);
        }
    }, [snapshot]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Edit',
            headerTitleStyle: {
                fontSize: 18,
                fontFamily: 'Roboto'
            },
            headerLeft: () => (
                <IconButton
                    icon={<Icon as={MaterialIcons} name="close" size="sm" />}
                    _pressed={{ borderRadius: 50 }}
                    disabled={checkPress}
                    onPress={() => navigation.goBack()}
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
                            setCheckPress(true);
                            await editProductItem({
                                id: ProductId,
                                title: title,
                                quantity: quantity
                            });
                            navigation.goBack();
                        }}
                        disabled={title.length < 2}
                    />
                )
        });
    }, [ProductId, checkPress, navigation, quantity, title]);

    return loading ? (
        <Center h="100%">
            <Spinner accessibilityLabel="Loading posts" size="lg" />
        </Center>
    ) : (
        <>
            <Box
                w={{
                    base: '100%',
                    md: '25%'
                }}
                mt={2}
            >
                <VStack alignItems={'center'} space={2}>
                    <Pressable
                        onPressIn={() => {
                            setImagePress(true);
                        }}
                        onPressOut={() => {
                            setImagePress(false);
                        }}
                    >
                        <Image
                            key={snapshot?.picture}
                            source={{
                                uri:
                                    snapshot?.picture ||
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
                        placeholder=""
                        borderWidth={0}
                        value={title}
                        onChangeText={(text: string) => setTitle(text)}
                        textAlign={'center'}
                    />
                    <HStack alignItems="center">
                        <LPIconButton
                            icon={
                                <Icon
                                    as={MaterialIcons}
                                    name="remove"
                                    size="sm"
                                />
                            }
                            _pressed={{ borderRadius: 10 }}
                            onCountChange={() =>
                                quantity > 1 && setQuantity(quantity - 1)
                            }
                        />
                        <Text fontWeight="bold" fontSize="md" mx={3}>
                            {quantity}
                        </Text>
                        <LPIconButton
                            icon={
                                <Icon as={MaterialIcons} name="add" size="sm" />
                            }
                            _pressed={{ borderRadius: 10 }}
                            onCountChange={() =>
                                quantity < 10000 && setQuantity(quantity + 1)
                            }
                        />
                    </HStack>
                </VStack>
            </Box>
            <Box position="absolute" w="100%" bottom={0}>
                <Button
                    onPress={async () => {
                        setDeletePress(true);
                        await deleteDoc(doc(ProductCol, ProductId));
                        navigation.goBack();
                    }}
                    position={'absolute'}
                    w="60%"
                    left={'20%'}
                    bottom={4}
                    backgroundColor={'red.500'}
                    disabled={checkPress || deletePress}
                    leftIcon={
                        deletePress ? (
                            <Spinner accessibilityLabel="Loading change" />
                        ) : (
                            <Icon as={MaterialIcons} name="delete" size="sm" />
                        )
                    }
                >
                    Remove
                </Button>
            </Box>
        </>
    );
};

export default EditProduct;
