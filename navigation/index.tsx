import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import 'react-native-gesture-handler';
// check if crashes in production https://reactnavigation.org/docs/stack-navigator/

import { Slot, SplashScreen } from 'expo-router';
import RootNavigator from '@/components/RootNavigator';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
// import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
// import { MMKV } from 'react-native-mmkv'
import hobbiesInterests from '@/constants/Interests'
// import { useNotifications } from '@/hooks/useNotifications';
import { clearAllStorage, getData, storeData, resetUserSearchFilters } from '@/utils/storage';
import { AppProvider, useAppContext } from '@/providers/AppProvider';
import { supabase } from '@/lib/supabase';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import ErrorBoundary from '@/components/ErrorBoundary';
import { NavigationContainer } from '@react-navigation/native';
import { NotificationProvider } from "@/contexts/NotificationContext";
// import { messaging, app } from "@/firebase";
// import * as Notifications from "expo-notifications";
// import * as Device from "expo-device";
import { LogBox } from "react-native";
import { api } from "@/api/supabaseApi";

// LogBox.ignoreLogs(["Possible Unhandled Promise Rejection"]);
LogBox.ignoreAllLogs();

// At the top level of your app
if (__DEV__) {
  const _console_error = console.error;
  console.error = (...args) => {
    if (
      args[0] &&
      args[0].match &&
      args[0].match(/Possible Unhandled Promise Rejection/)
    ) {
      // Ignore these warnings in dev mode
      return;
    }
    _console_error(...args);
  };
}

  // if (Platform.OS != "ios") {
  //   NavigationBar.setBackgroundColorAsync("white");
  // }

export default function RootLayout() {
  const session = useAuth();
  const [onboardingDone, setOnboardingDone] = useState(false);
  // const { expoPushToken, notification, matchNotifications } = useNotifications();
  const [loaded, error] = useFonts({
    HeadingBold: require("@/assets/fonts/RobotoSlab-Bold.ttf"),
    HeadingRegular: require("@/assets/fonts/RobotoSlab-Regular.ttf"),
    HeadingMedium: require("@/assets/fonts/RobotoSlab-Medium.ttf"),
    HeadingLight: require("@/assets/fonts/RobotoSlab-Light.ttf"),
    BodyBold: require("@/assets/fonts/PlusJakartaSans-Bold.ttf"),
    BodySemiBold: require("@/assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    BodyRegular: require("@/assets/fonts/PlusJakartaSans-Regular.ttf"),
    BodyMedium: require("@/assets/fonts/PlusJakartaSans-Medium.ttf"),
    BodyLight: require("@/assets/fonts/PlusJakartaSans-Light.ttf"),
    CopperBook: require("@/assets/fonts/Copernicus-Book.ttf"),
    CopperBold: require("@/assets/fonts/Copernicus-Bold.ttf"),
    CopperExtraBold: require("@/assets/fonts/Copernicus-Extrabold.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();

      // clearAllStorage()
      // return;

      const getTables = async () => {
        const data = await api.getTableInfo();

        if (data) {
          console.log("table data", data);
        }
      };
      // getTables();

      getData("genderPreference").then((genderPreference) => {
        if (genderPreference === undefined) {
          console.log("no search preferences found, resetting");
          resetUserSearchFilters();
        } else {
          console.log("search preferences found", genderPreference);
        }
      });
    }
  }, [loaded]);

  //   useEffect(() => {
  //     const initializeNotifications = async () => {
  //       try {
  //         await Notifications.setNotificationHandler({
  //           handleNotification: async () => ({
  //             shouldShowAlert: true,
  //             shouldPlaySound: false,
  //             shouldSetBadge: false,
  //           }),
  //         });

  //         const token = await registerForPushNotificationsAsync();
  //         console.log("Expo push token:", token);

  //         const subscription = Notifications.addNotificationReceivedListener(
  //           (notification) => {
  //             console.log("Notification received:", notification);
  //           }
  //         );

  //         return () => subscription.remove();
  //       } catch (error) {
  //         console.error("Error initializing notifications:", error);
  //         Alert.alert(
  //           "Error",
  //           "There was a problem setting up notifications. Please try again."
  //         );
  //       }
  //     };

  //     initializeNotifications();
  //   }, []);

  //   useEffect(() => {
  //     const initializeApp = async () => {
  //       try {
  //         if (!app) {
  //           throw new Error("Firebase app not initialized");
  //         }

  //         await Notifications.setNotificationHandler({
  //           handleNotification: async () => ({
  //             shouldShowAlert: true,
  //             shouldPlaySound: false,
  //             shouldSetBadge: false,
  //           }),
  //         });

  //         const token = await registerForPushNotificationsAsync();
  //         console.log("Expo push token:", token);

  //         const subscription = Notifications.addNotificationReceivedListener(
  //           (notification) => {
  //             console.log("Notification received:", notification);
  //           }
  //         );

  //         return () => subscription.remove();
  //       } catch (error) {
  //         console.error("Error in app initialization:", error);
  //         Alert.alert(
  //           "Error",
  //           "There was a problem initializing the app. Please try again."
  //         );
  //       }
  //     };

  //     initializeApp();
  //   }, []);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProvider>
          <NotificationProvider>
            <RootNavigator session={session} />
          </NotificationProvider>
        </AppProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

// async function registerForPushNotificationsAsync() {
//   try {
//     let token;
//     if (Device.isDevice) {
//       const { status: existingStatus } =
//         await Notifications.getPermissionsAsync();
//       let finalStatus = existingStatus;
//       if (existingStatus !== "granted") {
//         const { status } = await Notifications.requestPermissionsAsync();
//         finalStatus = status;
//       }
//       if (finalStatus !== "granted") {
//         alert("Failed to get push token for push notification!");
//         return;
//       }
//       token = (await Notifications.getExpoPushTokenAsync()).data;
//     } else {
//       alert("Must use physical device for Push Notifications");
//     }

//     if (Platform.OS === "android") {
//       Notifications.setNotificationChannelAsync("default", {
//         name: "default",
//         importance: Notifications.AndroidImportance.MAX,
//         vibrationPattern: [0, 250, 250, 250],
//         lightColor: "#FF231F7C",
//       });
//     }

//     return token;
//   } catch (error) {
//     console.error("Error registering for push notifications:", error);
//     throw error; // Re-throw if you want calling code to handle it
//   }
// }