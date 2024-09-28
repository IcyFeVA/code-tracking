import React, { useState, useCallback, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storeData } from '@/utils/storage';
import { Colors } from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import Spacer from "@/components/Spacer";
import { Button, Slider } from 'react-native-ui-lib';
import { useAppContext } from '@/providers/AppProvider';
import { useNavigation } from '@react-navigation/native';

const MIN_AGE = 18;
const MAX_AGE = 100;

export default function FilterAgeRange() {
    const { searchFilters, setSearchFilters } = useAppContext();
    const [localMinAge, setLocalMinAge] = useState(searchFilters?.ageRange?.min ?? MIN_AGE);
    const [localMaxAge, setLocalMaxAge] = useState(searchFilters?.ageRange?.max ?? MAX_AGE);
    const navigation = useNavigation();

    useEffect(() => {
        if (searchFilters?.ageRange.min && searchFilters?.ageRange.max) {
            const validMinAge = Math.max(MIN_AGE, Math.min(searchFilters.ageRange.min, MAX_AGE));
            const validMaxAge = Math.max(validMinAge, Math.min(searchFilters.ageRange.max, MAX_AGE));
            setLocalMinAge(validMinAge);
            setLocalMaxAge(validMaxAge);
        }
    }, [searchFilters]);

    const handleSliderChange = useCallback((value: any) => {
        setLocalMinAge(value.min);
        setLocalMaxAge(value.max);
        setSearchFilters(prevFilters => ({
            ...prevFilters,
            ageRange: {
                min: value.min,
                max: value.max
            }
        }));
    }, [localMinAge, localMaxAge]);

    const handleSave = useCallback(() => {
        const ageRangeValue = `${localMinAge}-${localMaxAge}`;
        storeData('ageRange', { min: localMinAge, max: localMaxAge })
            .then(() => {
                console.log('ageRange:', ageRangeValue);
                navigation.goBack();
            })
            .catch(error => console.error('Failed to save age range:', error));
    }, [localMinAge, localMaxAge]);

    return (
        <SafeAreaView style={defaultStyles.SafeAreaView}>
            <View style={[defaultStyles.innerContainer, { justifyContent: 'space-between' }]}>
                <View>
                    <Text style={defaultStyles.h2}>Age Range</Text>
                    <Spacer height={8} />
                    <Text style={defaultStyles.body}>Set your preferred age range for potential matches.</Text>
                    <Spacer height={48} />
                    <Text style={styles.label}>Age Range: {Math.round(localMinAge)} - {Math.round(localMaxAge)}</Text>
                    <Slider
                        useRange
                        initialMinimumValue={localMinAge}
                        initialMaximumValue={localMaxAge}
                        minimumValue={MIN_AGE}
                        maximumValue={MAX_AGE}
                        onRangeChange={(value) => handleSliderChange(value)}
                        step={2}
                        containerStyle={styles.slider}
                        thumbStyle={styles.thumbStyle}
                        thumbTintColor={Colors.light.accent}
                        minimumTrackTintColor={Colors.light.accent}
                        maximumTrackTintColor={Colors.light.tertiary}

                    />
                </View>

                <View>
                    <Spacer height={48} />
                    <Button
                        label="Save"
                        onPress={handleSave}
                        style={[defaultStyles.button, defaultStyles.buttonShadow]}
                        labelStyle={defaultStyles.buttonLabel}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    label: {
        ...defaultStyles.body,
        marginBottom: 8,
    },
    sliderContainer: {
        paddingHorizontal: 16,
    },
    slider: {
        width: '90%',
        height: 40,
        alignSelf: 'center',
    },
    thumbStyle: {
        borderWidth: 4,
        height: 32,
        width: 32,
    },

});