import { Colors } from '@/constants/Colors'
import { Chat, MessageType, defaultTheme } from '@flyerhq/react-native-chat-ui'
import React, { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, SafeAreaView, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// For the testing purposes, you should probably use https://github.com/uuidjs/uuid
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16)
    const v = c === 'x' ? r : (r % 4) + 8
    return v.toString(16)
  })
}

const ChatView = () => {
  const [messages, setMessages] = useState<MessageType.Any[]>([])
  const user = { id: '06c33e8b-e835-4736-80f4-63f44b66666c' }

  useEffect(() => {
    const fetchMessages = async () => {
      const messages = require('./fake_messages.json')
      setMessages(messages)
    }
    fetchMessages()
  }, [])

  const addMessage = (message: MessageType.Any) => {
    setMessages([message, ...messages])
  }

  const handleSendPress = (message: MessageType.PartialText) => {
    const textMessage: MessageType.Text = {
      author: user,
      createdAt: Date.now(),
      id: uuidv4(),
      text: message.text,
      type: 'text',
    }
    addMessage(textMessage)
  }

  return (
    // <KeyboardAvoidingView
    //   behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    //   style={{ flex: 1 }}
    // >
      <Chat
        messages={messages}
        onSendPress={handleSendPress}
        user={user}
        showUserAvatars={true}
        onMessageLongPress={(msg) => {
          console.log('msg', msg)
        }}
        textInputProps={{
          placeholder: 'Type a message',
          placeholderTextColor: Colors.light.tertiary,
        }}
        theme={{
          ...defaultTheme,
          colors: { ...defaultTheme.colors, inputBackground: Colors.light.text, primary: Colors.light.accent, },
        }}
      />
    // </KeyboardAvoidingView>
  )
}

export default ChatView