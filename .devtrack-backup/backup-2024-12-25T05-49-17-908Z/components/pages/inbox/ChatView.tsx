import { Colors } from '@/constants/Colors';
import { Chat, MessageType, defaultTheme } from '@flyerhq/react-native-chat-ui';
import React, { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import CustomMessage from '@/components/pages/inbox/CustomMessage';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import {
  DropdownMenuRoot,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuItemTitle,
} from '@/components/ui/Dropdown';
import { Ionicons } from '@expo/vector-icons';
import { defaultStyles } from '@/constants/Styles';
import { useNotifications } from '@/contexts/NotificationContext';

export function Menu() {
  const navigation = useNavigation();
  const session = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const route = useRoute();
  const { match_id, user2_id, looking_for } = route.params;

  async function blockUser(): Promise<void> {
    Alert.alert(
      'Block User',
      'Are you sure you want to block this user?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Block',
          onPress: async () => {
            try {
              const { error: matchesError } = await supabase
                .from('matches')
                .update({ blocked_by: session?.user?.id })
                .eq('id', match_id);

              if (matchesError) throw matchesError;

              navigation.goBack();
            } catch (error) {
              console.error('Error blocking user:', error);
              Alert.alert('Error', 'Failed to block user. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  }

  return (
    <DropdownMenuRoot open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild style={defaultStyles.headerMoreButton}>
        <Pressable>
          <Ionicons name="ellipsis-vertical" size={24} color={Colors.light.primary} />
        </Pressable>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem
          key="profile"
          onSelect={() => navigation.navigate('UserProfile', { userId: user2_id, looking_for })}>
          <DropdownMenuItemTitle>View Profile</DropdownMenuItemTitle>
        </DropdownMenuItem>

        <DropdownMenuItem key="Report" onSelect={() => {}}>
          <DropdownMenuItemTitle>Report</DropdownMenuItemTitle>
        </DropdownMenuItem>

        <DropdownMenuItem key="block" onSelect={blockUser}>
          <DropdownMenuItemTitle>Block</DropdownMenuItemTitle>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}

const ChatView = () => {
  const [messages, setMessages] = useState<MessageType.Any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const { user } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const { user2_name, conversationId, user2_id } = route.params;
  const { clearNotificationsForConversation } = useNotifications();

  useEffect(() => {
    if (conversationId) {
      clearNotificationsForConversation(conversationId);
    }
  }, [conversationId, clearNotificationsForConversation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Menu />,
    });
  }, [navigation]);

  useEffect(() => {
    fetchMessages();

    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        handleRealTimeUpdate
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const messages = data.map((msg) => ({
        id: msg.id,
        text: msg.content,
        createdAt: new Date(msg.created_at).getTime(), // Convert to timestamp
        author: {
          id: msg.sender_id,
          firstName: 'John',
          imageUrl: 'https://avatars.githubusercontent.com/u/14123304?v=4',
        },
        status: msg.read_by,
        type: 'text',
      }));

      setMessages((messages as Message[]) || []);
      navigation.setOptions({ title: user2_name });
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealTimeUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      handleNewMessage(payload);
    } else if (payload.eventType === 'UPDATE') {
      handleMessageUpdate(payload);
    } else if (payload.eventType === 'DELETE') {
      handleMessageDelete(payload);
    }
  };

  const handleNewMessage = useCallback((payload: { new: MessageType.Any }) => {
    const newMessage = payload.new;

    // Format the new message to match the structure used in fetchMessages
    const formattedMessage = {
      id: newMessage.id,
      text: newMessage.content,
      createdAt: new Date(newMessage.created_at).getTime(), // Convert to timestamp
      author: {
        id: newMessage.sender_id,
        firstName: 'John', // You may want to replace this with actual user data
        imageUrl: 'https://avatars.githubusercontent.com/u/14123304?v=4',
      },
      status: newMessage.read_by,
      type: 'text',
    };

    // Update messages state with the new formatted message
    setMessages((prevMessages) => [formattedMessage, ...prevMessages]);
  }, []);

  const handleMessageUpdate = (payload: { old: MessageType.Any; new: MessageType.Any }) => {
    const updatedMessage = {
      id: payload.new.id,
      text: payload.new.content,
      createdAt: new Date(payload.new.created_at).getTime(), // Convert to timestamp
      author: {
        id: payload.new.sender_id,
        firstName: 'John', // You may want to replace this with actual user data
        imageUrl: 'https://avatars.githubusercontent.com/u/14123304?v=4',
      },
      status: payload.new.read_by,
      type: 'text',
    };

    setMessages((prevMessages) =>
      prevMessages.map((msg) => (msg.id === payload.new.id ? updatedMessage : msg))
    );
  };

  const handleMessageDelete = (payload: { old: MessageType.Any }) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== payload.old.id));
  };

  const handleSendPress = async (message: MessageType.PartialText) => {
    if (message.text.trim() === '' || !user?.id) {
      console.error('User is not authenticated or input message is empty.');
      return;
    }

    try {
      if (editingMessageId) {
        // Update existing message
        const { error } = await supabase
          .from('messages')
          .update({ content: message.text })
          .eq('id', editingMessageId);

        if (error) throw error;
        setEditingMessageId(null);
        setInputMessage('');
      } else {
        // Insert new message
        const { error } = await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: user.id,
          recipient_id: user2_id, // Now user2_id is properly defined
          content: message.text,
        });

        if (error) throw error;
        setInputMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  // New function to handle message long press
  const handleMessageLongPress = (msg: MessageType.Any) => {
    // Check if the message is deleted
    if (msg.text.startsWith('@@DELETED@@')) return;

    if (msg.author.id === user?.id) {
      // Check if the message is sent by the user
      Alert.alert('Message Options', 'Would you like to edit or delete this message?', [
        {
          text: 'Edit',
          onPress: () => {
            setInputMessage(msg.text); // Set the input to the message text
            setEditingMessageId(msg.id); // Set the message ID for editing
          },
        },
        {
          text: 'Delete',
          onPress: () => handleDeleteMessage(msg.id),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const messageToDelete = messages.find((msg) => msg.id === messageId);
      if (!messageToDelete) {
        throw new Error('Message not found');
      }

      const updatedContent = `@@DELETED@@ ${messageToDelete.text}`;

      const { error } = await supabase
        .from('messages')
        .update({ content: updatedContent }) // Prefix deleted message
        .eq('id', messageId);

      if (error) throw error;

      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === messageId ? { ...msg, text: updatedContent } : msg))
      );
    } catch (error) {
      console.error('Error deleting message:', error);
      Alert.alert('Error', 'Failed to delete message. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </SafeAreaView>
    );
  }

  return (
    <Chat
      messages={messages}
      onSendPress={handleSendPress}
      user={{ id: user?.id || '' }}
      showUserAvatars={false} // TODO: show user avatars
      onMessageLongPress={handleMessageLongPress}
      renderTextMessage={(message) => (
        <CustomMessage message={message} isMine={message.author.id === user?.id} />
      )}
      textInputProps={{
        placeholder: 'Type a message',
        placeholderTextColor: Colors.light.tertiary,
        value: inputMessage,
        onChangeText: setInputMessage,
      }}
      theme={{
        ...defaultTheme,
        colors: { ...defaultTheme.colors },
      }}
    />
  );
};

export default ChatView;
