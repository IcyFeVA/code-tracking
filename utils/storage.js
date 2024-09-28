import AsyncStorage from '@react-native-async-storage/async-storage';

// usage:
/*
    import { getData, storeData } from '@/utils/storage';

    storeData('user', session);

    getData('user').then(user => {
        console.log(user);
    });
*/

const storeData = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving data', e);
    }
};
const getData = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
            return JSON.parse(value);
        }
    } catch (e) {
        console.error('Error reading data', e);
    }
};

const getUserSearchFilters = async () => {
    try {
      const values = await AsyncStorage.multiGet([
        "zodiac_sign",
        "body_type",
        "min_age",
        "max_age",
        "distance",
        "gender",
        "exercise_frequency",
        "smoking_frequency",
        "drinking_frequency",
        "cannabis_frequency",
        "diet_preference",
      ]);
      return values;
    } catch (e) {
      console.error("Error reading values", e);
    }
  };

const resetUserSearchFilters = async () => {
    const genderPreferencesSet = ['genderPreference', JSON.stringify({ key: '', value: [] })]
    const ageRangeSet = ['ageRange', JSON.stringify({ key: '', value: '18-30' })]
    const distanceSet = ['distance', JSON.stringify({ key: '40', value: '40' })]
    const starSignPreference = ['starSignPreference', JSON.stringify({ key: '', value: '-' })]
    const bodyTypePreference = ['bodyTypePreference', JSON.stringify({ key: '', value: '-' })]
    const exerciseFrequency = ['exerciseFrequency', JSON.stringify({ key: '', value: '-' })]
    const smokingFrequency = ['smokingFrequency', JSON.stringify({ key: '', value: '-' })]
    const drinkingFrequency = ['drinkingFrequency', JSON.stringify({ key: '', value: '-' })]
    const cannabisFrequency = ['cannabisFrequency', JSON.stringify({ key: '', value: '-' })]
    const dietPreference = ['dietPreference', JSON.stringify({ key: '', value: '-' })]

    try {
        await AsyncStorage.multiSet([genderPreferencesSet, ageRangeSet, distanceSet, starSignPreference, bodyTypePreference,
            exerciseFrequency, smokingFrequency, drinkingFrequency, cannabisFrequency, dietPreference])
    } catch (e) {
        //save error
    }

    console.log("search filters reset")
}


const clearAllStorage = async () => {
    try {
        await AsyncStorage.clear()
    } catch (e) {
        // clear error
    }

    console.log('CLEARING STORAGE')
}

export { storeData, getData, getUserSearchFilters,resetUserSearchFilters, clearAllStorage };