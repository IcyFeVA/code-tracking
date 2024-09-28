import React from 'react';
import { View } from 'react-native';

type SpacerProps = {
    height: number;
};

const Spacer: React.FC<SpacerProps> = ({ height }) => {
    return (
        <View style={{ height }} />
    );
};

export default Spacer;
