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
        "filter_zodiac_sign",
        "filter_body_type",
        "filter_min_age",
        "filter_max_age",
        "filter_genderPreference",
        "filter_exercise_frequency",
        "filter_smoking_frequency",
        "filter_drinking_frequency",
        "filter_cannabis_frequency",
        "filter_diet_preference",
      ]);
      return values;
    } catch (e) {
      console.error("Error reading values", e);
    }
  };

const resetUserSearchFilters = async () => {
     try {
        await AsyncStorage.multiRemove(['filter_genderPreference', 'filter_min_age', 'filter_max_age', 'filter_zodiac_sign'])
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