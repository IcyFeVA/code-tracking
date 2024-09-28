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

export default function FilterDietPreference() {
    const { searchFilters, setSearchFilters } = useAppContext();
    const navigation = useNavigation();

    const dietOptions = useMemo(() => getFieldOptions('diet_preference', 'en'), []);

    const handlePress = useCallback((key: number, value: string) => {
        setSearchFilters(prevFilters => ({
            ...prevFilters,
            dietPreference: { key: key.toString(), value }
        }));
        storeData('dietPreference', { key, value })
            .then(() => {
                console.log('dietPreference:', key, value);
                setTimeout(() => navigation.goBack(), 50);
            })
            .catch(error => console.error('Failed to save preference:', error));
    }, [setSearchFilters, navigation]);

    const renderItem = useCallback(({ item }: { item: { key: number; label: string } }) => {
        const isSelected = item.key === searchFilters.dietPreference?.key;
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
    }, [searchFilters.dietPreference, handlePress]);

    return (
        <SafeAreaView style={defaultStyles.SafeAreaView}>
            <View style={defaultStyles.innerContainer}>
                <Text style={defaultStyles.h2}>Diet</Text>
                <Spacer height={8} />
                <Text style={defaultStyles.body}>Select your potential matches diet preference that is in line with you.</Text>
                <Spacer height={48} />
                <FlatList
                    data={dietOptions}
                    renderItem={renderItem}
                    keyExtractor={item => item.key.toString()}
                    extraData={searchFilters.dietPreference}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
}


