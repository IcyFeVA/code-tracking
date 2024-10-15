import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { formatDistanceToNow } from 'date-fns';
import Spacer from '@/components/Spacer';

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
};

export default function BlockedUsers() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const session = useAuth();

  const loadConversations = useCallback(() => {
    if (session?.user?.id) {
      setIsAuthenticated(true);
      fetchConversations();
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [session]);

  // This effect runs once when the component mounts
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // This effect runs every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      // Fetch matches where the current user has blocked someone
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id, blocked_by, matched_at')
        .or(`user1_id.eq.${session?.user?.id},user2_id.eq.${session?.user?.id}`)
        .eq('blocked_by', session?.user?.id);

      if (matchesError) throw matchesError;

      // Now fetch the conversations based on the ids from matches
      const conversationIds = matchesData.map((match) => match.id);
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(
          `
          id,
          last_message,
          last_message_at
        `
        )
        .in('id', conversationIds)
        .order('last_message_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      // Fetch profiles for the other users (not the current user)
      const otherUserIds = matchesData.map((match) =>
        match.user1_id === session?.user?.id ? match.user2_id : match.user1_id
      );
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles_test')
        .select('id, name, avatar_url, avatar_pixelated_url')
        .in('id', otherUserIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const transformedData: Conversation[] = matchesData.map((match) => {
        const conversation = conversationsData.find((c) => c.id === match.id) || {
          last_message: '',
          last_message_at: '',
        };
        const profile = profilesData.find(
          (p) => p.id === (match.user1_id === session?.user?.id ? match.user2_id : match.user1_id)
        );

        return {
          id: match.id,
          user2_id: match.user1_id === session?.user?.id ? match.user2_id : match.user1_id,
          profiles: {
            user_id: profile?.id || '',
            name: profile?.name || '',
            avatar_url: profile?.avatar_url || '',
            avatar_pixelated_url: profile?.avatar_pixelated_url || '',
          },
          last_message: conversation.last_message,
          last_message_at: conversation.last_message_at,
          looking_for: 0, // You might want to add this to the matches table if it's needed
          matched_at: match.matched_at || '',
          match_id: match.id,
          blocked_by: match.blocked_by,
        };
      });

      setConversations(transformedData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  async function unblockUser(match_id: string, userName: string): Promise<void> {
    Alert.alert('Unblock User', `Are you sure you want to unblock ${userName}?`, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Unblock',
        onPress: async () => {
          try {
            const { error: matchesError } = await supabase
              .from('matches')
              .update({ blocked_by: null })
              .eq('id', match_id);

            if (matchesError) throw matchesError;

            // Remove the unblocked user from the local state
            setConversations((prevConversations) =>
              prevConversations.filter((conv) => conv.match_id !== match_id)
            );

            // Show a success message
            // Alert.alert('Success', `${userName} has been unblocked.`);
          } catch (error) {
            console.error('Error unblocking user:', error);
            Alert.alert('Error', 'Failed to unblock user. Please try again.');
          }
        },
      },
    ]);
  }

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const avatarSource =
      item.looking_for === 1 || item.looking_for === 2
        ? { uri: item.profiles.avatar_pixelated_url }
        : { uri: item.profiles.avatar_url };

    const formattedDate = formatDistanceToNow(new Date(item.matched_at), { addSuffix: true });

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => unblockUser(item.match_id, item.profiles.name)}>
        <Image source={avatarSource} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.profiles.name}</Text>
        </View>
        <View>
          <View>
            <Text style={styles.time}>Matched</Text>
          </View>
          <View>
            <Text style={styles.time}>{formattedDate}</Text>
          </View>
        </View>
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
          <Text style={defaultStyles.pageTitle}>Blocked Users</Text>
        </View>

        <Spacer height={16} />

        {conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No blocked users yet.</Text>
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
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.tertiary,
    marginBottom: 8,
  },
  newConversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    marginBottom: 8,
  },
  avatar: {
    // Added avatar style
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
    fontWeight: 'bold',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: 'bold',
    fontSize: 12,
  },
});
