import React, { useState, useCallback } from "react";
import { View, Text, SectionList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { defaultStyles } from "@/constants/Styles";

interface HistoryItem {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAge: number;
  otherUserAvatar: string;
  otherUserPixelatedAvatar: string;
  isLiked: number;
  interactionDate: string;
  interactionMode: number;
}

interface SectionData {
  title: string;
  data: HistoryItem[];
}

export default function History() {
  const [historyItems, setHistoryItems] = useState<SectionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  const fetchHistoryItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: currentUser, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('interactions')
        .select(`
          id,
          other_user_id,
          is_liked,
          interaction_date,
          interaction_mode,
          profiles_test:other_user_id (name, age, avatar_url, avatar_pixelated_url)
        `)
        .eq('user_id', currentUser.user.id)
        .order('interaction_date', { ascending: false });

      if (error) throw error;

      const formattedData: HistoryItem[] = data ? data.map(item => ({
        id: item.id,
        otherUserId: item.other_user_id,
        otherUserName: item.profiles_test.name,
        otherUserAge: item.profiles_test.age,
        otherUserAvatar: item.profiles_test.avatar_url,
        otherUserPixelatedAvatar: item.profiles_test.avatar_pixelated_url,
        isLiked: item.is_liked,
        interactionDate: item.interaction_date,
        interactionMode: item.interaction_mode,
      })) : [];

      const groupedData = groupHistoryItemsByDate(formattedData);
      setHistoryItems(groupedData);
    } catch (error) {
      console.error("Error fetching history items:", error);
      setHistoryItems([]); // Set to empty array in case of error
      // TODO: Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistoryItems();
    }, [fetchHistoryItems])
  );

  function groupHistoryItemsByDate(items: HistoryItem[]): SectionData[] {
    const grouped: { [key: string]: HistoryItem[] } = {};
    const now = new Date();

    items.forEach(item => {
      const date = new Date(item.interactionDate);
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));

      let key: string;
      if (diffDays === 0) key = "Today";
      else if (diffDays === 1) key = "Yesterday";
      else if (diffDays < 7) key = "This Week";
      else if (diffDays < 30) key = "This Month";
      else key = "Older";

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }

  function renderHistoryItem({ item }: { item: HistoryItem }) {
    const avatarSource = item.interactionMode === 3
      ? { uri: item.otherUserAvatar }
      : { uri: item.otherUserPixelatedAvatar };

    const lookingFor = item.interactionMode === 3 ? 'surf' : 'dive';

    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => navigation.navigate('UserProfile', { 
          userId: item.otherUserId,
          looking_for: lookingFor
        })}
      >
        <Image source={avatarSource} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.otherUserName}, {item.otherUserAge}</Text>
          <Text style={styles.interactionDate}>{new Date(item.interactionDate).toLocaleDateString()}</Text>
        </View>
        <Ionicons
          name={item.isLiked ? "heart" : "heart-dislike"}
          size={24}
          color={item.isLiked ? "red" : "gray"}
        />
      </TouchableOpacity>
    );
  }

  function renderSectionHeader({ section: { title } }: { section: SectionData }) {
    return (
      <View style={defaultStyles.section}>
        <Text style={defaultStyles.sectionTitle}>{title}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={defaultStyles.SafeAreaView}>
      <View style={defaultStyles.pageHeader}>
        <Text style={defaultStyles.pageTitle}>History</Text>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <SectionList
          sections={historyItems}
          renderItem={renderHistoryItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  interactionDate: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
