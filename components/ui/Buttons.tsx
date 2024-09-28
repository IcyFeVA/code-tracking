
import { Text, Button } from 'react-native-ui-lib';
import { styled } from 'nativewind';

const PrimaryButton = styled(Button, 'w-full h-12 rounded-lg justify-center bg-primary-600 border-2 border-primary-400 shadow active:shadow-none');
const PrimaryButtonText = styled(Text, 'uppercase text-center text-white font-bold');

const SecondaryButton = styled(Button, 'w-full h-12 rounded-lg justify-center bg-white border-2 border-primary-200 shadow active:shadow-none');
const SecondaryButtonText = styled(Text, 'uppercase text-center text-primary-700 font-bold');


export { PrimaryButton, PrimaryButtonText, SecondaryButton, SecondaryButtonText }