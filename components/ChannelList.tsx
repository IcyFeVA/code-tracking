import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/api/supabaseApi";
import { Colors } from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { supabase } from "@/lib/supabase";
import { useTabFocus } from "@/hooks/useTabFocus";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useNotifications } from "@/contexts/NotificationContext";

const Tab = createMaterialTopTabNavigator();

type Conversation = {
  conversation_id: string;
  user2_id: string;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
};

type Match = {
  id: string;
  user2_id: string;
  other_user_name: string;
  created_at: string;
};

const startConversationForMatch = async (matchId: string) => {
  const { data, error } = await supabase.rpc("create_conversation_for_match", {
    match_id: matchId,
  });

  if (error) throw error;

  return data; // This will be the conversation_id
};

function MatchesTab() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const session = useAuth();
  const { refreshKey, refresh } = useTabFocus();

  const fetchMatches = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("matches")
        .select(
          `id,
          user2_id,
          profiles_test!matches_user2_id_fkey(name),
          created_at`
        )
        .eq("user1_id", session.user.id)
        .not("matched_at", "is", null)
        .order("matched_at", { ascending: false });

      if (error) throw error;

      setMatches(
        data.map((match) => ({
          ...match,
          other_user_name: match.profiles_test.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches, refreshKey]);

  const handleStartConversation = async (
    matchId: string,
    otherUserId: string,
    otherUserName: string,
    existingConversationId: string | null
  ) => {
    try {
      let conversationId = existingConversationId;

      if (!conversationId) {
        const { data, error } = await supabase.rpc(
          "create_conversation_for_match",
          {
            match_id: matchId,
          }
        );

        if (error) throw error;
        conversationId = data;
      }

      if (conversationId) {
        navigation.navigate("ChatChannel", {
          conversationId,
          otherUserId,
          otherUserName,
        });
        fetchMatches(); // Refresh the matches list
      } else {
        console.error("No conversation ID returned");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const renderMatchItem = ({ item }: { item: Match }) => (
    <View style={styles.matchItem}>
      <Text style={styles.userName}>{item.other_user_name}</Text>
      <Text style={styles.matchedAt}>
        Matched on {new Date(item.created_at).toLocaleDateString()}
      </Text>
      <Pressable
        style={styles.startChatButton}
        onPress={() =>
          handleStartConversation(item.id, item.user2_id, item.other_user_name)
        }
      >
        <Text style={styles.startChatButtonText}>Chat</Text>
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={defaultStyles.innerContainer}>
      {matches.length > 0 ? (
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <Text style={styles.noMatchesText}>Nothing new here...</Text>
      )}
    </View>
  );
}

function ChatsTab() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const session = useAuth();
  const { refreshKey, refresh } = useTabFocus();
  const { unreadMessages } = useNotifications();

  // Add this effect to refetch conversations when there are new unread messages
  React.useEffect(() => {
    if (unreadMessages > 0) {
      fetchConversations();
    }
  }, [unreadMessages]);

  useEffect(() => {
    if (session?.user) {
      fetchConversations();
    } else {
      setLoading(false); // Set loading to false if there's no session
    }
  }, [session, refreshKey]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await api.getRecentConversations(session.user.id);
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <Pressable
      style={styles.conversationItem}
      onPress={() =>
        navigation.navigate("ChatChannel", {
          conversationId: item.conversation_id,
          otherUserId: item.user2_id,
          otherUserName: item.other_user_name,
        })
      }
    >
      <Text style={styles.userName}>{item.other_user_name}</Text>
      <Text numberOfLines={1} style={styles.lastMessage}>
        {item.last_message}
      </Text>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={defaultStyles.innerContainer}>
      {conversations.length > 0 ? (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.conversation_id}
        />
      ) : (
        <Text style={styles.noConversationsText}>No conversations yet</Text>
      )}
    </View>
  );
}

export default function Inbox() {
  const { newMatches, unreadMessages, resetNotifications } = useNotifications();

  React.useEffect(() => {
    // Reset notifications when entering the Inbox
    resetNotifications();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={defaultStyles.pageHeader}>
        <Text style={defaultStyles.pageTitle}>Inbox</Text>
      </View>
      <GestureHandlerRootView>
        <Tab.Navigator
          initialRouteName="Chats"
          screenOptions={{
            tabBarScrollEnabled: false,
            tabBarInactiveTintColor: Colors.light.text,
            tabBarActiveTintColor: Colors.light.text,
            tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
            tabBarIndicatorStyle: {
              backgroundColor: Colors.light.text,
              height: 2,
            },
            tabBarAndroidRipple: { borderless: false },
            swipeEnabled: true,
          }}
        >
          <Tab.Screen
            name="Matches"
            component={MatchesTab}
            options={{
              tabBarLabel: ({ color }) => (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ color, fontWeight: "bold", fontSize: 16 }}>
                    Activity
                  </Text>
                  {newMatches > 0 && (
                    <View
                      style={{
                        backgroundColor: Colors.light.primary,
                        borderRadius: 10,
                        width: 20,
                        height: 20,
                        justifyContent: "center",
                        alignItems: "center",
                        marginLeft: 5,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 12 }}>
                        {newMatches}
                      </Text>
                    </View>
                  )}
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="Chats"
            component={ChatsTab}
            options={{
              tabBarLabel: ({ color }) => (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ color, fontWeight: "bold", fontSize: 16 }}>
                    Conversations
                  </Text>
                  {unreadMessages > 0 && (
                    <View
                      style={{
                        backgroundColor: Colors.light.primary,
                        borderRadius: 10,
                        width: 20,
                        height: 20,
                        justifyContent: "center",
                        alignItems: "center",
                        marginLeft: 5,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 12 }}>
                        {unreadMessages}
                      </Text>
                    </View>
                  )}
                </View>
              ),
            }}
          />
        </Tab.Navigator>
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  matchItem: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.tertiary,
  },
  conversationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.tertiary,
    backgroundColor: Colors.light.white,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  matchedAt: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 10,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  startChatButton: {
    backgroundColor: Colors.light.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  startChatButtonText: {
    color: Colors.light.textInverted,
    fontWeight: "bold",
  },
  noMatchesText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  noConversationsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});
