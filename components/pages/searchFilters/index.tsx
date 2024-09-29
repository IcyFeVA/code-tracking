import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useLayoutEffect, useState } from 'react'
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
      const values = await getUserSearchFilters();
      console.log("--------------------", values)
      setSearchFilters(values);
    } catch (e) {
      console.error("Error reading values", e);
    }
  };

  const resetSettings = async () => {
    await resetUserSearchFilters();
    resetFilters();
    getUserFilters();
  };

  useFocusEffect(
    useCallback(() => {
      getUserFilters();
    }, [])
  );

  if(!searchFilters) {
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
              {searchFilters.gender || "-"}
            </Text>
          </Button>
          <Button
            onPress={() => navigation.navigate("filterAgeRange")}
            style={[defaultStyles.settingListButton, defaultStyles.noRadius]}
          >
            <Text style={defaultStyles.settingListButtonLabel}>Age Range</Text>
            <Text style={[defaultStyles.settingListButtonLabel, styles.active]}>
              {searchFilters.min_age}-{searchFilters.max_age}
            </Text>
          </Button>
          <Button
            onPress={() => console.log("pressed")}
            style={[
              defaultStyles.settingListButton,
              defaultStyles.noRadius,
              styles.lastItem,
            ]}
          >
            <Text style={defaultStyles.settingListButtonLabel}>Distance</Text>
            <Text style={[defaultStyles.settingListButtonLabel, styles.active]}>
              {searchFilters.distance} km
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
            onPress={() => console.log("pressed")}
            style={[
              defaultStyles.settingListButton,
              defaultStyles.noRadius,
              styles.firstItem,
            ]}
          >
            <Text style={defaultStyles.settingListButtonLabel}>Interests</Text>
            <Text style={[defaultStyles.settingListButtonLabel, styles.active]}>
              -
            </Text>
          </Button>
          <Button
            onPress={() => navigation.navigate("filterBodyType")}
            style={[defaultStyles.settingListButton, defaultStyles.noRadius]}
          >
            <Text style={defaultStyles.settingListButtonLabel}>Body Type</Text>
            <Text style={[defaultStyles.settingListButtonLabel, styles.active]}>
              {searchFilters.body_type || "-"}
            </Text>
          </Button>
          <Button
            onPress={() => navigation.navigate("filterStarsign")}
            style={[defaultStyles.settingListButton, defaultStyles.noRadius]}
          >
            <Text style={defaultStyles.settingListButtonLabel}>Star Sign</Text>
            <Text style={[defaultStyles.settingListButtonLabel, styles.active]}>
              {searchFilters.zodiac_sign || "-"}
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



