import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Platform,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";

type Conversation = {
  conversation_id: string;
  user2_id: string;
  profiles: {
    user_id: string;
    name: string;
  };
  last_message: string;
  last_message_at: string;
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
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          user2_id,
          profiles:conversations_user2_id_fkey(name),
          last_message,
          last_message_at
        `)
        .eq("user1_id", session?.user.id)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      setConversations(data as Conversation[]);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() =>
        navigation.navigate("ChatView", { conversationId: item.conversation_id, user2_name: item.profiles.name })
      }
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.profiles.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.last_message}
        </Text>
      </View>
      <Text style={styles.time}>
        {new Date(item.last_message_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </TouchableOpacity>
  );

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
          <Text style={defaultStyles.pageTitle}>Inbox</Text>
        </View>

        {conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversations yet.</Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.conversation_id}
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.tertiary,
    alignItems: "center",
    justifyContent: "space-between",
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
