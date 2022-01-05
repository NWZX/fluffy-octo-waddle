import {
    Box,
    Button,
    Fab,
    FlatList,
    HStack,
    Icon,
    IconButton,
    Input,
    Pressable,
    Text,
    VStack
} from 'native-base';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ListProduct from '../components/ListProduct';
import { RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/core';

import algoliasearch from 'algoliasearch/lite';
import { IDataProductItemAlgolia } from '../data/models/IProduct';
import { AlgoliaConfig, ProductCol } from '../data/useData';
import { doc, setDoc } from 'firebase/firestore';

type Props = {};

interface IDataItem {
    name: string;
    quantity: number;
    isChecked: boolean;
    id: string;
}

//@ts-ignore
type NavProps = NativeStackNavigationProp<RootStackParamList, 'SearchProduct'>;

const SearchProduct = ({}: Props): JSX.Element => {
    const navigation = useNavigation<NavProps>();
    const [result, setResult] = useState<IDataProductItemAlgolia[]>();
    const [search, setSearch] = useState<string>('');

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Search Product',
            headerShown: false
        });
    }, [navigation]);

    useEffect(() => {
        if (search.length > 0 && search.length % 2 === 0) {
            const searchClient = algoliasearch(
                AlgoliaConfig.id,
                AlgoliaConfig.key
            );
            const index = searchClient.initIndex('dev_waddle');
            index
                .search<IDataProductItemAlgolia>(search, {
                    hitsPerPage: 10
                })
                .then((v) => {
                    setResult(v.hits);
                });
        }
    }, [search]);

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
                mt={8}
            >
                <HStack space={2} mx="3%">
                    <Box w="100%">
                        <Input
                            w="100%"
                            borderRadius={50}
                            backgroundColor={'blue.50'}
                            borderWidth={0}
                            fontSize={16}
                            fontFamily={'Roboto'}
                            InputLeftElement={
                                <Icon
                                    as={MaterialIcons}
                                    name="arrow-back"
                                    size="sm"
                                    ml="2"
                                    onPress={() => navigation.goBack()}
                                />
                            }
                            onChangeText={(text): void => {
                                setSearch(text);
                            }}
                            placeholder="Product"
                        />
                    </Box>
                </HStack>

                <FlatList
                    data={result}
                    renderItem={({
                        item
                    }: {
                        item: IDataProductItemAlgolia;
                    }) => {
                        return (
                            <Pressable
                                key={item.ObjectID}
                                delayLongPress={300}
                                onPress={() =>
                                    toggleCheckProduct(
                                        item.ObjectID,
                                        item.isChecked
                                    )
                                }
                                onLongPress={() => {
                                    //@ts-ignore
                                    navigation.navigate('EditProduct', {
                                        ProductId: item.ObjectID
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

export default SearchProduct;
