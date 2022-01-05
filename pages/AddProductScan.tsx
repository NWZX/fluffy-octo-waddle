import { Center, Icon, IconButton, Text } from 'native-base';
import { StyleSheet } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useNavigation, useRoute } from '@react-navigation/core';
import { BarCodeScanningResult, Camera } from 'expo-camera';
import { fetchGetJSON } from '../data/api-helpers';
import { BarCodeScanner } from 'expo-barcode-scanner';
import {
    clearOpenFoodData,
    IOpenFoodProduct
} from '../data/models/IOpenFoodProduct';

type Props = {};

interface IDataItem {
    name: string;
    quantity: number;
    isChecked: boolean;
    id: string;
}

const StateIcon = ({ state }: { state: -1 | 0 | 1 }): JSX.Element => {
    if (state === 0)
        return (
            <Icon
                name="progress-check"
                as={MaterialCommunityIcons}
                size="5xl"
                color="white"
            />
        );
    else if (state === 1)
        return (
            <Icon
                name="check-circle-outline"
                as={MaterialIcons}
                size="5xl"
                color="white"
            />
        );
    else if (state === -1)
        return (
            <Icon
                name="close-circle-outline"
                as={MaterialCommunityIcons}
                size="5xl"
                color="white"
            />
        );
    else return <></>;
};

//@ts-ignore
type NavProps = NativeStackNavigationProp<RootStackParamList, 'ListScreen'>;

const AddProductScan = ({}: Props): JSX.Element => {
    const navigation = useNavigation<NavProps>();
    const route = useRoute();
    const { ShoppingListId } = route.params as { ShoppingListId: string };

    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [stateIconStatus, setStateIconStatus] = useState<-1 | 0 | 1>(0);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            //@ts-ignore
            setHasPermission(status === 'granted');
        })();
    }, []);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Scan',
            headerTitleStyle: {
                fontSize: 18,
                fontFamily: 'Roboto'
            },
            headerLeft: () => (
                <IconButton
                    icon={<Icon as={MaterialIcons} name="close" size="sm" />}
                    _pressed={{ borderRadius: 50 }}
                    disabled={scanned}
                    onPress={() => navigation.goBack()}
                />
            ),
            headerRight: () => (
                <IconButton
                    icon={
                        <Icon
                            as={MaterialIcons}
                            name="edit"
                            size="sm"
                            color={scanned ? 'coolGray.200' : undefined}
                        />
                    }
                    _pressed={{ borderRadius: 50 }}
                    onPress={async () => {
                        //@ts-ignore
                        navigation.navigate('AddProduct', {
                            ShoppingListId: ShoppingListId
                        });
                    }}
                    disabled={scanned}
                />
            )
        });
    }, [ShoppingListId, scanned, navigation]);

    const handleBarCodeScanned = async (
        scanningResult: BarCodeScanningResult
    ): Promise<void> => {
        setScanned(true);
        try {
            const result = await fetchGetJSON<IOpenFoodProduct>(
                `https://world.openfoodfacts.org/api/v2/product/${scanningResult.data}`
            );
            const clearResult = clearOpenFoodData(result);
            console.log(clearResult);
            setStateIconStatus(1);
            setTimeout(() => {
                setScanned(false);
                //@ts-ignore
                navigation.navigate('AddProduct', {
                    ShoppingListId: ShoppingListId,
                    title: clearResult.title,
                    picture: clearResult.picture,
                    ean: clearResult.ean
                });
            }, 1000);
        } catch (error) {
            setStateIconStatus(-1);
            setTimeout(() => {
                setScanned(false);
                navigation.goBack();
            }, 1000);
        }
    };
    console.log(scanned);

    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <>
            <Camera
                type={Camera.Constants.Type.back}
                ratio="16:9"
                style={StyleSheet.absoluteFillObject}
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                barCodeScannerSettings={{
                    barCodeTypes: [
                        BarCodeScanner.Constants.BarCodeType.ean13,
                        BarCodeScanner.Constants.BarCodeType.ean8
                    ]
                }}
            />
            <Center position={'absolute'} h={'100%'} w={'100%'}>
                {scanned && <StateIcon state={stateIconStatus} />}
            </Center>
        </>
    );
};

export default AddProductScan;
