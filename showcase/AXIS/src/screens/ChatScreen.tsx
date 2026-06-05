import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useAxisStore } from '../store/axisStore';
import { processUserMessage, handleProactiveTrigger } from '../services/chatEngine';
import { getTodayConversationId, getConversationMessages } from '../services/database';

const { width } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  role: 'user' | 'axis';
  content: string;
  timestamp: Date;
  isProactive?: boolean;
}

export default function ChatScreen() {
  const { userName, isTyping, setIsTyping, orbState } = useAxisStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Load conversation history
  useEffect(() => {
    loadConversation();
  }, []);

  const loadConversation = async () => {
    try {
      const conversationId = await getTodayConversationId();
      const dbMessages = await getConversationMessages(conversationId);
      const formatted: ChatMessage[] = dbMessages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp),
        isProactive: m.is_proactive === 1,
      }));
      setMessages(formatted);
    } catch (error) {
      console.log('Error loading conversation:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to UI immediately
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Process through chat engine
    await processUserMessage(
      userMessage,
      // onAxisResponse
      (response) => {
        const axisMsg: ChatMessage = {
          id: `axis-${Date.now()}`,
          role: 'axis',
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, axisMsg]);
      },
      // onTypingStart
      () => setIsTyping(true),
      // onTypingEnd
      () => setIsTyping(false)
    );
  };

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    const time = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.axisRow]}>
        {!isUser && (
          <View style={styles.axisAvatar}>
            <View style={styles.axisAvatarDot} />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.axisBubble]}>
          {item.isProactive && (
            <Text style={styles.proactiveLabel}>AXIS spoke first</Text>
          )}
          <Text style={[styles.messageText, isUser ? styles.userText : styles.axisText]}>
            {item.content}
          </Text>
          <Text style={[styles.timestamp, isUser ? styles.userTime : styles.axisTime]}>
            {time}
          </Text>
        </View>
      </View>
    );
  }, []);

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    return (
      <View style={styles.typingContainer}>
        <View style={styles.axisAvatar}>
          <View style={styles.axisAvatarDot} />
        </View>
        <View style={styles.typingBubble}>
          <View style={styles.typingDot} />
          <View style={[styles.typingDot, { opacity: 0.6 }]} />
          <View style={[styles.typingDot, { opacity: 0.3 }]} />
        </View>
      </View>
    );
  };

  // Welcome message for empty chat
  const getWelcomeMessage = () => {
    if (messages.length === 0) {
      return (
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeOrb}>
            <View style={styles.welcomeOrbCore} />
          </View>
          <Text style={styles.welcomeTitle}>AXIS is awake.</Text>
          <Text style={styles.welcomeSubtext}>
            I've been watching. I've been learning.{'\n'}
            What do you want to talk about?
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerOrb}>
            <View style={styles.headerOrbCore} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AXIS</Text>
            <Text style={styles.headerStatus}>
              {isTyping ? 'thinking...' : 'always watching'}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={getWelcomeMessage}
        ListFooterComponent={renderTypingIndicator}
      />

      {/* Input */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Talk to AXIS..."
          placeholderTextColor="rgba(255,255,255,0.2)"
          value={input}
          onChangeText={setInput}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
          editable={!isTyping}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || isTyping) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || isTyping}
        >
          <Text style={styles.sendArrow}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerOrb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  headerOrbCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00D9FF',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerStatus: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    marginTop: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 8,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  welcomeOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 217, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeOrbCore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00D9FF',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 22,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  axisRow: {
    justifyContent: 'flex-start',
  },
  axisAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 217, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  axisAvatarDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00D9FF',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#00D9FF',
    borderBottomRightRadius: 4,
  },
  axisBubble: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  proactiveLabel: {
    fontSize: 10,
    color: 'rgba(0, 217, 255, 0.6)',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  userText: {
    color: '#0a0a0f',
    fontWeight: '500',
  },
  axisText: {
    color: 'rgba(255,255,255,0.88)',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  userTime: {
    color: 'rgba(10,10,15,0.4)',
    textAlign: 'right',
  },
  axisTime: {
    color: 'rgba(255,255,255,0.2)',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(0, 217, 255, 0.5)',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 34,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00D9FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(0, 217, 255, 0.2)',
    shadowOpacity: 0,
  },
  sendArrow: {
    color: '#0a0a0f',
    fontSize: 18,
    fontWeight: '700',
  },
});
