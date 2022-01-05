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
import React, { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ListProduct from '../components/ListProduct';
import { RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/core';

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

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Search Product',
            headerShown: false
        });
    }, [navigation]);

    const [data, setData] = useState<IDataItem[]>([
        {
            name: 'Lait',
            quantity: 6,
            isChecked: false,
            id: '0'
        },
        {
            name: 'Nutella',
            quantity: 2,
            isChecked: false,
            id: '1'
        },
        {
            name: 'Nesquick',
            quantity: 5,
            isChecked: true,
            id: '2'
        }
    ]);

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
                            placeholder="Product"
                        />
                    </Box>
                </HStack>

                <FlatList
                    data={data}
                    renderItem={({ item: listItem }) => {
                        return (
                            <Pressable
                                onLongPress={() => {
                                    navigation.navigate('EditProduct');
                                }}
                            >
                                {({ isHovered, isFocused, isPressed }) => {
                                    return (
                                        <ListProduct
                                            pirmaryText={listItem.name}
                                            secondaryText={`Quantity : ${listItem.quantity}`}
                                            isChecked={listItem.isChecked}
                                            isPressed={isPressed}
                                        />
                                    );
                                }}
                            </Pressable>
                        );
                    }}
                    keyExtractor={(item) => item.id}
                    // onLeftAction={(key, dataI) => {
                    //     const index = data.findIndex((x) => x.id === key);
                    //     const cpData = data;
                    //     cpData[index].isChecked = !cpData[index].isChecked;
                    //     setData(cpData);
                    // }}
                />
            </Box>
        </>
    );
};

export default SearchProduct;
