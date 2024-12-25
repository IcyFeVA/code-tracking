import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { SplashScreen } from 'expo-router';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Platform, LogBox, View, ActivityIndicator } from 'react-native';

import RootNavigator from '@/components/RootNavigator';
import { useAuth } from '@/hooks/useAuth';
import { AppProvider } from '@/providers/AppProvider';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { getData, resetUserSearchFilters } from '@/utils/storage';
import { api } from '@/api/supabaseApi';
import { Colors } from '@/constants/Colors';

// At the top level of your app
if (__DEV__) {
  LogBox.ignoreLogs([
    'Possible Unhandled Promise Rejection',
    // Add other warnings to ignore here
  ]);
} else {
  LogBox.ignoreAllLogs();
}

export default function RootLayout() {
  const session = useAuth();
  const [isAppReady, setIsAppReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    HeadingBold: require('@/assets/fonts/RobotoSlab-Bold.ttf'),
    HeadingRegular: require('@/assets/fonts/RobotoSlab-Regular.ttf'),
    HeadingMedium: require('@/assets/fonts/RobotoSlab-Medium.ttf'),
    HeadingLight: require('@/assets/fonts/RobotoSlab-Light.ttf'),
    BodyBold: require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
    BodySemiBold: require('@/assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    BodyRegular: require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    BodyMedium: require('@/assets/fonts/PlusJakartaSans-Medium.ttf'),
    BodyLight: require('@/assets/fonts/PlusJakartaSans-Light.ttf'),
    CopperBook: require('@/assets/fonts/Copernicus-Book.ttf'),
    CopperBold: require('@/assets/fonts/Copernicus-Bold.ttf'),
    CopperExtraBold: require('@/assets/fonts/Copernicus-Extrabold.ttf'),
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    async function prepare() {
      try {
        if (fontsLoaded && !session.isLoading) {
          // clearAllStorage()
          // return;

          await initializeApp();
          setIsAppReady(true);
        }
      } catch (e) {
        console.warn('Error initializing app:', e);
      } finally {
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [fontsLoaded, session.isLoading]);

  if (!isAppReady || session.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.light.accent} />
      </View>
    );
  }

  // console.log('RootLayout session:', session);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <NotificationProvider>
          <NavigationContainer>
            <RootNavigator session={session} />
          </NavigationContainer>
        </NotificationProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

async function initializeApp() {
  try {
    const filter_genderPreference = await getData('filter_genderPreference');
    if (filter_genderPreference === undefined) {
      console.log('No search preferences found, resetting');
      await resetUserSearchFilters();
    } else {
      console.log('Search preferences found', filter_genderPreference);
    }

    // Uncomment and use if needed
    // const tableData = await api.getTableInfo();
    // if (tableData) {
    //   console.log("Table data", tableData);
    // }
  } catch (error) {
    console.error('Error initializing app:', error);
  }
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
