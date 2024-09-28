import React, { useCallback, useState, useEffect } from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import { Button, Checkbox } from "react-native-ui-lib";
import { SafeAreaView } from 'react-native-safe-area-context';
import { storeData, getData } from '@/utils/storage';
import { Colors } from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import Spacer from "@/components/Spacer";
import { useAppContext } from '@/providers/AppProvider';
import { useNavigation } from '@react-navigation/native'

type ItemData = {
    id: string;
    title: string;
};

const DATA: ItemData[] = [
    { id: '1', title: 'Male' },
    { id: '2', title: 'Female' },
    { id: '3', title: 'Male (Transgender)' },
    { id: '4', title: 'Female (Transgender)' },
    { id: '5', title: 'Non-binary' },
    { id: '6', title: 'Genderqueer' },
    { id: '7', title: 'Genderfluid' },
    { id: '8', title: 'Agender' },
    { id: '9', title: 'Two-Spirit' },
];

export default function FilterGenderPreference() {
    const { searchFilters, setSearchFilters } = useAppContext();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const navigation = useNavigation();

    useEffect(() => {
        const getSelectedItems = async () => {
            const storedPreference = await getData('genderPreference');
            if (storedPreference && storedPreference.value) {
                setSelectedItems(storedPreference.value);
            }
        };
        getSelectedItems();
    }, []);

    const handlePress = useCallback((itemTitle: string) => {
        setSelectedItems(prevSelectedItems => {
            if (prevSelectedItems.includes(itemTitle)) {
                return prevSelectedItems.filter(title => title !== itemTitle);
            } else {
                return [...prevSelectedItems, itemTitle];
            }
        });
    }, []);

    const handleSave = useCallback(() => {
        setSearchFilters(prevFilters => ({
            ...prevFilters,
            genderPreference: { key: '', value: selectedItems }
        }));
        storeData('genderPreference', { key: '', value: selectedItems })
            .then(() => {
                console.log('genderPreference:', selectedItems);
                setTimeout(() => navigation.goBack(), 50);
            })
            .catch(error => console.error('Failed to save gender preference:', error));
    }, [selectedItems, setSearchFilters]);

    const renderItem = useCallback(({ item }: { item: typeof DATA[0] }) => {
        const isSelected = selectedItems.includes(item.title);
        const color = isSelected ? Colors.light.text : Colors.light.tertiary;

        return (
            <Checkbox
                label={item.title}
                size={24}
                color={color}
                contentOnLeft
                containerStyle={[defaultStyles.checkboxButton, { borderColor: color }]}
                labelStyle={defaultStyles.checkboxButtonLabel}
                value={isSelected}
                onValueChange={() => handlePress(item.title)}
                accessibilityLabel={`Select ${item.title}`}
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
        borderTopWidth: 0,
        padding: 16,
        borderRadius: 8,
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
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderTopWidth: 1,

    },
    lastItem: {
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        borderTopWidth: 0,
    },
    active: {
        color: Colors.light.primary,
    },
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: 'grey',
    },



});



