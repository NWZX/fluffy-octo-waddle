import {
    Box,
    HStack,
    Icon,
    IconButton,
    Image,
    Text,
    VStack
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';

interface Props {
    pirmaryText: string;
    secondaryText?: string;
    picture?: string;
    isChecked?: boolean;
    isHovered?: boolean;
    isFocused?: boolean;
    isPressed?: boolean;
}

const ListProduct = ({
    isPressed,
    pirmaryText,
    secondaryText,
    picture,
    isChecked
}: Props): JSX.Element => {
    const colorSelector = [
        ['coolGray.200', 'coolGray.300'],
        ['green.400', 'green.500']
    ];

    return (
        <Box
            _dark={{
                borderColor: 'gray.600'
            }}
            backgroundColor={
                colorSelector[Number(isChecked)][Number(isPressed)]
            }
            borderRadius={5}
            borderWidth={1}
            borderColor={colorSelector[Number(isChecked)][Number(!isPressed)]}
            px="5"
            py="3"
            my="2"
            mx="3%"
        >
            <HStack space={2} justifyContent="flex-start">
                <Image
                    source={{
                        uri: picture
                            ? picture
                            : 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/240px-No_image_available.svg.png'
                    }}
                    alt="Alternate Text"
                    size="sm"
                    borderRadius={5}
                />
                <VStack space={0} w={'80%'}>
                    <Text
                        fontWeight="semibold"
                        fontSize="lg"
                        fontFamily="Roboto"
                        noOfLines={2}
                    >
                        {pirmaryText}
                    </Text>
                    <Text
                        fontWeight="light"
                        fontSize="xs"
                        fontFamily="Roboto"
                        color={isPressed ? 'gray.700' : 'gray.500'}
                    >
                        {secondaryText}
                    </Text>
                </VStack>
            </HStack>
        </Box>
    );
};

export default ListProduct;
