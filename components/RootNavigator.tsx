import React, { useEffect, lazy, Suspense } from "react";
import { Image, Pressable, Platform, View, ActivityIndicator } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';

import { useAppContext } from '@/providers/AppProvider';
import { useNotifications } from '@/contexts/NotificationContext';
import { clearAllStorage, getData, storeData } from '@/utils/storage';
import { supabase } from '@/lib/supabase';

import Home from '@/components/tabs/home';
import History from '@/components/tabs/history';
import Me from '@/components/tabs/me';
import Surf from '@/components/tabs/surf';
import Dive from '@/components/tabs/dive';
import MyProfile from '@/components/pages/MyProfile';
import Inbox from '@/components/pages/inbox/Inbox';
import ChatView from '@/components/pages/inbox/ChatView';
import SearchFilters from '@/components/pages/searchFilters';
import Auth from '@/components/pages/Auth';
import Onboarding from '@/components/pages/Onboarding';
import SurfDetails from '@/components/pages/SurfDetails';
import UserProfile from '@/components/pages/UserProfile';
import BlockedUsers from '@/components/pages/BlockedUsers';
import FilterInterests from '@/components/pages/searchFilters/filterInterests';
import FilterGenderPreference from '@/components/pages/searchFilters/filterGenderPreference';
import FilterStarsign from '@/components/pages/searchFilters/filterStarsign';
import FilterAgeRange from '@/components/pages/searchFilters/filterAgeRange';
import FilterBodyType from '@/components/pages/searchFilters/filterBodyType';
import FilterExerciseFrequency from '@/components/pages/searchFilters/filterExerciseFrequency';
import FilterSmokingFrequency from '@/components/pages/searchFilters/filterSmoking';
import FilterDrinkingFrequency from '@/components/pages/searchFilters/filterDrinking';
import FilterCannabisFrequency from '@/components/pages/searchFilters/filterCannabis';
import FilterDietPreference from '@/components/pages/searchFilters/filterDietPreference';
import EditNameAge from './pages/editprofile/EditNameAge';
import EditBio from './pages/editprofile/EditBio';
import EditGender from './pages/editprofile/EditGender';
import EditInterests from './pages/editprofile/EditInterests';
import EditLookingFor from './pages/editprofile/EditLookingFor';
import EditPronouns from './pages/editprofile/EditPronouns';
import TermsOfService from '@/components/pages/terms-of-service';
import PrivacyPolicy from '@/components/pages/privacy-policy';
import Contact from '@/components/pages/Contact';
import { defaultStyles } from '@/constants/Styles';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Session, User } from '@supabase/supabase-js';

// Constants
const TAB_ICONS = {
  home: {
    active: require('@/assets/images/icons/tab-home-active.png'),
    inactive: require('@/assets/images/icons/tab-home.png'),
  },
  history: {
    active: require('@/assets/images/icons/tab-history-active.png'),
    inactive: require('@/assets/images/icons/tab-history.png'),
  },
  inbox: {
    active: require('@/assets/images/icons/tab-inbox-active.png'),
    inactive: require('@/assets/images/icons/tab-inbox.png'),
  },
  me: {
    active: require('@/assets/images/icons/tab-me-active.png'),
    inactive: require('@/assets/images/icons/tab-me.png'),
  },
  explore: require('@/assets/images/icons/tab-explore.png'),
};

const PLATFORM_TAB_HEIGHT = Platform.OS === 'ios' ? 80 : 48;

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function Explore() {
  return null; // Placeholder component, not rendering anything
}

function TabNavigator() {
  const navigation = useNavigation();
  const { totalNotifications } = useNotifications();

  const handleExploreTabPress = async () => {
    const lookingFor = await getData('lookingFor');
    setTimeout(() => {
      navigation.navigate(lookingFor === 3 ? 'Surf' : 'Dive', { lookingFor });
    }, 100);
  };

  const renderTabIcon = (route, focused) => {
    if (route.name === 'Explore') {
      return (
        <Image
          style={{ marginTop: Platform.OS === 'ios' ? 0 : -4 }}
          source={TAB_ICONS.explore}
          pointerEvents="none"
        />
      );
    }
    const iconSet = TAB_ICONS[route.name.toLowerCase()];
    return <Image source={focused ? iconSet.active : iconSet.inactive} />;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => renderTabIcon(route, focused),
        tabBarButton: (props) => (
          <Pressable
            {...props}
            onPress={() => {
              route.name === 'Explore' ? handleExploreTabPress() : props.onPress();
            }}
          />
        ),
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { height: PLATFORM_TAB_HEIGHT },
      })}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="History" component={History} />
      <Tab.Screen name="Explore" component={Explore} />
      <Tab.Screen
        name="Inbox"
        component={Inbox}
        options={{
          tabBarBadge: totalNotifications > 0 ? totalNotifications : undefined,
        }}
        initialParams={{ inChatFlow: false }}
      />
      <Tab.Screen name="Me" component={Me} />
    </Tab.Navigator>
  );
}

interface RootNavigatorProps {
  session: {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
  };
}

function RootNavigator({ session }: RootNavigatorProps) {
  const { showOnboarding, setShowOnboarding } = useAppContext();
  const navigation = useNavigation();

  // console.log('RootNavigator session:', session);

  if (session.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.light.accent} />
      </View>
    );
  }

  useEffect(() => {
    if (session.session && session.user) {
      checkOnboardingStatus();
      checkLookingForStatus();
    }
  }, [session]);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingComplete = await getData('onboardingComplete');
      if (onboardingComplete === undefined && session.user?.id) {
        const { data } = await supabase
          .from('profiles_test')
          .select('name')
          .eq('id', session.user.id)
          .single();

        if (data?.name != null) {
          await storeData('onboardingComplete', true);
        } else {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const checkLookingForStatus = async () => {
    if (!session.user?.id) return;

    const lookingFor = await getData('lookingFor');
    if (lookingFor === undefined) {
      const { data } = await supabase
        .from('profiles_test')
        .select('looking_for')
        .eq('id', session.user.id)
        .single();

      await storeData('lookingFor', data?.looking_for ?? 1);
    }
  };

  const renderHeaderBackButton = () => (
    <Pressable onPress={() => navigation.goBack()} style={defaultStyles.headerBackButton}>
      <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
    </Pressable>
  );

  if (!session.session || !session.user) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Auth" component={Auth} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  if (showOnboarding) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Onboarding" component={Onboarding} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Group screenOptions={{ headerShown: false, ...TransitionPresets.BottomSheetAndroid }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="Surf"
          component={Surf}
          options={{
            gestureEnabled: true,
            gestureDirection: 'vertical',
            gestureResponseDistance: 500,
          }}
        />
        <Stack.Screen name="Dive" component={Dive} />
        <Stack.Screen name="SurfDetails" component={SurfDetails} />
        <Stack.Screen name="SearchFilters" component={SearchFilters} />
        <Stack.Screen
          name="ChatView"
          component={ChatView}
          options={{
            headerShown: true,
            headerLeft: renderHeaderBackButton,
          }}
        />
      </Stack.Group>
      <Stack.Group screenOptions={{ headerShown: false, ...TransitionPresets.SlideFromRightIOS }}>
        <Stack.Screen name="MyProfile" component={MyProfile} />
        <Stack.Screen name="EditNameAge" component={EditNameAge} />
        <Stack.Screen name="EditBio" component={EditBio} />
        <Stack.Screen name="EditGender" component={EditGender} />
        <Stack.Screen name="EditInterests" component={EditInterests} />
        <Stack.Screen name="EditLookingFor" component={EditLookingFor} />
        <Stack.Screen name="EditPronouns" component={EditPronouns} />
        <Stack.Screen name="BlockedUsers" component={BlockedUsers} />
      </Stack.Group>
      <Stack.Group screenOptions={{ headerShown: false, ...TransitionPresets.SlideFromRightIOS }}>
        <Stack.Screen name="filterInterests" component={FilterInterests} />
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
      <Stack.Group screenOptions={{ headerShown: false, ...TransitionPresets.BottomSheetAndroid }}>
        <Stack.Screen name="TermsOfService" component={TermsOfService} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
        <Stack.Screen name="Contact" component={Contact} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

export default RootNavigator;
