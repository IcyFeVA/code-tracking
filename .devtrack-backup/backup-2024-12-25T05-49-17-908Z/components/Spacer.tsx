import React from 'react';
import { View } from 'react-native';

type SpacerProps = {
    height: number;
};

const Spacer: React.FC<SpacerProps> = ({ height, width }) => {
  return <View style={{ height, width }} />;
};

export default Spacer;
