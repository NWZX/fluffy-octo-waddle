/**
 * Long Press Icon Button Component
 */

import { IconButton, IIconButtonProps } from 'native-base';
import React, { useEffect, useState } from 'react';

interface Props extends IIconButtonProps {
    onCountChange: () => void;
}

const LPIconButton = ({ onCountChange, ...props }: Props): JSX.Element => {
    const [isPressed, setIsPressed] = useState(false);

    useEffect(() => {
        if (isPressed) {
            setTimeout(() => {
                onCountChange();
            }, 10);
        }
    }, [isPressed, onCountChange]);

    const onPressIn = (): void => {
        setIsPressed(true);
    };
    const onPressOut = (): void => {
        setIsPressed(false);
    };

    return (
        <IconButton {...props} onPressIn={onPressIn} onPressOut={onPressOut} />
    );
};

export default LPIconButton;
