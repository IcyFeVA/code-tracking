import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect, useRoute } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { formatDistanceToNow, isToday, format } from 'date-fns';
import Spacer from '@/components/Spacer';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@/components/ui/Dropdown';
import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';

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
  match_id: string;
  matched_at: string;
  blocked_by: string | null;
  unread_count: number; // Add this new field
};

export function Menu() {
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const route = useRoute();

  return (
    <DropdownMenuRoot open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Pressable>
          <Ionicons name="ellipsis-vertical" size={24} color={Colors.light.primary} />
        </Pressable>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem key="blockedUsers" onSelect={() => navigation.navigate('BlockedUsers')}>
          <DropdownMenuItemTitle>Blocked Users</DropdownMenuItemTitle>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}

export default function Inbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigation = useNavigation();
  const session = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(() => {
    if (session?.user?.id) {
      setIsAuthenticated(true);
      fetchConversations();
    } else {
      setIsAuthenticated(false);
    }
  }, [session]);

  const debouncedFetchConversations = useCallback(
    debounce(() => {
      if (session?.user?.id) {
        fetchConversations();
      }
    }, 300),
    [session?.user?.id]
  );

  useFocusEffect(
    useCallback(() => {
      debouncedFetchConversations();
      return () => debouncedFetchConversations.cancel();
    }, [debouncedFetchConversations])
  );

  useEffect(() => {
    if (session?.user?.id) {
      const subscription = supabase
        .channel('conversations')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
          },
          () => {
            fetchConversations();
          }
        )
        .subscribe();

      // Set up interval for checking new matches/conversations
      const intervalId = setInterval(
        () => {
          fetchNewConversations();
        },
        2 * 60 * 1000
      ); // 2 minutes in milliseconds

      return () => {
        supabase.removeChannel(subscription);
        clearInterval(intervalId);
      };
    }
  }, [session?.user?.id]);

  const fetchConversations = async () => {
    if (!session?.user?.id) {
      console.log('User session not available');
      return;
    }

    try {
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id, looking_for, matched_at, blocked_by')
        .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
        .not('matched_at', 'is', null)
        .is('blocked_by', null)
        .eq('user1_action', 1)
        .eq('user2_action', 1);

      if (matchesError) throw matchesError;

      const conversationIds = matchesData.map((match) => match.id);
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('id, last_message, last_message_at')
        .in('id', conversationIds)
        .order('last_message_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      const user2Ids = matchesData.map((match) =>
        match.user2_id === session?.user?.id ? match.user1_id : match.user2_id
      );
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles_test')
        .select('id, name, avatar_url, avatar_pixelated_url')
        .in('id', user2Ids);

      if (profilesError) throw profilesError;

      const { data: unreadMessages, error: unreadMessagesError } = await supabase
        .from('messages')
        .select('conversation_id, id')
        .eq('recipient_id', session?.user?.id)
        .eq('read', false);

      if (unreadMessagesError) throw unreadMessagesError;

      const unreadCounts = unreadMessages.reduce((acc, message) => {
        acc[message.conversation_id] = (acc[message.conversation_id] || 0) + 1;
        return acc;
      }, {});

      const updatedData: Conversation[] = conversationsData.map((conversation) => {
        const match = matchesData.find((m) => m.id === conversation.id);
        const profile = profilesData.find(
          (p) => p.id === (match.user2_id === session?.user?.id ? match.user1_id : match.user2_id)
        );
        const unreadCount = unreadCounts[conversation.id] || 0;

        return {
          id: conversation.id,
          user2_id: match.user2_id === session?.user?.id ? match.user1_id : match.user2_id,
          profiles: {
            user_id: match.user2_id === session?.user?.id ? match.user1_id : match.user2_id,
            name: profile?.name || '',
            avatar_url: profile?.avatar_url || '',
            avatar_pixelated_url: profile?.avatar_pixelated_url || '',
          },
          last_message: conversation.last_message || '',
          last_message_at: conversation.last_message_at || '',
          looking_for: match?.looking_for || 0,
          matched_at: match?.matched_at || '',
          match_id: match?.id || '',
          blocked_by: match?.blocked_by || null,
          unread_count: unreadCount,
        };
      });

      setConversations((prevConversations) => {
        const newConversations = [...prevConversations];
        updatedData.forEach((updatedConversation) => {
          const index = newConversations.findIndex((conv) => conv.id === updatedConversation.id);
          if (index !== -1) {
            newConversations[index] = updatedConversation;
          } else {
            newConversations.push(updatedConversation);
          }
        });
        // Filter out any conversations that are no longer in the matchesData
        return newConversations
          .filter((conv) => matchesData.some((match) => match.id === conv.match_id))
          .sort(
            (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
          );
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchNewConversations = async () => {
    if (!session?.user?.id) return;

    try {
      const lastConversationDate = conversations.length > 0 
        ? new Date(conversations[0].matched_at) 
        : new Date(0);

      const { data: newMatchesData, error: newMatchesError } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id, looking_for, matched_at, blocked_by')
        .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
        .not('matched_at', 'is', null)
        .is('blocked_by', null)
        .eq('user1_action', 1)
        .eq('user2_action', 1)
        .gt('matched_at', lastConversationDate.toISOString());

      if (newMatchesError) throw newMatchesError;

      if (newMatchesData.length === 0) return; // No new matches

      const newConversationIds = newMatchesData.map((match) => match.id);
      const { data: newConversationsData, error: newConversationsError } = await supabase
        .from('conversations')
        .select('id, last_message, last_message_at')
        .in('id', newConversationIds)
        .order('last_message_at', { ascending: false });

      if (newConversationsError) throw newConversationsError;

      const newUser2Ids = newMatchesData.map((match) => match.user2_id === session.user.id ? match.user1_id : match.user2_id);
      const { data: newProfilesData, error: newProfilesError } = await supabase
        .from('profiles_test')
        .select('id, name, avatar_url, avatar_pixelated_url')
        .in('id', newUser2Ids);

      if (newProfilesError) throw newProfilesError;

      const newConversations: Conversation[] = newConversationsData.map((conversation) => {
        const match = newMatchesData.find((m) => m.id === conversation.id);
        const profile = newProfilesData.find((p) => p.id === (match.user2_id === session.user.id ? match.user1_id : match.user2_id));

        return {
          id: conversation.id,
          user2_id: match.user2_id === session.user.id ? match.user1_id : match.user2_id,
          profiles: {
            user_id: match.user2_id === session.user.id ? match.user1_id : match.user2_id,
            name: profile?.name || '',
            avatar_url: profile?.avatar_url || '',
            avatar_pixelated_url: profile?.avatar_pixelated_url || '',
          },
          last_message: conversation.last_message || '',
          last_message_at: conversation.last_message_at || '',
          looking_for: match?.looking_for || 0,
          matched_at: match?.matched_at || '',
          match_id: match?.id || '',
          blocked_by: match?.blocked_by || null,
          unread_count: 0,
        };
      });

      setConversations((prevConversations) => {
        const updatedConversations = [...prevConversations];
        newConversations.forEach((newConv) => {
          const existingIndex = updatedConversations.findIndex((conv) => conv.id === newConv.id);
          if (existingIndex !== -1) {
            // Update existing conversation
            updatedConversations[existingIndex] = newConv;
          } else {
            // Add new conversation
            updatedConversations.push(newConv);
          }
        });
        return updatedConversations.sort((a, b) => new Date(b.matched_at).getTime() - new Date(a.matched_at).getTime());
      });
    } catch (error) {
      console.error('Error fetching new conversations:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNewConversations();
    setRefreshing(false);
  }, []);

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const avatarSource =
      item.looking_for === 1 || item.looking_for === 2
        ? { uri: item.profiles.avatar_pixelated_url }
        : { uri: item.profiles.avatar_url };

    const formattedDate = formatDistanceToNow(new Date(item.matched_at), { addSuffix: true });

    if (item.last_message_at === '') {
      return (
        <TouchableOpacity
          style={[
            styles.conversationItem,
            {
              backgroundColor: Colors.light.backgroundSecondary,
              borderColor: Colors.light.primary,
            },
          ]}
          onPress={() =>
            navigation.navigate('ChatView', {
              conversationId: item.id,
              user2_name: item.profiles.name,
              user2_id: item.user2_id,
              looking_for: item.looking_for,
              match_id: item.match_id,
            })
          }>
          <Image source={avatarSource} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.profiles.name}</Text>
          </View>
          <View>
            <View style={styles.matchLabel}>
              <Text style={styles.matchText}>NEW MATCH</Text>
            </View>
            <View>
              <Text style={styles.time}>{formattedDate}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() =>
          navigation.navigate('ChatView', {
            conversationId: item.id,
            user2_name: item.profiles.name,
            user2_id: item.user2_id,
            looking_for: item.looking_for,
            match_id: item.match_id,
          })
        }>
        <Image source={avatarSource} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.profiles.name}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.last_message}
          </Text>
        </View>
        {item.unread_count > 0 && (
          <View style={styles.unreadIndicator}>
            <Text style={styles.unreadCount}>{item.unread_count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!session?.user?.id) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>You need to log in to view conversations.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={defaultStyles.SafeAreaView}>
      <View style={defaultStyles.innerContainer}>
        <View
          style={[
            defaultStyles.pageHeader,
            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
          ]}>
          <Text style={defaultStyles.pageTitle}>Messages</Text>
          <Menu />
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
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
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
  matchLabel: {
    backgroundColor: Colors.light.primary,
    padding: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  matchText: {
    color: Colors.light.white,
    fontWeight: "bold",
    fontSize: 12,
  },
  unreadIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    right: 10,
  },
  unreadCount: {
    color: Colors.light.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});