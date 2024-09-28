import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import Auth from '@/components/Auth';
import { View, Text, Image, Pressable, Platform } from 'react-native';
import { NavigationContainer, useFocusEffect, useNavigation } from '@react-navigation/native'
import Me from '@/components/tabs/me';
import Surf from '@/components/tabs/surf';
import Dive from '@/components/tabs/dive';
import Profile from '@/app/profile';
import Onboarding from '@/app/onboarding';
import SearchFilters from '@/app/searchFilters';
import FilterGenderPreference from '@/app/searchFilters/filterGenderPreference';
import FilterStarsign from '@/app/searchFilters/filterStarsign';
import FilterAgeRange from '@/app/searchFilters/filterAgeRange';
import FilterBodyType from '@/app/searchFilters/filterBodyType';
import FilterExerciseFrequency from '@/app/searchFilters/filterExerciseFrequency';
import FilterSmokingFrequency from '@/app/searchFilters/filterSmoking';
import FilterDrinkingFrequency from '@/app/searchFilters/filterDrinking';
import FilterCannabisFrequency from '@/app/searchFilters/filterCannabis';
import FilterDietPreference from '@/app/searchFilters/filterDietPreference';
import { useAppContext } from '@/providers/AppProvider';
import { clearAllStorage, getData, storeData } from '@/utils/storage';
import { useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ChannelList from '@/components/ChannelList';
import ChatChannel from '@/components/ChatChannel';
import { useChatContext } from 'stream-chat-expo';
import { useNotifications } from "@/contexts/NotificationContext";

const tabIcons = {
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

function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home!</Text>
    </View>
  );
}

function DummySurf() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Explore</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Settings!</Text>
    </View>
  );
}

const SettingsStack = createStackNavigator();

function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
      <SettingsStack.Screen name="Details" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  const navigation = useNavigation();
  const { totalNotifications } = useNotifications();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconSource;

          if (route.name === "Home") {
            iconSource = focused ? tabIcons.homeActive : tabIcons.homeInactive;
          } else if (route.name === "History") {
            iconSource = focused
              ? tabIcons.historyActive
              : tabIcons.historyInactive;
          } else if (route.name === "Inbox") {
            iconSource = focused
              ? tabIcons.inboxActive
              : tabIcons.inboxInactive;
          } else if (route.name === "Me") {
            iconSource = focused ? tabIcons.meActive : tabIcons.meInactive;
          } else if (route.name === "Explore") {
            iconSource = focused ? tabIcons.meActive : tabIcons.meInactive;
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
              props.onPress();
              if (route.name === "Explore") {
                setTimeout(() => {
                  navigation.navigate("Home");
                  navigation.navigate("Surf");
                }, 100);
              }
            }}
          />
        ),
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { height: Platform.OS === "ios" ? 80 : 48 },
        // tabBarBackground: () => (
        //     <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
        //   ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={SettingsScreen} />
      <Tab.Screen name="Explore" component={DummySurf} />
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
      //   clearAllStorage();
      //   return;

      const checkIfOnboardingDone = async () => {
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
            console.log(
              "onboarding status found in storage",
              onboardingComplete
            );
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
        }
      };

      if (session) {
        checkIfOnboardingDone();
      }
    }, [session?.user.id]);









    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator initialRouteName='Main'>
                {session ? (
                    showOnboarding === true ? <Stack.Screen name="Onboarding" component={Onboarding} options={{ headerShown: false }} /> : (
                        <Stack.Group>
                            <Stack.Group screenOptions={{ headerShown: false, ...TransitionPresets.BottomSheetAndroid }}>
                                <Stack.Screen name="Main" component={TabNavigator} />
                                <Stack.Screen name="Surf" component={Surf} options={{ gestureEnabled: true, gestureDirection: 'vertical', gestureResponseDistance: 400 }} />
                                <Stack.Screen name="Dive" component={Dive} />
                                <Stack.Screen name="Profile" component={Profile} />
                                <Stack.Screen name="SearchFilters" component={SearchFilters} />
                                <Stack.Screen name="ChatChannel" component={ChatChannel} options={{ headerShown: true }} />
                            </Stack.Group>
                            <Stack.Group screenOptions={{ headerShown: false, ...TransitionPresets.SlideFromRightIOS }}>
                                <Stack.Screen name="filterGenderPreference" component={FilterGenderPreference} />
                                <Stack.Screen name="filterStarsign" component={FilterStarsign} />
                                <Stack.Screen name="filterAgeRange" component={FilterAgeRange} />
                                <Stack.Screen name="filterBodyType" component={FilterBodyType} />
                                <Stack.Screen name="filterExerciseFrequency" component={FilterExerciseFrequency} />
                                <Stack.Screen name="filterSmokingFrequency" component={FilterSmokingFrequency} />
                                <Stack.Screen name="filterDrinkingFrequency" component={FilterDrinkingFrequency} />
                                <Stack.Screen name="filterCannabisFrequency" component={FilterCannabisFrequency} />
                                <Stack.Screen name="filterDietPreference" component={FilterDietPreference} />
                            </Stack.Group>
                        </Stack.Group>
                    )
                ) : (
                    <Stack.Screen name="Auth" component={Auth} options={{ headerShown: false }} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}





