import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Checkbox } from 'react-native-ui-lib';
import { Colors } from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import hobbiesInterests from '@/constants/Interests';
import Spacer from '@/components/Spacer';

const StepInterests = ({ onInterestsSelected }) => {
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const flattenedInterests = React.useMemo(() => hobbiesInterests.flat(), []);

    const handleInterestToggle = useCallback((interest: string) => {
        setSelectedInterests(prevInterests => {
            if (prevInterests.includes(interest)) {
                return prevInterests.filter(i => i !== interest);
            } else {
                return [...prevInterests, interest];
            }
        });
    }, []);

    useEffect(() => {
        onInterestsSelected(selectedInterests);
    }, [selectedInterests, onInterestsSelected]);

    const renderItem = useCallback(({ item }) => (
        <Pressable onPress={() => handleInterestToggle(item.value)}>
            <Checkbox
                color={selectedInterests.includes(item.value) ? Colors.light.text : Colors.light.tertiary}
                label={item.label}
                value={selectedInterests.includes(item.value)}
                containerStyle={[defaultStyles.checkboxButton, { borderColor: selectedInterests.includes(item.value) ? Colors.light.text : Colors.light.tertiary }]}
                labelStyle={defaultStyles.checkboxButtonLabel}
                onValueChange={() => handleInterestToggle(item.value)}
            />
        </Pressable>
    ), [selectedInterests, handleInterestToggle]);

    return (
        <View style={styles.container}>
            <Text style={defaultStyles.h2}>Interests ({selectedInterests.length})</Text>
            <Spacer height={8} />
            <Text style={defaultStyles.body}>
                This helps us find people with the same hobbies and interests.
            </Text>
            <Spacer height={24} />
            <FlashList
                data={flattenedInterests}
                renderItem={renderItem}
                estimatedItemSize={75}
                keyExtractor={(item) => item.value}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    listContainer: {
        paddingBottom: 16,
    },
});

export default StepInterests;