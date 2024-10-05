import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { formatDistanceToNow, isToday, format } from 'date-fns';
import Spacer from "@/components/Spacer";

type Conversation = {
  id: string;
  user2_id: string;
  profiles: {
    user_id: string;
    name: string;
    avatar_url: string;
    avatar_pixelated_url: string;
  };
  last_message: string;
  last_message_at: string;
  looking_for: number;
  matched_at: string;
};

export default function Inbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const session = useAuth();

  useEffect(() => {
    if (session?.user?.id) {
      setIsAuthenticated(true);
      fetchConversations();
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [session]);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      // First, fetch the matches for the current user
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('id, user2_id, looking_for, matched_at')
        .eq('user1_id', session?.user.id);

      if (matchesError) throw matchesError;

      // Now fetch the conversations based on the ids from matches
      const conversationIds = matchesData.map(match => match.id);
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          last_message,
          last_message_at
        `)
        .in('id', conversationIds)
        .order('last_message_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      // Fetch profiles for user2_ids
      const user2Ids = matchesData.map(match => match.user2_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles_test')
        .select('id, name, avatar_url, avatar_pixelated_url')
        .in('id', user2Ids);

      if (profilesError) throw profilesError;

      // Combine the data
      const transformedData: Conversation[] = conversationsData.map(conversation => {
        const match = matchesData.find(m => m.id === conversation.id);
        const profile = profilesData.find(p => p.id === match?.user2_id);

        return {
          id: conversation.id,
          user2_id: match?.user2_id || '',
          profiles: {
            user_id: match?.user2_id || '',
            name: profile?.name || '',
            avatar_url: profile?.avatar_url || '',
            avatar_pixelated_url: profile?.avatar_pixelated_url || '',
          },
          last_message: conversation.last_message || '',
          last_message_at: conversation.last_message_at || '',
          looking_for: match?.looking_for || 0,
          matched_at: match?.matched_at || '',
        };
      });
      // console.log(transformedData);
      setConversations(transformedData);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const avatarSource =
      item.looking_for === 1 || item.looking_for === 2
        ? { uri: item.profiles.avatar_pixelated_url }
        : { uri: item.profiles.avatar_url };

    const formattedDate = formatDistanceToNow(new Date(item.matched_at), { addSuffix: true });

    if (item.last_message_at === "") {
      return (
        <TouchableOpacity
          style={styles.conversationItem}
          onPress={() =>
            navigation.navigate("ChatView", { conversationId: item.id, user2_name: item.profiles.name })
          }
        >
          <Image
            source={avatarSource}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.profiles.name}</Text>
              <Text style={{ color: Colors.light.success, fontWeight: "bold", marginTop: 4 }} numberOfLines={1}>
                START CHAT
              </Text>
          </View>
          <Text style={styles.time}>
            {formattedDate}
          </Text>
        </TouchableOpacity>
      );
    };

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() =>
          navigation.navigate("ChatView", { conversationId: item.id, user2_name: item.profiles.name })
        }
      >
        <Image
          source={avatarSource}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.profiles.name}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.last_message}
          </Text>
        </View>
        <Text style={styles.time}>
          {isToday(new Date(item.last_message_at)) ? new Date(item.last_message_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }) : formattedDate}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>You need to log in to view conversations.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={defaultStyles.SafeAreaView}>
      <View style={defaultStyles.innerContainer}>
        <View style={defaultStyles.pageHeader}>
          <Text style={defaultStyles.pageTitle}>Messages</Text>
        </View>

        <Spacer height={16} />

        {conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversations yet.</Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={renderConversationItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  conversationItem: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.tertiary,
    marginBottom: 8,
  },
  newConversationItem: {
    flexDirection: "row",
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    marginBottom: 8,
  },
  avatar: { // Added avatar style
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.light.text,
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: Colors.light.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: Colors.light.text,
  },
  listContent: {
    paddingBottom: 20,
  },
});