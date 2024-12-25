import React, { useCallback, useState, useEffect } from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import { Button, Checkbox } from "react-native-ui-lib";
import { SafeAreaView } from 'react-native-safe-area-context';
import { storeData, getData } from '@/utils/storage';
import { Colors } from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import Spacer from "@/components/Spacer";
import { useAppContext } from '@/providers/AppProvider';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ItemData = {
    id: string;
    value: string;
};

const DATA: ItemData[] = [
    { id: '1', value: 'Male' },
    { id: '2', value: 'Female' },
    { id: '3', value: 'Male (Transgender)' },
    { id: '4', value: 'Female (Transgender)' },
    { id: '5', value: 'Non-binary' },
    { id: '6', value: 'Genderqueer' },
    { id: '7', value: 'Genderfluid' },
    { id: '8', value: 'Agender' },
    { id: '9', value: 'Two-Spirit' },
];

export default function FilterGenderPreference() {
    const { searchFilters, setSearchFilters } = useAppContext();
    const [selectedItems, setSelectedItems] = useState<{id: string, value: string}[]>([]);
    const navigation = useNavigation();

    // Load saved preferences
    useEffect(() => {
        const getSelectedItems = async () => {
            const storedPreference = await getData('filter_genderPreference');
            console.log(storedPreference)
            setSelectedItems(storedPreference || []);
        };
        getSelectedItems();
    }, []);

    // Handle selecting/deselecting an item
    const handlePress = useCallback((item: ItemData) => {
        setSelectedItems(prevSelectedItems => {
            const isAlreadySelected = prevSelectedItems.some(selected => selected.id === item.id);
            if (isAlreadySelected) {
                return prevSelectedItems.filter(selected => selected.id !== item.id);
            } else {
                return [...prevSelectedItems, item];
            }
        });
    }, []);

    // Save the selected items to storage
    const handleSave = useCallback(() => {
        setSearchFilters(prevFilters => ({
            ...prevFilters,
            filter_genderPreference: selectedItems
        }));

        storeData('filter_genderPreference', selectedItems)
            .then(() => {
                console.log('filter_genderPreference:', selectedItems);
                setTimeout(() => navigation.goBack(), 50);
            })
            .catch(error => console.error('Failed to save gender preference:', error));
    }, [selectedItems, setSearchFilters]);

    // Render each item with a Checkbox
    const renderItem = useCallback(({ item }: { item: ItemData }) => {
        const isSelected = selectedItems.some(selected => selected.id === item.id);
        const color = isSelected ? Colors.light.text : Colors.light.tertiary;

        return (
            <Checkbox
                label={item.value}
                size={24}
                color={color}
                contentOnLeft
                containerStyle={[defaultStyles.checkboxButton, { borderColor: color }]}
                labelStyle={defaultStyles.checkboxButtonLabel}
                value={isSelected}
                onValueChange={() => handlePress(item)}
                accessibilityLabel={`Select ${item.value}`}
            />
        );
    }, [selectedItems, handlePress]);

    return (
        <SafeAreaView style={defaultStyles.SafeAreaView}>
            <View style={defaultStyles.innerContainer}>
                <Text style={defaultStyles.h2}>Gender preference</Text>
                <Spacer height={8} />
                <Text style={defaultStyles.body}>Select one or more gender preferences.</Text>
                <Spacer height={48} />
                <FlatList
                    data={DATA}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    extraData={selectedItems}
                    showsVerticalScrollIndicator={false}
                />
                <Spacer height={48} />
                <Button
                    label="Save"
                    onPress={handleSave}
                    style={[defaultStyles.button, defaultStyles.buttonShadow]}
                    labelStyle={defaultStyles.buttonLabel}
                />
            </View>
        </SafeAreaView>
    );
}
