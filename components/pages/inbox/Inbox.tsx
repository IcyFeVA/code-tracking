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

export function Menu() {
  const navigation = useNavigation();
  const session = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const route = useRoute();
  const { match_id, user2_id, looking_for } = route.params;

  async function blockUser(): Promise<void> {
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .update({ blocked_by: session?.user?.id })
      .eq('id', match_id);

    if (matchesError) throw matchesError;

    navigation.goBack();
  }

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
      // First, fetch the matches for the current user
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('id, user2_id, looking_for, matched_at, blocked_by')
        .or(`user1_id.eq.${session?.user?.id},user2_id.eq.${session?.user?.id}`)
        .not('matched_at', 'is', null)
        .is('blocked_by', null)
        .eq('user1_action', 1)
        .eq('user2_action', 1);

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

      // Fetch profiles for user2_ids
      const user2Ids = matchesData.map((match) => match.user2_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles_test')
        .select('id, name, avatar_url, avatar_pixelated_url')
        .in('id', user2Ids);

      if (profilesError) throw profilesError;

      // Combine the data
      const transformedData: Conversation[] = conversationsData.map((conversation) => {
        const match = matchesData.find((m) => m.id === conversation.id);
        const profile = profilesData.find((p) => p.id === match?.user2_id);

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
          looking_for: match?.looking_for || 0, // when matched, both users have to select the same looking_for value
          matched_at: match?.matched_at || '',
          match_id: match?.id || '',
          blocked_by: match?.blocked_by || null,
        };
      });
      // console.log(transformedData);
      setConversations(transformedData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
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
        {/* <Text style={styles.time}>
          {isToday(new Date(item.last_message_at)) ? new Date(item.last_message_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }) : formattedDate}
        </Text> */}
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
});
