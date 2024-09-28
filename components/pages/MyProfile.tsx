import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Button } from "react-native-ui-lib";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import Avatar from "@/components/Avatar";
import Spacer from "@/components/Spacer";

const PROFILE_SECTIONS_PRIMARY = [
  { title: "My Bio", navigateTo: "EditBio" },
  { title: "My Name & Age", navigateTo: "EditNameAge" },
  { title: "My Gender", navigateTo: "EditGender" },
  { title: "My Pronouns", navigateTo: "EditPronouns" },
  { title: "My Interests", navigateTo: "EditInterests" },
  { title: "I'm looking for", navigateTo: "EditLookingFor" },
];

const PROFILE_SECTIONS_SECONDARY = [
  { title: "Height", navigateTo: "EditHeight" },
  { title: "Body Type", navigateTo: "EditBodyType" },
  { title: "Exercise Frequency", navigateTo: "EditExerciseFrequency" },
  { title: "Smoking Status", navigateTo: "EditSmokingStatus" },
  { title: "Drinking Status", navigateTo: "EditDrinkingStatus" },
  { title: "Cannabis Use", navigateTo: "EditCannabisUse" },
  { title: "Diet Preference", navigateTo: "EditDietPreference" },
  { title: "Education Level", navigateTo: "EditEducationLevel" },
  { title: "Occupation", navigateTo: "EditOccupation" },
  { title: "Relationship Status", navigateTo: "EditRelationshipStatus" },
  { title: "Children", navigateTo: "EditChildren" },
  { title: "Pets", navigateTo: "EditPets" },
  { title: "Languages", navigateTo: "EditLanguages" },
  { title: "Religion", navigateTo: "EditReligion" },
  { title: "Political Views", navigateTo: "EditPoliticalViews" },
  { title: "Zodiac Sign", navigateTo: "EditZodiacSign" },
];

const MyProfile = () => {
  const session = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<Profile>({
    name: "",
    age: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (session?.user) {
      getProfile();
    }
  }, [session]);

  const getProfile = useCallback(async () => {
    setLoading(true);
    try {
      if (!session?.user) {
        throw new Error("No user in the session!");
      }

      const { data, error } = await supabase
        .from("profiles_test")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile({
          name: data.name || "",
          age: data.age ? data.age.toString() : "",
          avatar_url: data.avatar_url || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Optionally, implement user-facing error handling here
    } finally {
      setLoading(false);
    }
  }, [session]);

  const handleUpdateProfile = useCallback(
    async (updatedProfile?: Partial<Profile>) => {
      try {
        setLoading(true);
        if (!session?.user) throw new Error("No user on the session!");

        const updates = {
          id: session.user.id,
          name: profile.name,
          age: parseInt(profile.age) || null,
          avatar_url: updatedProfile?.avatar_url || profile.avatar_url,
          avatar_pixelated_url:
            updatedProfile?.avatar_pixelated_url ||
            profile.avatar_pixelated_url,
          updated_at: new Date(),
        };

        console.log("Updating profile with:", updates);

        const { data, error } = await supabase
          .from("profiles_test")
          .upsert(updates);

        if (error) throw error;

        console.log("Profile updated successfully:", data);

        // Refresh the profile data
        getProfile();
      } catch (error) {
        console.error("Error updating profile:", error);
        Alert.alert("Error", "Failed to update profile");
      } finally {
        setLoading(false);
      }
    },
    [session, getProfile, profile]
  );

  const handleAvatarUpload = useCallback(
    (originalUrl: string, pixelatedUrl: string) => {
      setProfile((prev) => ({
        ...prev,
        avatar_url: originalUrl,
        avatar_pixelated_url: pixelatedUrl,
      }));
      // Automatically save the profile when the avatar is updated
      handleUpdateProfile({
        avatar_url: originalUrl,
        avatar_pixelated_url: pixelatedUrl,
      });
    },
    [handleUpdateProfile]
  );

  const handleInputChange = useCallback(
    (field: keyof Profile, value: string) => {
      setProfile((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const renderSectionButton = (title: string, navigateTo: string) => (
    <Pressable
      key={title}
      style={styles.sectionButton}
      onPress={() => navigation.navigate(navigateTo)}
    >
      <Text style={styles.sectionButtonText}>{title}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={defaultStyles.SafeAreaView}>
      <ScrollView style={defaultStyles.innerContainer}>
        <View style={defaultStyles.pageHeader}>
          <Text style={defaultStyles.pageTitle}>My Profile</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.avatarContainer}>
            {loading && (
              <ActivityIndicator size="large" color={Colors.light.primary} />
            )}
            <Avatar
              size={200}
              url={profile.avatar_url}
              onUpload={handleAvatarUpload}
            />
          </View>
        </View>

        <Spacer height={24} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Essentials (Required)</Text>
          {PROFILE_SECTIONS_PRIMARY.map(({ title, navigateTo }) =>
            renderSectionButton(title, navigateTo)
          )}
        </View>

        <Spacer height={24} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Details (Optional)</Text>
          {PROFILE_SECTIONS_SECONDARY.map(({ title, navigateTo }) =>
            renderSectionButton(title, navigateTo)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyProfile;

// Type Definitions
interface Profile {
  name: string;
  age: string;
  avatar_url: string;
  avatar_pixelated_url?: string;
}

interface ProfileUpdate {
  id: string;
  name: string;
  age: number;
  avatar_url: string;
  updated_at: Date;
}

// Styles
const styles = StyleSheet.create({
  avatarContainer: {
    marginTop: 20,
    minHeight: 250,
  },
  input: {
    backgroundColor: Colors.light.secondary,
    borderWidth: 1,
    borderColor: Colors.light.tertiary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  section: {
    backgroundColor: Colors.light.white,
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "BodyBold",
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
  },
  sectionButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.tertiary,
  },
  sectionButtonText: {
    fontSize: 16,
    fontFamily: "BodyBold",
    color: Colors.light.text,
  },
});
