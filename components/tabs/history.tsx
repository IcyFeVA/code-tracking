import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
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

export default function History() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchHistoryItems();
  }, []);

  async function fetchHistoryItems() {
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

      const formattedData: HistoryItem[] = data.map(item => ({
        id: item.id,
        otherUserId: item.other_user_id,
        otherUserName: item.profiles_test.name,
        otherUserAge: item.profiles_test.age,
        otherUserAvatar: item.profiles_test.avatar_url,
        otherUserPixelatedAvatar: item.profiles_test.avatar_pixelated_url,
        isLiked: item.is_liked,
        interactionDate: item.interaction_date,
        interactionMode: item.interaction_mode,
      }));

      setHistoryItems(formattedData);
    } catch (error) {
      console.error("Error fetching history items:", error);
      // TODO: Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  }

  function renderHistoryItem({ item }: { item: HistoryItem }) {
    const avatarSource = item.interactionMode === 3
      ? { uri: item.otherUserAvatar }
      : { uri: item.otherUserPixelatedAvatar };


    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => navigation.navigate('UserProfile', { 
          userId: item.otherUserId,
          looking_for: item.interactionMode
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
        <FlatList
          data={historyItems}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
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
});
