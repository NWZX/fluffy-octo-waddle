import {
    Box,
    HStack,
    Icon,
    IconButton,
    Input,
    IPressableProps,
    Pressable,
    Text,
    VStack
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';

interface Props extends IPressableProps {}

const ListAddItem = (props: Props): JSX.Element => {
    return (
        <Pressable {...props}>
            {({ isHovered, isFocused, isPressed }) => {
                return (
                    <Box
                        _dark={{
                            borderColor: 'gray.600'
                        }}
                        shadow="0"
                        backgroundColor={
                            isPressed
                                ? 'coolGray.400'
                                : isHovered
                                ? 'coolGray.300'
                                : 'coolGray.200'
                        }
                        borderRadius={5}
                        px="5"
                        py="2"
                        my="2"
                        mx="3%"
                    >
                        <HStack space={4} justifyContent="center">
                            <Input
                                w="100%"
                                placeholder="List Name"
                                fontWeight="bold"
                                fontSize="xl"
                            />
                        </HStack>
                    </Box>
                );
            }}
        </Pressable>
    );
};

export default ListAddItem;
