import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import { Button, Card, ListItem } from 'react-native-ui-lib'
import Spacer from '@/components/Spacer'
import { useFocusEffect } from 'expo-router'
import { defaultStyles } from '@/constants/Styles'
import {
  getData,
  getUserSearchFilters,
  resetUserSearchFilters,
} from "@/utils/storage";
import { useAppContext } from "@/providers/AppProvider";
import { useNavigation } from "@react-navigation/native";

export default function SearchFilters() {
  const { searchFilters, setSearchFilters, resetFilters } = useAppContext();
  const navigation = useNavigation();

  const getUserFilters = async () => {
    try {
      const values = await getUserSearchFilters(); // Retrieve the stored data
      const filterObject = Object.fromEntries(values); // Convert the array into an object
  
      if (filterObject.filter_interests) {
        filterObject.filter_interests = JSON.parse(filterObject.filter_interests);
      }
      if (filterObject.filter_genderPreference) {
        filterObject.filter_genderPreference = JSON.parse(filterObject.filter_genderPreference);
      }
      if (filterObject.filter_zodiac_sign) {
        filterObject.filter_zodiac_sign = JSON.parse(filterObject.filter_zodiac_sign);
      }
      if (filterObject.filter_body_type) {
        filterObject.filter_body_type = JSON.parse(filterObject.filter_body_type);
      }
      console.log('...', filterObject)
      setSearchFilters(filterObject);
    } catch (e) {
      console.error("Error reading values", e);
      // Add user feedback here, e.g., alert or toast
    }
  };
  
  

  const resetSettings = async () => {
    await resetUserSearchFilters();
    // resetFilters();
    await getUserFilters(); // Ensure this is awaited
  };


  useEffect(() => {
    navigation.addListener('focus', () => {
      getUserFilters(); 
    });

  }, [navigation]);

  if (!searchFilters || Object.keys(searchFilters).length === 0) {
    return <ActivityIndicator size={"large"} color={Colors.light.accent} />;
  }

  return (
    <SafeAreaView style={defaultStyles.SafeAreaView}>
      <View style={defaultStyles.innerContainer}>
        <Card
          onPress={() => console.log("pressed me")}
          enableShadow={false}
          style={{
            display: "flex",
            height: 60,
            alignItems: "center",
            backgroundColor: "transparent",
          }}
        >
          <Text style={{ fontFamily: "HeadingBold", fontSize: 20 }}>
            Search Filters
          </Text>
        </Card>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Button
            onPress={() => navigation.navigate("filterGenderPreference")}
            style={[
              defaultStyles.settingListButton,
              defaultStyles.noRadius,
              styles.firstItem,
            ]}
          >
            <Text style={defaultStyles.settingListButtonLabel}>Gender</Text>
            <Text style={[defaultStyles.settingListButtonLabel, styles.active]}>
              {searchFilters.filter_genderPreference ? (searchFilters.filter_genderPreference.length > 1 ? searchFilters.filter_genderPreference.length : searchFilters.filter_genderPreference[0].value) : '-'}
            </Text>

          </Button>
          <Button
            onPress={() => navigation.navigate("filterAgeRange")}
            style={[defaultStyles.settingListButton, defaultStyles.noRadius, styles.lastItem]}
          >
            <Text style={defaultStyles.settingListButtonLabel}>Age Range</Text>
            <Text style={[defaultStyles.settingListButtonLabel, styles.active]}>
            {searchFilters.filter_min_age && searchFilters.filter_max_age ? `${searchFilters.filter_min_age} - ${searchFilters.filter_max_age}` : '-'}
            </Text>
          </Button>

          <Spacer height={32} />

          <Text
            style={{
              fontFamily: "BodyBold",
              fontSize: 14,
              lineHeight: 22,
              color: Colors.light.textSecondary,
              textAlign: "center",
            }}
          >
            MORE ABOUT YOUR IDEAL MATCH
          </Text>
          <Spacer height={8} />

          <Button
            onPress={() => navigation.navigate("filterInterests")}
            style={[
              defaultStyles.settingListButton,
              defaultStyles.noRadius,
              styles.firstItem,
            ]}
          >
            <Text style={defaultStyles.settingListButtonLabel}>Interests</Text>
            <Text style={[defaultStyles.settingListButtonLabel, styles.active]}>
            {searchFilters.filter_interests && searchFilters.filter_interests.length > 0 ? searchFilters.filter_interests.length : '-'}
            </Text>
          </Button>
          <Button
            onPress={() => navigation.navigate("filterBodyType")}
            style={[defaultStyles.settingListButton, defaultStyles.noRadius]}
          >
            <Text style={defaultStyles.settingListButtonLabel}>Body Type</Text>
            <Text style={[defaultStyles.settingListButtonLabel, styles.active]}>
            {searchFilters.filter_body_type ? searchFilters.filter_body_type.value : "-"}
            </Text>
          </Button>
          <Button
            onPress={() => navigation.navigate("filterStarsign")}
            style={[defaultStyles.settingListButton, defaultStyles.noRadius]}
          >
            <Text style={defaultStyles.settingListButtonLabel}>Zodiac Sign</Text>
            <Text style={[defaultStyles.settingListButtonLabel, styles.active]}>
              {searchFilters.filter_zodiac_sign ? searchFilters.filter_zodiac_sign.value : "-"}
            </Text>
          </Button>
          <Button
            onPress={() => navigation.navigate("filterExerciseFrequency")}
            style={[defaultStyles.settingListButton, defaultStyles.noRadius]}
          >
            <Text style={defaultStyles.settingListButtonLabel}>
              Working out
            </Text>
            <Text style={[defaultStyles.settingListButtonLabel, styles.active]}>
              {searchFilters.exercise_frequency || "-"}
            </Text>
          </Button>
          <Button
            onPress={() => navigation.navigate("filterSmokingFrequency")}
            style={[defaultStyles.settingListButton, defaultStyles.noRadius]}
          >
            <Text style={defaultStyles.settingListButtonLabel}>Smoking</Text>
            <Text style={[defaultStyles.settingListButtonLabel, styles.active]}>
              {searchFilters.smoking_frequency || "-"}
            </Text>
          </Button>
          <Button
            onPress={() => navigation.navigate("filterDrinkingFrequency")}
            style={[defaultStyles.settingListButton, defaultStyles.noRadius]}
          >
            <Text style={defaultStyles.settingListButtonLabel}>Drinking</Text>
            <Text style={[defaultStyles.settingListButtonLabel, styles.active]}>
              {searchFilters.drinking_frequency || "-"}
            </Text>
          </Button>
          <Button
            onPress={() => navigation.navigate("filterCannabisFrequency")}
            style={[defaultStyles.settingListButton, defaultStyles.noRadius]}
          >
            <Text style={defaultStyles.settingListButtonLabel}>Cannabis</Text>
            <Text style={[defaultStyles.settingListButtonLabel, styles.active]}>
              {searchFilters.cannabis_frequency || "-"}
            </Text>
          </Button>
          <Button
            onPress={() => navigation.navigate("filterDietPreference")}
            style={[defaultStyles.settingListButton, defaultStyles.noRadius]}
          >
            <Text style={defaultStyles.settingListButtonLabel}>Diet</Text>
            <Text style={[defaultStyles.settingListButtonLabel, styles.active]}>
              {searchFilters.diet_preference || "-"}
            </Text>
          </Button>
        </ScrollView>

        <Spacer height={16} />

        <View
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
            gap: 8,
          }}
        >
          <Button
            onPress={() => resetSettings()}
            style={[
              defaultStyles.button,
              defaultStyles.buttonShadow,
              { flex: 1 },
            ]}
          >
            <Text style={defaultStyles.buttonLabel}>Reset</Text>
          </Button>
          <Button
            onPress={() => {
              navigation.goBack();
            }}
            style={[
              defaultStyles.button,
              defaultStyles.buttonShadow,
              { flex: 1 },
            ]}
          >
            <Text style={defaultStyles.buttonLabel}>Save</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}



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
    innerContainer: {
        flex: 1,
        padding: 16,
    },


});



