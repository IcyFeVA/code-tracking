import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  TouchableOpacity,
  Keyboard,
  StatusBar,
  TextInput,
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

  function formatPhoneNumber(input: string): string {
    // Remove all non-digit characters
    const digitsOnly = input.replace(/\D/g, '');
    
    // Format the number
    if (digitsOnly.length <= 3) {
      return digitsOnly;
    } else if (digitsOnly.length <= 6) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
    } else {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
    }
  }

  function handlePhoneChange(text: string) {
    const formattedNumber = formatPhoneNumber(text);
    setPhoneNumber(`+1${formattedNumber}`);
  }

  function isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+1\(\d{3}\)\s\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  }

  function getE164PhoneNumber(phone: string): string {
    // Remove all non-digit characters and ensure it starts with +1
    return '+1' + phone.replace(/\D/g, '').slice(-10);
  }

  async function signInWithPhone() {
    if (!isValidPhoneNumber(phoneNumber)) {
      Alert.alert('Error', 'Invalid phone number');
      return;
    }
    setLoading(true);
    const e164PhoneNumber = getE164PhoneNumber(phoneNumber);
    console.log('Sending phone number:', e164PhoneNumber);

    try {
      if (mode === 'signup') {
        // Attempt to sign up
        const { data, error } = await supabase.auth.signUp({
          phone: e164PhoneNumber,
          password: generateRandomPassword(),
        });

        if (error && error.message.includes('User already registered')) {
          Alert.alert(
            'Account Exists',
            'An account with this phone number already exists. Would you like to go to the sign in page instead?',
            [
              {
                text: 'Cancel',
                style: 'cancel'
              },
              {
                text: 'Go to Page',
                onPress: () => {
                  setMode('signin');
                }
              }
            ]
          );
          setLoading(false);
          return;
        } else if (error) {
          throw error;
        }
      }

      // Proceed with OTP sending (for both signin and successful signup)
      const { error } = await supabase.auth.signInWithOtp({
        phone: e164PhoneNumber,
      });

      if (error) throw error;

      console.log('OTP sent successfully');
      setIsVerifying(true);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  }

  function generateRandomPassword() {
    return Math.random().toString(36).slice(-8);
  }

  async function verifyPhoneNumber() {
    if (verificationCode.length !== 6) {
      Alert.alert('Invalid code', 'Please enter a 6-digit code');
      return;
    }
    setLoading(true);
    console.log('Verifying phone number:', phoneNumber);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: getE164PhoneNumber(phoneNumber),
      token: verificationCode,
      type: 'sms',
    });

    if (error) {
      Alert.alert('Error', error.message);
      console.log('Error', error.message);
    } else {
      // User is now signed in
      console.log('User signed in successfully', data);
      // You can redirect the user or update the UI here
    }
    setLoading(false);
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
            <View className="flex-row items-center">
              <View className="bg-gray-200 px-3 py-2 rounded-l-md h-12">
                <Text className="text-lg">+1</Text>
              </View>
              <Textfield
                className="flex-1"
                style={[styles.phoneInput, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]  }
                onChangeText={handlePhoneChange}
                value={phoneNumber.slice(2)}
                placeholder="(555) 555-5555"
                keyboardType="phone-pad"
                maxLength={14}  // (123) 456-7890
              />
            </View>

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
            <View className="flex-row items-center">
              <View className="bg-gray-200 px-3 py-2 rounded-l-md h-12">
                <Text className="text-lg">+1</Text>
              </View>
              <Textfield
                className="flex-1"
                style={[styles.phoneInput, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]  }
                onChangeText={handlePhoneChange}
                value={phoneNumber.slice(2)}
                placeholder="(555) 555-5555"
                keyboardType="phone-pad"
                maxLength={14}  // (123) 456-7890
              />
            </View>

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
  phoneInput: {
    fontSize: 16,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
});
