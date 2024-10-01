import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/api/supabaseApi";
import { Colors } from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { supabase } from "@/lib/supabase";
import ChatView from "@/components/pages/inbox/ChatView";


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



export default function Inbox() {

  return (
      <View style={styles.container}>
        <ChatView />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    // the height of the safe area view is 44 on ios and 0 on android
    paddingTop: Platform.OS === 'ios' ? 60 : 0,
  },
});
