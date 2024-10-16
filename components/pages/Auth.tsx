import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  TouchableOpacity,
  Keyboard,
  StatusBar,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Button, Text } from "react-native-ui-lib";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Spacer from "../Spacer";
import { Textfield } from "@/components/ui/Textfields";
import { Pageview } from "@/components/ui/Containers";
import { useColorScheme } from "nativewind";

import {
  Image,
  Animated,
  FlatList,
  useWindowDimensions,
  ImageSourcePropType,
} from "react-native";
import {
  PrimaryButton,
  PrimaryButtonText,
  SecondaryButton,
  SecondaryButtonText,
} from "../ui/Buttons";
import { useRef } from "react";
import { defaultStyles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";

export default function Auth({ onboarding }: any) {
  const { colorScheme, setColorScheme } = useColorScheme();

  const [mode, setMode] = useState('welcome');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const onboardingContent = [
    {
      id: 1,
      title: 'Step 1',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      image: require('@/assets/images/onboarding/onboarding1.png'),
    },
    {
      id: 2,
      title: 'Step 2',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      image: require('@/assets/images/onboarding/onboarding2.png'),
    },
    {
      id: 3,
      title: 'Step 3',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      image: require('@/assets/images/onboarding/onboarding3.png'),
    },
    {
      id: 4,
      title: 'Step 4',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      image: require('@/assets/images/onboarding/onboarding4.png'),
    },
    {
      id: 5,
      title: 'Step 5',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      image: require('@/assets/images/onboarding/onboarding5.png'),
    },
  ];

  interface OnboardingItem {
    id: number;
    title: string;
    description: string;
    image: ImageSourcePropType;
  }

  const { width } = useWindowDimensions();

  function renderItem({ item }: { item: OnboardingItem }) {
    return (
      <View className="">
        <Image source={item.image} style={{ width }} />
        {/* <View>
                    <Text>{item.title}</Text>
                    <Text>{item.description}</Text>
                </View> */}
      </View>
    );
  }

  const scrollX = useRef(new Animated.Value(0)).current;

  const Pagination = ({ count }: { count: number }) => {
    return (
      <View className="flex-row justify-center">
        {Array(count)
          .fill(0)
          .map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotColor = scrollX.interpolate({
              inputRange,
              outputRange: ['#cccccc', '#7A37D0', '#cccccc'],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index}
                className="w-2 h-2 mx-1 rounded-full"
                style={{ backgroundColor: dotColor }}
              />
            );
          })}
      </View>
    );
  };

  async function signInWithPhone() {
    if (!isValidPhoneNumber(phoneNumber)) {
      Alert.alert('Error', 'Invalid phone number');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });

    if (error) {
      Alert.alert('Error', error.message);
      console.log('Error', error.message);
    } else {
      setIsVerifying(true);
    }
    setLoading(false);
  }

  async function verifyPhoneNumber() {
    if (verificationCode.length !== 6) {
      Alert.alert('Invalid code', 'Please enter a 6-digit code');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: verificationCode,
      type: 'sms',
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      // User is now signed in
      console.log('User signed in successfully', data);
      // You can redirect the user or update the UI here
    }
    setLoading(false);
  }

  function isValidPhoneNumber(phone: string): boolean {
    // This regex pattern allows for various phone number formats
    // It's a basic validation and might need to be adjusted based on your specific requirements
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  const [keyboardStatus, setKeyboardStatus] = useState('');

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardStatus('Keyboard Shown');
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus('Keyboard Hidden');
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
      {mode === 'signin' && (
        <Pageview className="flex justify-space-between h-full">
          <View className="flex-1">
            <Text className="text-3xl font-bold">Hello again!</Text>

            <Spacer height={64} />

            <Text className="text-sm font-bold">Phone Number</Text>
            <Spacer height={4} />
            <Textfield
              onChangeText={(text) => setPhoneNumber(text)}
              placeholder="+1 (555) 555-5555"
              keyboardType="phone-pad"
            />

            <Spacer height={16} />

            {isVerifying && (
              <>
                <Text className="text-sm font-bold">Verification Code</Text>
                <Spacer height={4} />
                <Textfield
                  onChangeText={(text) => setVerificationCode(text)}
                  placeholder="Enter 6-digit code"
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </>
            )}

            <Spacer height={64} />

            <Button
              onPress={isVerifying ? verifyPhoneNumber : signInWithPhone}
              style={[defaultStyles.button, defaultStyles.buttonShadow]}>
              <Text style={defaultStyles.buttonLabel}>
                {isVerifying ? 'Verify Code' : 'Sign in'}
              </Text>
            </Button>

            <Spacer height={32} />

            <TouchableOpacity className="ml-4 mt-3" onPress={() => {}}>
              <Text className="text-center text-primary-500">Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className={keyboardStatus === 'Keyboard Shown' ? 'hidden' : 'ml-4 mt-3'}
            onPress={() => setMode('signup')}>
            <Text className="text-center">
              New here? <Text className="text-primary-500">Create an account</Text>
            </Text>
          </TouchableOpacity>

          <Spacer height={16} />

          <TouchableOpacity
            className={keyboardStatus === 'Keyboard Shown' ? 'hidden' : 'ml-4 mt-3'}
            onPress={() => setMode('welcome')}>
            <Text className="text-center text-primary-500">Back to welcome screen</Text>
          </TouchableOpacity>
        </Pageview>
      )}

      {mode === 'signup' && (
        <Pageview className="flex justify-space-between h-full">
          <View className="flex-1">
            <Text className="text-3xl font-bold">Welcome!</Text>

            <Spacer height={64} />

            <Text className="text-sm font-bold">Phone Number</Text>
            <Spacer height={4} />
            <Textfield
              onChangeText={(text) => setPhoneNumber(text)}
              placeholder="+1 (555) 555-5555"
              keyboardType="phone-pad"
            />

            <Spacer height={16} />

            {isVerifying && (
              <>
                <Text className="text-sm font-bold">Verification Code</Text>
                <Spacer height={4} />
                <Textfield
                  onChangeText={(text) => setVerificationCode(text)}
                  placeholder="Enter 6-digit code"
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </>
            )}

            <Spacer height={48} />

            <Button
              onPress={isVerifying ? verifyPhoneNumber : signInWithPhone}
              style={[defaultStyles.button, defaultStyles.buttonShadow]}>
              <Text style={defaultStyles.buttonLabel}>
                {isVerifying ? 'Verify Code' : 'Sign up'}
              </Text>
            </Button>

            <Spacer height={16} />

            <Text className="leading-5">
              By signing up, you agree to our{' '}
              <Text className="text-primary-500">Terms of Service</Text> and{' '}
              <Text className="text-primary-500">Privacy Policy</Text>.
            </Text>
          </View>

          <TouchableOpacity
            className={keyboardStatus === 'Keyboard Shown' ? 'hidden' : 'ml-4 mt-3'}
            onPress={() => setMode('signin')}>
            <Text className="text-center">
              Already have an account? <Text className="text-primary-500">Sign in</Text>
            </Text>
          </TouchableOpacity>

          <Spacer height={16} />

          <TouchableOpacity
            className={keyboardStatus === 'Keyboard Shown' ? 'hidden' : 'ml-4 mt-3'}
            onPress={() => setMode('welcome')}>
            <Text className="text-center text-primary-500">Back to welcome screen</Text>
          </TouchableOpacity>

          <Spacer height={16} />
        </Pageview>
      )}

      {mode === 'welcome' && (
        <View className="flex h-full justify-between">
          <View className="flex">
            <Spacer height={16} />
            <Image source={require('@/assets/images/logo/logo_crushy.png')} className="m-auto" />
            <FlatList
              data={onboardingContent}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              bounces={false}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                useNativeDriver: false,
              })}
            />
            <Pagination count={onboardingContent.length} />
            <Spacer height={64} />
          </View>
          <View className="flex p-6">
            <Button
              onPress={() => setMode('signup')}
              style={[defaultStyles.button, defaultStyles.buttonShadow]}>
              <Text style={defaultStyles.buttonLabel}>Create account</Text>
            </Button>

            <Spacer height={16} />

            <Button
              onPress={() => setMode('signin')}
              style={[defaultStyles.buttonSecondary, defaultStyles.buttonShadow]}>
              <Text style={defaultStyles.buttonSecondaryLabel}>Sign in</Text>
            </Button>
          </View>
          <Spacer height={24} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  passwordInput: {
    flex: 1,
  },
});
