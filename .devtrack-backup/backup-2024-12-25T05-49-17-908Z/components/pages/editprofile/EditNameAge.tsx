import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "react-native-ui-lib";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import Spacer from "@/components/Spacer";

const EditNameAge = () => {
  const session = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<Profile>({
    name: "",
    age: "",
  });

  const isNameValid = /^[^\s][^\s]{1,}(?!\s{2,})[^\s]+$/.test(
    profile.name.trim()
  );
  const isAgeValid = /^(1[7-9]|[2-9]\d|100)$/.test(profile.age.trim());

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
        .select("name, age")
        .eq("id", session.user.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile({
          name: data.name || "",
          age: data.age ? data.age.toString() : "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [session]);

  const handleUpdateProfile = useCallback(async () => {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session.user.id,
        name: profile.name,
        age: parseInt(profile.age) || null,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles_test").upsert(updates);

      if (error) throw error;

      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }, [session, profile, navigation]);

  const handleInputChange = useCallback(
    (field: keyof Profile, value: string) => {
      setProfile((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  if (loading) {
    return (
      <SafeAreaView style={defaultStyles.SafeAreaView}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={defaultStyles.SafeAreaView}>
      <View style={defaultStyles.innerContainer}>
        <View style={defaultStyles.pageHeader}>
          <Text style={defaultStyles.pageTitle}>Edit Name & Age</Text>
        </View>

        <View style={styles.section}>
          <Text style={defaultStyles.inputLabel}>Firstname or Nickname</Text>
          <Spacer height={8} />
          <TextInput
            style={styles.input}
            value={profile.name}
            onChangeText={(text) => handleInputChange("name", text)}
            placeholder="Name"
            placeholderTextColor={Colors.light.tertiary}
            maxLength={20}
          />

          <Spacer height={16} />

          <Text style={defaultStyles.inputLabel}>My age</Text>
          <Spacer height={8} />
          <TextInput
            style={[styles.input, styles.ageInput]}
            value={profile.age}
            onChangeText={(text) => handleInputChange("age", text)}
            placeholder="Age"
            keyboardType="numeric"
            maxLength={3}
            placeholderTextColor={Colors.light.tertiary}
          />

          <Spacer height={24} />

          <Button
            onPress={handleUpdateProfile}
            style={[
              defaultStyles.button,
              defaultStyles.buttonShadow,
              (!isNameValid || !isAgeValid) && defaultStyles.disabledButton,
            ]}
            disabled={loading || !isNameValid || !isAgeValid}
          >
            <Text
              style={[
                defaultStyles.buttonLabel,
                (!isNameValid || !isAgeValid) &&
                  defaultStyles.disabledButtonText,
              ]}
            >
              {loading ? "Updating ..." : "Update Name & Age"}
            </Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EditNameAge;

// Type Definitions
interface Profile {
  name: string;
  age: string;
}

// Styles
const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.light.white,
    borderRadius: 8,
    padding: 8,
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
  ageInput: {
    width: 120,
    textAlign: "center",
  },
});
