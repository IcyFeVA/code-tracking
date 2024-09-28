import { Image, StyleSheet, Animated, Pressable, Dimensions, Alert, useWindowDimensions, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Session } from '@supabase/supabase-js';
import { Pageview } from '@/components/ui/Containers';
import Spacer from '@/components/Spacer';
import { FlatList } from 'react-native';
import { View, Card, CardProps, Text, RadioButton, Checkbox, Button } from 'react-native-ui-lib';
import { Textfield } from '@/components/ui/Textfields';
import { Colors } from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import Toast, { ToastRef } from 'react-native-toast-message';
import hobbiesInterests from '@/constants/Interests';
// import BigList from "react-native-big-list"
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow'
import { supabase } from '@/lib/supabase';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/Avatar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
// import { FlashList } from '@shopify/flash-list';
// import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native'
import { useAppContext } from '@/providers/AppProvider';
import { storeData } from '@/utils/storage';
import { isLoading } from 'expo-font';
import { connectUser } from "@/lib/streamChat";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const useOnboardingStore = create((set) => ({
  name: "",
  age: null,
  gender: null,
  pronouns: [],
  relationship: null,
  genderPreferences: null,
  interests: [],
  photoUploaded: false,
  dataUploaded: false,
  onboardingCompleted: false,
  setName: () => set((state: { name: string }) => ({ name: state.name })),
  setAge: () => set((state: { age: string }) => ({ age: state.age })),
  setGender: () =>
    set((state: { gender: string }) => ({ gender: state.gender })),
  setPronouns: () =>
    set((state: { pronouns: object }) => ({ pronouns: state.pronouns })),
  setRelationship: () =>
    set((state: { relationship: string }) => ({
      relationship: state.relationship,
    })),
  setGenderPreferences: () =>
    set((state: { genderPreferences: string }) => ({
      genderPreferences: state.genderPreferences,
    })),
  setInterests: () =>
    set((state: { interests: object }) => ({ interests: state.interests })),
}));

export default function Onboarding() {
  const session = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const flatListRef = useRef(null);
  const { isLoading, setIsLoading } = useAppContext();
  const [listKey, setListKey] = useState(0); // used to force re-render of FlatList
  const [
    name,
    age,
    gender,
    pronouns,
    relationship,
    genderPreferences,
    interests,
    photoUploaded,
    dataUploaded,
    onboardingCompleted,
  ] = useOnboardingStore(
    useShallow((state) => [
      state.name,
      state.age,
      state.gender,
      state.pronouns,
      state.relationship,
      state.genderPreferences,
      state.interests,
      state.photoUploaded,
      state.dataUploaded,
      state.onboardingCompleted,
    ])
  );
  const toastConfig = {
    default: ({ text1, text2, props }) => (
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          width: "94%",
          backgroundColor: Colors.light.accent,
          borderColor: Colors.light.white,
          borderRadius: 8,
          padding: 16,
        }}
      >
        <Text
          style={{
            fontFamily: "HeadingBold",
            color: Colors.light.textInverted,
          }}
        >
          {text1}
        </Text>
        <Text
          style={{
            fontFamily: "BodyRegular",
            color: Colors.light.textInverted,
          }}
        >
          {text2}
        </Text>
      </View>
    ),
  };

  const steps: object[] = [
    { key: "1", title: "Step 1", component: StepName },
    { key: "2", title: "Step 2", component: StepAge },
    { key: "3", title: "Step 3", component: StepGender },
    { key: "4", title: "Step 4", component: StepPronouns },
    { key: "6", title: "Step 6", component: StepRelationship },
    { key: "7", title: "Step 7", component: StepGenderPreferences },
    { key: "8", title: "Step 8", component: StepInterests },
    { key: "9", title: "Step 9", component: StepPhoto },
  ];

  function handleNext() {
    console.log("currentStep:", currentStep);

    if (currentStep === 0) {
      if (name.length < 2) {
        Toast.show({
          type: "default",
          text1: "👋 Hey",
          text2: "Your name is too short",
        });
        return;
      }
      // check if name containes the words crushy or crush or official
      const words = [
        "crushy",
        "crush",
        "official",
        "admin",
        "administrator",
        "moderator",
        "ceo",
        "cmo",
        "cto",
      ];
      const contains = words.some((word) => name.toLowerCase().includes(word));
      if (contains) {
        Toast.show({
          type: "default",
          text1: "👋 Hey",
          text2: "This name is not allowed",
        });
        return;
      }
    }
    if (currentStep === 1) {
      if (age === null || parseInt(age) > 111 || parseInt(age) < 17) {
        Toast.show({
          type: "default",
          text1: "👋 Check your age",
          text2: "You have to be 17 or older to continue",
        });
        return;
      }
    }
    if (currentStep === 2) {
      if (gender === null) {
        Toast.show({
          type: "default",
          text1: "👋 Hey",
          text2: "Please select your gender",
        });
        return;
      }
    }

    if (currentStep === 3) {
      if (pronouns === null || pronouns < 1) {
        Toast.show({
          type: "default",
          text1: "👋 Hey",
          text2: "Please select at least one pronoun",
        });
        return;
      }
    }

    if (currentStep === 4) {
      if (relationship === null || relationship < 1) {
        Toast.show({
          type: "default",
          text1: "👋 Hey",
          text2: "Please select what you are looking for",
        });
        return;
      }
    }

    if (currentStep === 5) {
      if (genderPreferences === null || genderPreferences < 1) {
        Toast.show({
          type: "default",
          text1: "👋 Hey",
          text2: "Please select your gender preferences",
        });
        return;
      }
    }

    if (currentStep === 6) {
      if (interests.length === 0) {
        Toast.show({
          type: "default",
          text1: "👋 Hey",
          text2: "Please select at least one hobby or interest",
        });
        return;
      }
    }

    if (currentStep === 7) {
      if (photoUploaded === false) {
        Toast.show({
          type: "default",
          text1: "👋 Hey",
          text2: "Please upload a photo",
        });
        return;
      } else {
        saveData();
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index: currentStep + 1 });
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index: currentStep - 1 });
      }
    }
  };

  const saveData = async () => {
    console.log("name:", name);
    console.log("age:", age);
    console.log("gender:", gender);
    console.log("pronouns:", pronouns);
    console.log("relationship:", relationship);
    console.log("genderPreferences:", genderPreferences);
    console.log("interests:", interests);

    try {
      const { data, error } = await supabase
        .from("profiles_test")
        .update({
          name: name,
          age: age,
          gender: gender,
          pronouns: pronouns,
          looking_for: relationship,
          gender_preference: genderPreferences,
          interests: interests,
        })
        .eq("id", session?.user.id)
        .select();

      // Create user in Stream Chat
      // await createStreamChatUser(session.user);

      if (error) {
        console.error(error);
      } else {
        console.log(data);
        useOnboardingStore.setState({ dataUploaded: true });
      }
    } catch (error) {
      console.error(error);
    }
  };

  async function createStreamChatUser(user) {
    try {
      await connectUser({ id: user.id, name: name });
      console.log("User created in Stream Chat");
    } catch (error) {
      console.error("Error creating user in Stream Chat:", error);
      // TODO: Handle user creation error
      // Optionally, you might want to delete the Supabase user if Stream Chat user creation fails
      // await supabase.auth.api.deleteUser(user.id);
      throw new Error("Failed to create user in chat system");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View>
        {dataUploaded ? (
          <StepFinal />
        ) : (
          <View className="flex h-full justify-between bg-white">
            <FlatList
              ref={flatListRef}
              data={steps}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              scrollEnabled={false}
              renderItem={({ item }) => React.createElement(item.component)}
              keyExtractor={(item) => item.key}
            />
            <View style={styles.buttonContainer}>
              {currentStep > 0 ? (
                <Button
                  onPress={handleBack}
                  style={[
                    defaultStyles.buttonSecondary,
                    defaultStyles.buttonShadow,
                  ]}
                  disabled={isLoading}
                >
                  <Text style={defaultStyles.buttonSecondaryLabel}>Back</Text>
                </Button>
              ) : (
                <View style={{ width: 16 }}></View>
              )}
              <Button
                onPress={handleNext}
                style={[defaultStyles.button, defaultStyles.buttonShadow]}
                disabled={isLoading}
              >
                <Text style={defaultStyles.buttonLabel}>Next</Text>
              </Button>
            </View>
          </View>
        )}
        <Toast config={toastConfig} />
      </View>
    </SafeAreaView>
  );
};



function Progress({ percent }: { percent: number }) {
    return (
        <View className='w-full h-2 bg-gray-200 rounded-full relative'>
            <View style={{ width: `${percent}%`, backgroundColor: Colors.light.accent }} className='h-2 absolute rounded-full'></View>
        </View>
    )
}


const StepName = () => {
    const [name, setName] = useState<string>('');

    return (
        <View className='p-6 w-screen'>

            <Spacer height={16} />

            <Progress percent={11} />

            <Spacer height={48} />

            <Text style={defaultStyles.h2}>What is your name?</Text>
            <Spacer height={8} />
            <View className=''>
                <Text style={defaultStyles.body}>This will be visible to all users. You can also choose a nickname if you would like.</Text>
            </View>

            <Spacer height={64} />

            <Text style={defaultStyles.inputLabel}>Firstname or Nickname</Text>
            <Spacer height={4} />
            <Textfield
                onChangeText={(text) => useOnboardingStore.setState({ name: text })}
            />
        </View>
    )
};

const StepAge = () => (
    <View className='p-6 w-screen'>
        <Spacer height={16} />

        <Progress percent={22} />

        <Spacer height={48} />

        <Text style={defaultStyles.h2}>How old are you</Text>
        <Spacer height={8} />
        <View className=''>
            <Text style={defaultStyles.body}>You can always change your settings later.</Text>
        </View>

        <Spacer height={64} />

        <Text style={defaultStyles.inputLabel}>Age</Text>
        <Spacer height={4} />
        <Textfield
            className='w-28 text-center'
            placeholder='XX'
            keyboardType='numeric'
            maxLength={3}
            onChangeText={(text) => useOnboardingStore.setState({ age: text })}
        />
    </View>
);

const StepGender = () => {
    const [selectedValue, setSelectedValue] = useState('');

    const handlePress = (value: string) => {
        setSelectedValue(value);
        useOnboardingStore.setState({ gender: value })
        console.log('Gender:', value);
    };

    return (
        <View className='p-6 w-screen'>
            <Spacer height={16} />

            <Progress percent={33} />

            <Spacer height={48} />

            <Text style={defaultStyles.h2}>How do you identify in terms of gender?</Text>
            <Spacer height={8} />
            <View>
                <Text style={defaultStyles.body}>We strive for inclusivity. If you don't see a gender that fits you, please let us know.</Text>
            </View>

            <Spacer height={48} />

            <FlatList
                className='py-4'
                data={[
                    { key: '1', title: 'Male' },
                    { key: '2', title: 'Female' },
                    { key: '3', title: 'Male (Transgender)' },
                    { key: '4', title: 'Female (Transgender)' },
                    { key: '5', title: 'Non-binary' },
                    { key: '6', title: 'Genderqueer' },
                    { key: '7', title: 'Genderfluid' },
                    { key: '8', title: 'Agender' },
                    { key: '9', title: 'Two-Spirit' },
                ]}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <RadioButton
                        label={item.title}
                        size={20}
                        color={selectedValue === item.key ? Colors.light.text : Colors.light.tertiary}
                        contentOnLeft
                        containerStyle={[defaultStyles.radioButton, { borderColor: selectedValue === item.key ? Colors.light.text : Colors.light.tertiary }]}
                        labelStyle={defaultStyles.radioButtonLabel}
                        selected={selectedValue === item.key}
                        onPress={() => handlePress(item.key)}
                    />
                )}
                keyExtractor={item => item.key}
                showsVerticalScrollIndicator={false}
                bounces={false}
            />
        </View >
    );
};

const StepPronouns = () => {
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const handlePress = (value: string) => {
        if (selectedValues.includes(value)) {
            setSelectedValues(selectedValues.filter(item => item !== value));
        } else {
            if (selectedValues.length > 1) {
                Toast.show({
                    type: 'default',
                    text1: '👋 Hey',
                    text2: 'You can only select two pronouns',
                });
                return;
            }
            setSelectedValues([...selectedValues, value]);
        }
    };

    useEffect(() => {
        console.log('Pronouns:', selectedValues);
        useOnboardingStore.setState({ pronouns: selectedValues })
    }, [selectedValues]);

    return (
        <View className='p-6 w-screen'>
            <Spacer height={16} />

            <Progress percent={44} />

            <Spacer height={48} />

            <Text style={defaultStyles.h2}>What are your pronouns? ({selectedValues.length})</Text>
            <Spacer height={8} />
            <View>
                <Text style={defaultStyles.body}>Choose <Text style={defaultStyles.bodyBold}>up to two</Text> pronouns.You will be able to add your own in a future update, if you don't see yours.</Text>
            </View>

            <Spacer height={48} />

            <FlatList
                className='py-4'
                data={[
                    { key: '1', title: 'he/him' },
                    { key: '2', title: 'she/her' },
                    { key: '3', title: 'they/them' },
                    { key: '4', title: 'ze/zir' },
                    { key: '5', title: 'xe/xem' },
                    { key: '6', title: 've/ver' },
                    { key: '7', title: 'ey/em' },
                    { key: '99', title: 'other' },
                ]}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <Pressable onPress={() => handlePress(item.key)}>
                        <Checkbox
                            color={selectedValues.includes(item.key) ? Colors.light.text : Colors.light.tertiary}
                            label={item.title}
                            value={selectedValues.includes(item.key) ? true : false}
                            containerStyle={[defaultStyles.checkboxButton, { borderColor: selectedValues.includes(item.key) ? Colors.light.text : Colors.light.tertiary }]}
                            labelStyle={defaultStyles.checkboxButtonLabel}
                            onValueChange={() => handlePress(item.key)}
                        />
                    </Pressable>
                )}
                keyExtractor={item => item.key}
                showsVerticalScrollIndicator={false}
                bounces={false}
            />
        </View >
    );
};

const StepRelationship = () => {
    const [selectedValue, setSelectedValue] = useState('');

    const handlePress = (value: string) => {
        setSelectedValue(value);
        useOnboardingStore.setState({ relationship: value })
        console.log('Relationship:', value, typeof value);
    };

    return (
        <View className='p-6 w-screen'>
            <Spacer height={16} />

            <Progress percent={55} />

            <Spacer height={48} />

            <Text style={defaultStyles.h2}>What are you looking for right now?</Text>
            <Spacer height={8} />
            <View>
                <Text style={defaultStyles.body}>You can always change your settings later.</Text>
            </View>

            <Spacer height={48} />

            <FlatList
                className='py-4'
                data={[
                    { key: '1', title: 'Relationship' },
                    { key: '2', title: 'Friend' },
                    { key: '3', title: 'Hookup' },
                ]}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <RadioButton
                        label={item.title}
                        size={20}
                        color={selectedValue === item.key ? Colors.light.text : Colors.light.tertiary}
                        contentOnLeft
                        containerStyle={[defaultStyles.radioButton, { borderColor: selectedValue === item.key ? Colors.light.text : Colors.light.tertiary }]}
                        labelStyle={defaultStyles.radioButtonLabel}
                        selected={selectedValue === item.key}
                        onPress={() => handlePress(item.key)}
                    />
                )}
                keyExtractor={item => item.key}
                showsVerticalScrollIndicator={false}
                bounces={false}
            />
        </View >
    );
};

const StepGenderPreferences = () => {
    const [selectedValue, setSelectedValue] = useState('');

    const handlePress = (value: string) => {
        setSelectedValue(value);
        useOnboardingStore.setState({ genderPreferences: value })
        console.log('Gender Preferences:', value);
    };

    return (
        <View className='p-6 w-screen'>
            <Spacer height={16} />

            <Progress percent={66} />

            <Spacer height={48} />

            <Text style={defaultStyles.h2}>What are your gender preferences?</Text>
            <Spacer height={8} />
            <View>
                <Text style={defaultStyles.body}>Please understand that this app is new. We will include more gender filters soon!</Text>
            </View>

            <Spacer height={48} />

            <FlatList
                className='py-4'
                data={[
                    { key: '1', title: 'Female' },
                    { key: '2', title: 'Male' },
                    { key: '3', title: 'Both' },
                ]}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <RadioButton
                        label={item.title}
                        size={20}
                        color={selectedValue === item.key ? Colors.light.text : Colors.light.tertiary}
                        contentOnLeft
                        containerStyle={[defaultStyles.radioButton, { borderColor: selectedValue === item.key ? Colors.light.text : Colors.light.tertiary }]}
                        labelStyle={defaultStyles.radioButtonLabel}
                        selected={selectedValue === item.key}
                        onPress={() => handlePress(item.key)}
                    />
                )}
                keyExtractor={item => item.key}
                showsVerticalScrollIndicator={false}
                bounces={false}
            />
        </View >
    );
};


const categories = [
    "Outdoor Activities",
    "Sports & Fitness",
    "Creative Arts",
    "Entertainment & Media",
    "Culinary Interests",
    "Social Activities",
    "Tech & Science",
    "Intellectual Pursuits",
    "Nature & Animals",
    "Miscellaneous"
];

const StepInterests = () => {
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    const flattenedInterests = React.useMemo(() => {
        return hobbiesInterests.flatMap((section, index) => [
            { type: 'header', title: categories[index] },
            ...section.map(item => ({ type: 'item', ...item }))
        ]);
    }, []);

    const handleInterestToggle = useCallback((value: string) => {
        setSelectedInterests(prevInterests => {
            if (prevInterests.includes(value)) {
                return prevInterests.filter(i => i !== value);
            } else {
                return [...prevInterests, value];
            }
        });
    }, []);

    useEffect(() => {
        useOnboardingStore.setState({ interests: selectedInterests });
        console.log('Interests:', selectedInterests);
    }, [selectedInterests]);

    const renderItem = useCallback(({ item }) => {
        if (item.type === 'header') {
            return (
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>{item.title}</Text>
                </View>
            );
        }

        const isSelected = selectedInterests.includes(item.value);
        return (
            <Pressable onPress={() => handleInterestToggle(item.value)}>
                <Checkbox
                    color={isSelected ? Colors.light.text : Colors.light.tertiary}
                    label={item.label}
                    value={isSelected}
                    containerStyle={[
                        defaultStyles.checkboxButton,
                        { borderColor: isSelected ? Colors.light.text : Colors.light.tertiary }
                    ]}
                    labelStyle={defaultStyles.checkboxButtonLabel}
                    onValueChange={() => handleInterestToggle(item.value)}
                />
            </Pressable>
        );
    }, [selectedInterests, handleInterestToggle]);

    return (
        <View style={styles.container}>
            <Spacer height={16} />
            <Progress percent={77} />
            <Spacer height={48} />
            <Text style={defaultStyles.h2}>Interests ({selectedInterests.length})</Text>
            <Spacer height={8} />
            <View>
                <Text style={defaultStyles.body}>
                    This helps us find people with the same hobbies and interests.
                </Text>
            </View>
            <Spacer height={24} />
            <FlashList
                data={flattenedInterests}
                renderItem={renderItem}
                estimatedItemSize={75}
                keyExtractor={(item, index) => item.type === 'header' ? `header-${index}` : item.value}
                extraData={selectedInterests}
                contentContainerStyle={styles.listContentContainer}
            />
        </View>
    );
};










const StepPhoto = () => {
    const { isLoading, setIsLoading } = useAppContext();
    const [avatarUrl, setAvatarUrl] = useState('');
    const session = useAuth();

    async function pixelateImage(uri: string, pixelBlocks = 15) {
        try {
            const { width, height } = await new Promise((resolve, reject) => {
                Image.getSize(uri,
                    (width, height) => resolve({ width, height }),
                    (error) => reject(error)
                );
            });

            const newWidth = pixelBlocks;
            const newHeight = Math.round((height / width) * pixelBlocks);

            const smallImage = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: newWidth, height: newHeight } }],
                { format: 'jpeg', compress: 1 }
            );

            const pixelatedImage = await ImageManipulator.manipulateAsync(
                smallImage.uri,
                [{ resize: { width, height } }],
                { format: 'jpeg', compress: 1 }
            );

            return pixelatedImage.uri;
        } catch (error) {
            console.error('Error in pixelateImage:', error);
            throw error;
        }
    }

    async function updateProfile({
        avatar_url,
        avatar_pixelated_url,
    }: {
        avatar_url: string;
        avatar_pixelated_url: string;
    }) {
        try {
            setIsLoading(true);
            if (!session?.user) throw new Error('No user on the session!');

            const updates = {
                id: session?.user.id,
                avatar_url,
                avatar_pixelated_url,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles_test').upsert(updates);

            if (error) {
                throw error;
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Profile Update Error', error.message);
            } else {
                Alert.alert('Profile Update Error', 'An unknown error occurred');
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const handleUpload = async () => {
        try {
            setIsLoading(true);

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                setIsLoading(false);
                return;
            }

            const uri = result.assets[0].uri;
            console.log('Image picked:', uri);

            // Read the file as base64
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
            if (!base64) {
                throw new Error('Failed to read image file');
            }
            console.log('Image read as base64');

            // Upload original image
            const originalPath = `${Date.now()}_original.jpg`;
            const { data: originalData, error: originalError } = await supabase.storage
                .from('avatars')
                .upload(originalPath, decode(base64), {
                    contentType: 'image/jpeg'
                });

            if (originalError) throw originalError;
            console.log('Original image uploaded');

            // Create and upload pixelated version
            const pixelatedUri = await pixelateImage(uri, 15);
            const pixelatedBase64 = await FileSystem.readAsStringAsync(pixelatedUri, { encoding: FileSystem.EncodingType.Base64 });
            if (!pixelatedBase64) {
                throw new Error('Failed to read pixelated image file');
            }
            console.log('Pixelated image created and read as base64');

            const pixelatedPath = `${Date.now()}_pixelated.jpg`;
            const { data: pixelatedData, error: pixelatedError } = await supabase.storage
                .from('avatars')
                .upload(pixelatedPath, decode(pixelatedBase64), {
                    contentType: 'image/jpeg'
                });

            if (pixelatedError) throw pixelatedError;
            console.log('Pixelated image uploaded');

            // Get public URLs
            const originalUrl = supabase.storage.from('avatars').getPublicUrl(originalData.path).data.publicUrl;
            const pixelatedUrl = supabase.storage.from('avatars').getPublicUrl(pixelatedData.path).data.publicUrl;

            // Update profile
            await updateProfile({ avatar_url: originalUrl, avatar_pixelated_url: pixelatedUrl });

            setAvatarUrl(originalUrl);
            useOnboardingStore.setState({ photoUploaded: true });
            console.log('Profile updated successfully');
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Upload Error', error.message);
            } else {
                Alert.alert('Upload Error', 'An unknown error occurred');
            }
            console.error('Error in handleUpload:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to decode base64
    function decode(base64: string) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let bufferLength = base64.length * 0.75,
            length = base64.length, i, p = 0,
            encoded1, encoded2, encoded3, encoded4;

        const bytes = new Uint8Array(bufferLength);

        for (i = 0; i < length; i += 4) {
            encoded1 = chars.indexOf(base64[i]);
            encoded2 = chars.indexOf(base64[i + 1]);
            encoded3 = chars.indexOf(base64[i + 2]);
            encoded4 = chars.indexOf(base64[i + 3]);

            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }

        return bytes.buffer;
    }

    return (
        <View className='p-6 w-screen'>
            <Spacer height={16} />
            <Progress percent={88} />
            <Spacer height={48} />
            <Text style={defaultStyles.h2}>Your Photo</Text>
            <Spacer height={8} />
            <View>
                <Text style={defaultStyles.body}>
                    You can only add one. So, make it count :)
                </Text>
            </View>
            <Spacer height={24} />
            <View style={styles.avatarContainer}>
                {avatarUrl ? (
                    <Image
                        source={{ uri: avatarUrl }}
                        style={styles.avatar}
                    />
                ) : (
                    <TouchableOpacity onPress={handleUpload} disabled={isLoading}>
                        <View style={styles.placeholderAvatar}>
                            <Text>{isLoading ? 'Uploading...' : 'Tap to upload'}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};








const StepFinal = () => {
    const navigation = useNavigation();
    const { showOnboarding, setShowOnboarding } = useAppContext();


    const [relationshipType] = useOnboardingStore(
        useShallow((state) => [state.relationship]),
    )
    console.log('relationshipType', relationshipType)

    let subHeading = `Since you chose to look for a relationship, “Dive mode” was automatically activated.`
    if (relationshipType == 2) {
        subHeading = `Since you chose to look for friendship, "Dive mode" was automatically activated. You can change this in your settings.`
    } else if (relationshipType == 3) {
        subHeading = `Since you are looking for a hookup, “Surf mode” has been activated.`
    }

    const finalSlidesContent = [
        {
            id: 1,
            title: 'Step 1',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            image: require('@/assets/images/onboarding/onboarding3.png'),
        },
        {
            id: 2,
            title: 'Step 2',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            image: require('@/assets/images/onboarding/onboarding4.png'),
        },
    ]




    interface OnboardingItem {
        id: number;
        title: string;
        description: string;
        image: ImageSourcePropType;
    }

    const { width } = useWindowDimensions();

    function renderItem({ item }: { item: OnboardingItem }) {
        return (
            <View className='' >
                <Image source={item.image} style={{ width }} />
            </View >
        )

    }


    const scrollX = useRef(new Animated.Value(0)).current;

    const Pagination = ({ count }: { count: number }) => {
        return (
            <View className='flex-row justify-center'>
                {Array(count).fill(0).map((_, index) => {
                    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
                    const dotColor = scrollX.interpolate({
                        inputRange,
                        outputRange: ['#cccccc', '#7A37D0', '#cccccc'],
                        extrapolate: 'clamp'
                    });
                    return (
                        <Animated.View
                            key={index}
                            className='w-2 h-2 mx-1 rounded-full'
                            style={{ backgroundColor: dotColor }}
                        />
                    );
                })}
            </View>
        );
    };

    const handleDone = async () => {
        useOnboardingStore.setState({ dataUploaded: true, onboardingCompleted: true });

        console.log('onboarding done, saving it in storage');
        await storeData('onboardingComplete', true);
        setShowOnboarding(false)
    }



    return (
        <View className='w-screen flex justify-between h-full bg-white'>
            <View className='flex just'>
                <View className='p-6 pb-0'>
                    <Spacer height={24} />
                    <Text style={defaultStyles.h2}>You are all set!</Text>
                    <Spacer height={8} />
                    <Text style={defaultStyles.body}>{subHeading}</Text>
                </View>
                <FlatList
                    data={finalSlidesContent}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                />
                <Pagination count={finalSlidesContent.length} />
            </View>
            <View className='p-6'>
                <Button onPress={handleDone} style={[defaultStyles.button, defaultStyles.buttonShadow]}>
                    <Text style={defaultStyles.buttonLabel}>Got it</Text>
                </Button>
            </View>
        </View>
    );
};



const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    container: {
        flex: 1,
        width: SCREEN_WIDTH,
        paddingHorizontal: 16,
    },
    listContentContainer: {
        paddingBottom: 16,
    },
    sectionHeader: {
        backgroundColor: Colors.light.background,
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.tertiary,
        width: '100%',
    },
    sectionHeaderText: {
        fontFamily: 'HeadingBold',
        fontSize: 18,
        color: Colors.light.accent,
    },
    checkboxContainer: {
        width: '100%',
        paddingVertical: 8,
    },
    checkbox: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        backgroundColor: Colors.light.background,
    },
    checkboxLabel: {
        fontFamily: 'BodyRegular',
        fontSize: 16,
        color: Colors.light.text,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 8,
    },
    avatarContainer: {
        alignItems: 'center',
    },
    avatar: {
        width: 200,
        height: 300,
        borderRadius: 16,
        resizeMode: 'cover',
    },
    placeholderAvatar: {
        width: 200,
        height: 300,
        borderRadius: 16,
        backgroundColor: Colors.light.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.tertiary,
    },
});



