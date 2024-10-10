import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import Avatar from '@/components/Avatar';
import Spacer from '@/components/Spacer';
import { PROFILE_SECTIONS_PRIMARY, PROFILE_SECTIONS_SECONDARY } from '@/constants/Data';

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

function MyProfile() {
  const session = useAuth();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: '',
    age: '',
    avatar_url: '',
  });

  const getProfile = useCallback(async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles_test')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          name: data.name || '',
          age: data.age?.toString() || '',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      getProfile();
    }
  }, [session, getProfile]);

  const handleUpdateProfile = useCallback(
    async (updatedProfile?: Partial<Profile>) => {
      if (!session?.user) {
        Alert.alert('Error', 'No user session found');
        return;
      }

      setIsLoading(true);
      try {
        const updates = {
          id: session.user.id,
          name: profile.name,
          age: parseInt(profile.age) || null,
          avatar_url: updatedProfile?.avatar_url || profile.avatar_url,
          avatar_pixelated_url:
            updatedProfile?.avatar_pixelated_url || profile.avatar_pixelated_url,
          updated_at: new Date(),
        };

        const { error } = await supabase.from('profiles_test').upsert(updates);
        if (error) throw error;

        getProfile();
      } catch (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile');
      } finally {
        setIsLoading(false);
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
      handleUpdateProfile({ avatar_url: originalUrl, avatar_pixelated_url: pixelatedUrl });
    },
    [handleUpdateProfile]
  );

  const renderSectionButton = useCallback(
    ({ title, navigateTo }: { title: string; navigateTo: string }) => (
      <Pressable
        key={title}
        style={styles.sectionButton}
        onPress={() => navigation.navigate(navigateTo)}>
        <Text style={styles.sectionButtonText}>{title}</Text>
      </Pressable>
    ),
    [navigation]
  );

  return (
    <SafeAreaView style={defaultStyles.SafeAreaView}>
      <ScrollView style={defaultStyles.innerContainer}>
        <View style={defaultStyles.pageHeader}>
          <Text style={defaultStyles.pageTitle}>My Profile</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.avatarContainer}>
            {isLoading && <ActivityIndicator size="large" color={Colors.light.primary} />}
            <Avatar size={200} url={profile.avatar_url} onUpload={handleAvatarUpload} />
          </View>
        </View>

        <Spacer height={24} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Essentials (Required)</Text>
          {PROFILE_SECTIONS_PRIMARY.map(renderSectionButton)}
        </View>

        <Spacer height={24} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Details (Optional)</Text>
          {PROFILE_SECTIONS_SECONDARY.map(renderSectionButton)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default MyProfile;

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
    fontFamily: 'BodyBold',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
  },
  sectionButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.tertiary,
  },
  sectionButtonText: {
    fontSize: 16,
    fontFamily: 'BodyBold',
    color: Colors.light.text,
  },
});
