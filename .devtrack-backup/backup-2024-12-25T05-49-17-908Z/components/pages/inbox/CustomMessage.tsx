// components/CustomMessage.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MessageType } from '@flyerhq/react-native-chat-ui';
import { Colors } from '@/constants/Colors';

const CustomMessage = ({ message, isMine }: { message: MessageType.Any, isMine: boolean }) => {
  const isDeleted = message.text.startsWith('@@DELETED@@');

if(isDeleted) {
    return (
        <View style={styles.deletedMessageContainer}>
            <Text style={styles.deletedMessageText}>This message was deleted.</Text>
        </View>
    )
}

  return (
    <View style={styles.messageContainer}>
      <Text style={[styles.messageText, isMine ? styles.mineMessageText : {}]}>
        {message.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    padding: 16,
    borderRadius: 16,
  },
  deletedMessageContainer: {
    padding: 8,
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    
  },
  mineMessageText: {
    color: Colors.light.white,
  },
  deletedMessageText: {
    color: 'gray',
    fontStyle: 'italic',
    textDecorationLine: 'line-through',
  },
});

export default CustomMessage;