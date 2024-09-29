import React, { useCallback, useMemo } from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import { RadioButton } from "react-native-ui-lib";
import { SafeAreaView } from 'react-native-safe-area-context';
import { storeData } from '@/utils/storage';
import { Colors } from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import Spacer from "@/components/Spacer";
import { useAppContext } from '@/providers/AppProvider';
import { useNavigation } from '@react-navigation/native';
import { getFieldOptions } from '@/lang/profile_details';

export default function FilterCannabisFrequency() {
    const { searchFilters, setSearchFilters } = useAppContext();
    const navigation = useNavigation();

    const cannabisOptions = useMemo(() => getFieldOptions('cannabis_use', 'en'), []);

    const handlePress = useCallback((key: number, value: string) => {
        setSearchFilters(prevFilters => ({
            ...prevFilters,
            cannabisFrequency: { key: key.toString(), value }
        }));
        storeData('cannabisFrequency', { key, value })
            .then(() => {
                console.log('cannabisFrequency:', key, value);
                setTimeout(() => navigation.goBack(), 50);
            })
            .catch(error => console.error('Failed to save preference:', error));
    }, [setSearchFilters, navigation]);

    const renderItem = useCallback(({ item }: { item: { key: number; label: string } }) => {
        const isSelected = item.key === searchFilters.cannabisFrequency?.key;
        const color = isSelected ? Colors.light.text : Colors.light.tertiary;

        return (
            <RadioButton
                label={item.label}
                size={20}
                color={color}
                contentOnLeft
                containerStyle={[defaultStyles.radioButton, { borderColor: color }]}
                labelStyle={defaultStyles.radioButtonLabel}
                selected={isSelected}
                onPress={() => handlePress(item.key, item.label)}
                accessibilityLabel={`Select ${item.label}`}
            />
        );
    }, [searchFilters.cannabisFrequency, handlePress]);

    return (
        <SafeAreaView style={defaultStyles.SafeAreaView}>
            <View style={defaultStyles.innerContainer}>
                <Text style={defaultStyles.h2}>Cannabis Frequency</Text>
                <Spacer height={8} />
                <Text style={defaultStyles.body}>Select how much Cannabis your potential matches are allowed to put in their blood stream.</Text>
                <Spacer height={48} />
                <FlatList
                    data={cannabisOptions}
                    renderItem={renderItem}
                    keyExtractor={item => item.key.toString()}
                    extraData={searchFilters.cannabisFrequency}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
}


