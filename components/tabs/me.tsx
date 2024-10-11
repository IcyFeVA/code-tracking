import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import Spacer from "@/components/Spacer";
import { Button } from "react-native-ui-lib";
import { Alert } from "react-native";
import { clearAllStorage } from "@/utils/storage";

export default function Me() {
  const session = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    avatar_url: "",
    membership: "Free", // You might want to fetch this from the database
  });

  useEffect(() => {
    if (session?.user) getProfile();
  }, [session]);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      if (!session?.user) {
        console.log("No user on the session, skipping profile fetch");
        return; // Exit early if there's no user
      }

      const { data, error, status } = await supabase
        .from("profiles_test")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error && status !== 406) throw error;

      if (data) {
        setProfile({
          ...profile,
          name: data.name || "",
          age: data.age ? data.age.toString() : "",
          avatar_url: data.avatar_url
            ? data.avatar_url.includes("supabase")
              ? data.avatar_url
              : `https://mmarjzhissgpyfwxudqd.supabase.co/storage/v1/object/public/avatars/${data.avatar_url}`
            : "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, [session, profile]); // Add dependencies

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getProfile().finally(() => setRefreshing(false));
  }, [getProfile]);

  const renderSectionButton = (title: string, onPress: () => void) => (
    <Pressable style={styles.sectionButton} onPress={onPress}>
      <Text style={styles.sectionButtonText}>{title}</Text>
    </Pressable>
  );

  const handleLogout = async () => {
    try {
      setLoading(true);

      // Clear any stored session data
      clearAllStorage();

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert(
        "Error",
        "An error occurred while signing out. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={defaultStyles.SafeAreaView}>
      <ScrollView
        style={defaultStyles.innerContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={defaultStyles.pageHeader}>
          <Text style={defaultStyles.pageTitle}>My Crushy</Text>
        </View>

        <Spacer height={8} />

        <View style={styles.profileSection}>
          <Image
            source={{
              uri: profile.avatar_url || 'https://via.placeholder.com/100',
            }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile.name}, {profile.age}
            </Text>
            <Text style={styles.membershipType}>{profile.membership} Membership</Text>
          </View>
        </View>

        <Spacer height={24} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          {renderSectionButton('My Profile', () => navigation.navigate('MyProfile'))}
          {renderSectionButton('Account', () => {})}
          {renderSectionButton('Blocked Profiles', () => navigation.navigate('BlockedUsers'))}
        </View>

        <Spacer height={24} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More</Text>
          {renderSectionButton('App Settings', () => {})}
          {renderSectionButton('Feedback', () => {})}
          {renderSectionButton('Contact', () => {})}
          {renderSectionButton('Terms of Service', () => {})}
          {renderSectionButton('Privacy Policy', () => {})}
        </View>

        <Spacer height={24} />

        <Button
          onPress={handleLogout}
          style={[defaultStyles.button, defaultStyles.buttonShadow]}
          disabled={loading}>
          <Text style={defaultStyles.buttonLabel}>{loading ? 'Logging out...' : 'Log out'}</Text>
        </Button>

        <Spacer height={24} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: Colors.light.white,
    borderRadius: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontFamily: "HeadingBold",
    color: Colors.light.text,
  },
  membershipType: {
    fontSize: 16,
    fontFamily: "BodyBold",
    color: Colors.light.accent,
  },
  section: {
    backgroundColor: Colors.light.white,
    borderRadius: 8,
    padding: 8,
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
