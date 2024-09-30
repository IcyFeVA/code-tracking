import React, { useCallback } from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import { RadioButton } from "react-native-ui-lib";
import { SafeAreaView } from 'react-native-safe-area-context';
import { storeData } from '@/utils/storage';
import { Colors } from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import Spacer from "@/components/Spacer";
import { useAppContext } from '@/providers/AppProvider';
import { useNavigation } from '@react-navigation/native'

type ItemData = {
    id: string;
    value: string;
};

const DATA: ItemData[] = [
    { id: '1', value: 'Aries' },
    { id: '2', value: 'Taurus' },
    { id: '3', value: 'Gemini' },
    { id: '4', value: 'Cancer' },
    { id: '5', value: 'Leo' },
    { id: '6', value: 'Virgo' },
    { id: '7', value: 'Libra' },
    { id: '8', value: 'Scorpio' },
    { id: '9', value: 'Sagittarius' },
    { id: '10', value: 'Capricorn' },
    { id: '11', value: 'Aquarius' },
    { id: '12', value: 'Pisces' },
];

export default function FilterStarSign() {
    const { searchFilters, setSearchFilters } = useAppContext();
    const navigation = useNavigation();

    const handlePress = useCallback((id: string, value: string) => {
        setSearchFilters(prevFilters => ({
            ...prevFilters,
            starSignPreference: { id, value }
        }));
        storeData('filter_zodiac_sign', { id, value })
            .then(() => {
                console.log('filter_zodiac_sign:', id, value);
                setTimeout(() => navigation.goBack(), 50);
            })
            .catch(error => console.error('Failed to save star sign preference:', error));
    }, [setSearchFilters]);

    const renderItem = useCallback(({ item }: { item: typeof DATA[0] }) => {
        const color = item.id === searchFilters.filter_zodiac_sign?.id ? Colors.light.text : Colors.light.tertiary;

        return (
            <RadioButton
                label={item.value}
                size={20}
                color={color}
                contentOnLeft
                containerStyle={[defaultStyles.radioButton, { borderColor: color }]}
                labelStyle={defaultStyles.radioButtonLabel}
                selected={searchFilters.filter_zodiac_sign?.id === item.id || false}
                onPress={() => handlePress(item.id, item.value)}
                accessibilityLabel={`Select ${item.value}`}
            />
        );
    }, [searchFilters.filter_zodiac_sign, handlePress]);

    return (
        <SafeAreaView style={defaultStyles.SafeAreaView}>
            <View style={defaultStyles.innerContainer}>
                <Text style={defaultStyles.h2}>Star Sign Preference</Text>
                <Spacer height={8} />
                <Text style={defaultStyles.body}>Select your preferred zodiac sign for potential matches.</Text>
                <Spacer height={48} />
                <FlatList
                    data={DATA}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    extraData={searchFilters.filter_zodiac_sign}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
}

// ... styles remain the same ...

const styles = StyleSheet.create({
    bottomSheet: {
        padding: 16,
    },
    bottomSheetListItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: Colors.light.tertiary,
        borderWidth: 1,
        borderRadius: 0,
        borderTopWidth: 0,
        backgroundColor: Colors.light.background,
    },
    bottomSheetListItemInner: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    listItemLabel: {
        fontFamily: 'BodySemiBold',
        fontSize: 16,
        paddingHorizontal: 16,
    },
    firstItem: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderTopWidth: 1,

    },
    lastItem: {
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        borderTopWidth: 0,
    },
    active: {
        color: Colors.light.primary,
    },



});
