import {
    Box,
    HStack,
    Icon,
    IconButton,
    Input,
    Text,
    VStack
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import React, { InputHTMLAttributes, useRef, useState } from 'react';
import { ColorType } from 'native-base/lib/typescript/components/types';

interface Props {
    pirmaryText: string;
    secondaryText?: string;
    status?: 0 | 1 | 2 | number;
    isHovered?: boolean;
    isFocused?: boolean;
    isPressed?: boolean;
    isEdit?: boolean;
    onEdited?: (text: string) => void;
}

const ListItem = ({
    isHovered,
    isPressed,
    isEdit,
    onEdited,
    pirmaryText,
    secondaryText,
    status
}: Props): JSX.Element => {
    let secondaryColor: ColorType = 'black';
    switch (status) {
        case 0:
            secondaryColor = 'lime.700';
            break;
        case 1:
            secondaryColor = 'amber.500';
            break;
        case 2:
            secondaryColor = 'red.600';
            break;

        default:
            secondaryColor = 'gray.500';
            break;
    }

    const ref = useRef<HTMLInputElement>(null);
    React.useEffect(() => {
        if (isEdit) {
            ref.current?.focus();
        }
    }, [isEdit]);

    const [title, setTitle] = useState(pirmaryText);

    return (
        <Box
            _dark={{
                borderColor: 'gray.600'
            }}
            backgroundColor={isPressed ? 'coolGray.300' : 'coolGray.200'}
            borderRadius={5}
            borderColor={isPressed ? 'coolGray.200' : 'coolGray.300'}
            borderWidth={1}
            px="5"
            py="4"
            my="2"
            mx="3%"
        >
            <HStack space={4} justifyContent="space-between">
                <VStack space={0}>
                    <Input
                        ref={ref}
                        p={0}
                        value={title}
                        fontWeight="semibold"
                        fontSize="xl"
                        autoCorrect={false}
                        onChangeText={(text): void => {
                            setTitle(text);
                        }}
                        onSubmitEditing={(e) =>
                            onEdited && onEdited(e.nativeEvent.text)
                        }
                        borderWidth={0}
                        isReadOnly={!isEdit}
                    />
                    <Text
                        fontWeight="light"
                        fontSize="xs"
                        fontFamily="Roboto"
                        color={secondaryColor}
                    >
                        {secondaryText}
                    </Text>
                </VStack>
                <HStack>
                    <IconButton
                        icon={
                            <Icon
                                as={MaterialIcons}
                                name={isEdit ? 'mode-edit' : 'share'}
                                size="md"
                            />
                        }
                        _pressed={{ borderRadius: 50 }}
                    />
                </HStack>
            </HStack>
        </Box>
    );
};

export default ListItem;
