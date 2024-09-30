import React, { useEffect, lazy, Suspense } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";

import { useAppContext } from "@/providers/AppProvider";
import { useNotifications } from "@/contexts/NotificationContext";
import { clearAllStorage, getData, storeData } from "@/utils/storage";
import { supabase } from "@/lib/supabase";

import Home from "@/components/tabs/home";
import History from "@/components/tabs/history";
import Me from "@/components/tabs/me";
import Surf from "@/components/tabs/surf";
import Dive from "@/components/tabs/dive";
import MyProfile from "@/components/pages/MyProfile";
import ChannelList from "@/components/pages/inbox/Inbox";
import ChatChannel from "@/components/pages/inbox/ChatChannel";
import SearchFilters from "@/components/pages/searchFilters";
import Auth from "@/components/pages/Auth";
import Onboarding from "@/components/pages/Onboarding";
import SurfDetails from "@/components/pages/SurfDetails";
import FilterInterests from "@/components/pages/searchFilters/filterInterests"
import FilterGenderPreference from "@/components/pages/searchFilters/filterGenderPreference";
import FilterStarsign from "@/components/pages/searchFilters/filterStarsign";
import FilterAgeRange from "@/components/pages/searchFilters/filterAgeRange";
import FilterBodyType from "@/components/pages/searchFilters/filterBodyType";
import FilterExerciseFrequency from "@/components/pages/searchFilters/filterExerciseFrequency";
import FilterSmokingFrequency from "@/components/pages/searchFilters/filterSmoking";
import FilterDrinkingFrequency from "@/components/pages/searchFilters/filterDrinking";
import FilterCannabisFrequency from "@/components/pages/searchFilters/filterCannabis";
import FilterDietPreference from "@/components/pages/searchFilters/filterDietPreference";
import EditNameAge from "./pages/editprofile/EditNameAge";
import EditBio from "./pages/editprofile/EditBio";
import EditGender from "./pages/editprofile/EditGender";
import EditInterests from "./pages/editprofile/EditInterests";
import EditLookingFor from "./pages/editprofile/EditLookingFor";
import EditPronouns from "./pages/editprofile/EditPronouns";

// Constants
const TAB_ICONS = {
  homeActive: require("@/assets/images/icons/tab-home-active.png"),
  homeInactive: require("@/assets/images/icons/tab-home.png"),
  historyActive: require("@/assets/images/icons/tab-history-active.png"),
  historyInactive: require("@/assets/images/icons/tab-history.png"),
  inboxActive: require("@/assets/images/icons/tab-inbox-active.png"),
  inboxInactive: require("@/assets/images/icons/tab-inbox.png"),
  meActive: require("@/assets/images/icons/tab-me-active.png"),
  meInactive: require("@/assets/images/icons/tab-me.png"),
  exploreInactive: require("@/assets/images/icons/tab-explore.png"),
};

const PLATFORM_TAB_HEIGHT = Platform.OS === "ios" ? 80 : 48;

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function Explore() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Explore</Text>
    </View>
  );
}

function TabNavigator() {
  const navigation = useNavigation();
  const { totalNotifications } = useNotifications();

  const handleExploreTabPress = async (routeName) => {
    const lookingFor = await getData("lookingFor");
    setTimeout(() => {
      navigation.navigate(lookingFor === 3 ? "Surf" : "Dive", { lookingFor });
    }, 100);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconSource;

          if (route.name === "Home") {
            iconSource = focused
              ? TAB_ICONS.homeActive
              : TAB_ICONS.homeInactive;
          } else if (route.name === "History") {
            iconSource = focused
              ? TAB_ICONS.historyActive
              : TAB_ICONS.historyInactive;
          } else if (route.name === "Inbox") {
            iconSource = focused
              ? TAB_ICONS.inboxActive
              : TAB_ICONS.inboxInactive;
          } else if (route.name === "Me") {
            iconSource = focused ? TAB_ICONS.meActive : TAB_ICONS.meInactive;
          } else if (route.name === "Explore") {
            iconSource = focused ? TAB_ICONS.meActive : TAB_ICONS.meInactive;
            return (
              <Image
                style={{ marginTop: Platform.OS === "ios" ? 0 : -4 }}
                source={require("@/assets/images/icons/tab-explore.png")}
                pointerEvents="none"
              />
            );
          }

          return <Image source={iconSource} />;
        },
        tabBarButton: (props) => (
          <Pressable
            {...props}
            onPress={() => {
              if (route.name === "Explore") {
                handleExploreTabPress(route.name);
              } else {
                props.onPress();
              }
            }}
          />
        ),
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { height: PLATFORM_TAB_HEIGHT },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="History" component={History} />
      <Tab.Screen name="Explore" component={Explore} />
      <Tab.Screen
        name="Inbox"
        component={ChannelList}
        options={{
          tabBarBadge: totalNotifications > 0 ? totalNotifications : undefined,
        }}
        initialParams={{ inChatFlow: false }}
      />
      <Tab.Screen name="Me" component={Me} />
    </Tab.Navigator>
  );
}

export default function RootNavigator({ session }) {
  const { showOnboarding, setShowOnboarding } = useAppContext();

  useEffect(() => {
    if (session) {
      checkOnboardingStatus();
      checkLookingForStatus();
    }
  }, [session, session?.user.id]);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingComplete = await getData("onboardingComplete");

      if (onboardingComplete === undefined) {
        console.log("onboarding status undefined in storage");

        const getProfile = async () => {
          try {
            const { data } = await supabase
              .from("profiles_test")
              .select("name")
              .eq("id", session?.user.id)
              .single();

            if (data) {
              if (data?.name != null) {
                console.log("onboarding done, saving it in storage");
                await storeData("onboardingComplete", true);
              } else {
                console.log("onboarding not done");
                setShowOnboarding(true);
              }
            }
          } catch (error: any) {
            console.log("Error getting profile:", error);
          }
        };

        getProfile();
      } else {
        console.log("onboarding status found in storage", onboardingComplete);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    }
  };

  const checkLookingForStatus = async () => {
    const lookingFor = await getData("lookingFor");

    if (lookingFor === undefined) {
      console.log("looking for status undefined in storage, setting default");

      const { data } = await supabase
        .from("profiles_test")
        .select("looking_for")
        .eq("id", session?.user.id)
        .single();

      if (data) {
        if (data?.looking_for != null) {
          console.log("looking for found", data?.looking_for);
          await storeData("lookingFor", data?.looking_for);
        } else {
          console.log("looking for not found, setting default");
          await storeData("lookingFor", 1);
        }
      }
    } else {
      console.log("looking for status found in storage", lookingFor);
    }
  };

  return (
    <Stack.Navigator initialRouteName="Main">
      {session ? (
        showOnboarding ? (
          <Stack.Screen
            name="Onboarding"
            component={Onboarding}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Group>
            <Stack.Group
              screenOptions={{
                headerShown: false,
                ...TransitionPresets.BottomSheetAndroid,
              }}
            >
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen
                name="Surf"
                component={Surf}
                options={{
                  gestureEnabled: true,
                  gestureDirection: "vertical",
                  gestureResponseDistance: 400,
                }}
              />
              <Stack.Screen name="Dive" component={Dive} />
              <Stack.Screen name="SurfDetails" component={SurfDetails} />
              <Stack.Screen name="SearchFilters" component={SearchFilters} />
              <Stack.Screen
                name="ChatChannel"
                component={ChatChannel}
                options={{ headerShown: true }}
              />
            </Stack.Group>
            <Stack.Group
              screenOptions={{
                headerShown: false,
                ...TransitionPresets.SlideFromRightIOS,
              }}
            >
              <Stack.Screen name="MyProfile" component={MyProfile} />
              <Stack.Screen name="EditNameAge" component={EditNameAge} />
              <Stack.Screen name="EditBio" component={EditBio} />
              <Stack.Screen name="EditGender" component={EditGender} />
              <Stack.Screen name="EditInterests" component={EditInterests} />
              <Stack.Screen name="EditLookingFor" component={EditLookingFor} />
              <Stack.Screen name="EditPronouns" component={EditPronouns} />
            </Stack.Group>
            <Stack.Group
              screenOptions={{
                headerShown: false,
                ...TransitionPresets.SlideFromRightIOS,
              }}
            >
              <Stack.Screen name="filterInterests" component={FilterInterests} />
              <Stack.Screen
                name="filterGenderPreference"
                component={FilterGenderPreference}
              />
              <Stack.Screen name="filterStarsign" component={FilterStarsign} />
              <Stack.Screen name="filterAgeRange" component={FilterAgeRange} />
              <Stack.Screen name="filterBodyType" component={FilterBodyType} />
              <Stack.Screen
                name="filterExerciseFrequency"
                component={FilterExerciseFrequency}
              />
              <Stack.Screen
                name="filterSmokingFrequency"
                component={FilterSmokingFrequency}
              />
              <Stack.Screen
                name="filterDrinkingFrequency"
                component={FilterDrinkingFrequency}
              />
              <Stack.Screen
                name="filterCannabisFrequency"
                component={FilterCannabisFrequency}
              />
              <Stack.Screen
                name="filterDietPreference"
                component={FilterDietPreference}
              />
            </Stack.Group>
          </Stack.Group>
        )
      ) : (
        <Stack.Screen
          name="Auth"
          component={Auth}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}
