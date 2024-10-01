import { Colors } from '@/constants/Colors';
import { Chat, MessageType, defaultTheme } from '@flyerhq/react-native-chat-ui';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const ChatView = () => {
  const [messages, setMessages] = useState<MessageType.Any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const session = useAuth();
  const conversationId = '8223b0c8-937e-4d4f-98bc-0c2031204a74'; // Replace with actual conversation ID

  useEffect(() => {
    fetchMessages();

    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, handleRealTimeUpdate)
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
          firstName: "John",
          imageUrl: "https://avatars.githubusercontent.com/u/14123304?v=4"
        },
        status: msg.read_by,
        type: 'text',
      }));

      // Sort messages in ascending order based on createdAt
      messages.sort((a, b) => a.createdAt - b.createdAt);

      setMessages((messages as Message[]) || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      Alert.alert("Error", "Failed to load messages. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealTimeUpdate = (payload: any) => {
    if (payload.eventType === "INSERT") {
      handleNewMessage(payload);
    } else if (payload.eventType === "UPDATE") {
      handleMessageUpdate(payload);
    } else if (payload.eventType === "DELETE") {
      handleMessageDelete(payload);
    }
  };

  const handleNewMessage = useCallback((payload: { new: MessageType.Any }) => {
    const newMessage = payload.new;
    setMessages((prevMessages) => [newMessage, ...prevMessages]);
  }, []);

  const handleMessageUpdate = (payload: { old: MessageType.Any; new: MessageType.Any }) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
      )
    );
  };

  const handleMessageDelete = (payload: { old: MessageType.Any }) => {
    setMessages((prevMessages) =>
      prevMessages.filter((msg) => msg.id !== payload.old.id)
    );
  };

  const handleSendPress = async (message: MessageType.PartialText) => {
    if (inputMessage.trim() === "" || !session?.user?.id) return;

    const newMessage: MessageType.Text = {
      author: { id: session.user.id },
      createdAt: Date.now(),
      id: Date.now().toString(),
      text: inputMessage.trim(),
      type: 'text',
    };

    setMessages((prevMessages) => [newMessage, ...prevMessages]);
    setInputMessage("");

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: session.user.id,
          content: newMessage.text,
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
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
    <SafeAreaView style={{ flex: 1 }}>
      <Chat
        messages={messages}
        onSendPress={handleSendPress}
        user={{ id: session?.user?.id }}
        showUserAvatars={true}
        showUserNames={true}
        onMessageLongPress={(msg) => {
          console.log('msg', msg);
        }}
        textInputProps={{
          placeholder: 'Type a message',
          placeholderTextColor: Colors.light.tertiary,
        }}
        theme={{
          ...defaultTheme,
          colors: { ...defaultTheme.colors, inputBackground: Colors.light.text, primary: Colors.light.accent },
        }}
      />
    </SafeAreaView>
  );
};

export default ChatView;