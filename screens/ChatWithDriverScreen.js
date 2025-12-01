// src/screens/ChatWithDriverScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useAuth } from '../src/context/AuthContext';

// 🔌 Firestore chat helpers
import {
  subscribeToChatMessages,
  sendChatMessage,
} from '../services/chatService';

const ChatWithDriverScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();

  const {
    bookingId = 'BK-TEST',
    carName = 'Car',
    driverName = 'Driver',
    driverPhone,
    userId,
    ownerId: routeOwnerId,
  } = route?.params || {};

  const ownerId = currentUser?.id || routeOwnerId || 'owner_001';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Subscribe to Firestore chat messages for this booking/room
  useEffect(() => {
    if (!bookingId || !ownerId || !userId) {
      console.warn('ChatWithDriver: missing bookingId/ownerId/userId');
      return;
    }

    const unsubscribe = subscribeToChatMessages(
      { bookingId, ownerId, userId },
      (remoteMessages) => {
        setMessages(remoteMessages);
      },
    );

    return () => unsubscribe && unsubscribe();
  }, [bookingId, ownerId, userId]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !ownerId) return;

    try {
      await sendChatMessage({
        bookingId,
        ownerId,
        userId,
        senderType: 'owner', // 👈 this side is OWNER
        text: trimmed,
      });

      setInput('');
    } catch (error) {
      console.error('❌ Owner failed to send message:', error);
    }
  };

  const handleCallDriver = () => {
    if (!driverPhone) return;
    Linking.openURL(`tel:${driverPhone}`);
  };

  const renderMessage = (message) => {
    const isOwner = message.senderType === 'owner';

    const bubbleStyle = [
      styles.bubble,
      isOwner ? styles.ownerBubble : styles.driverBubble,
      { alignSelf: isOwner ? 'flex-end' : 'flex-start' },
    ];
    const textStyle = [
      styles.bubbleText,
      isOwner ? styles.ownerText : styles.driverText,
    ];

    const timeLabel =
      message.createdAt && message.createdAt.toDate
        ? message.createdAt
            .toDate()
            .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : message.timestamp || '';

    const timestampStyle = [
      styles.timestamp,
      {
        textAlign: isOwner ? 'right' : 'left',
        alignSelf: isOwner ? 'flex-end' : 'flex-start',
      },
    ];

    return (
      <View key={message.id || message.localId} style={styles.messageBlock}>
        <View style={bubbleStyle}>
          <Text style={textStyle}>{message.text}</Text>
        </View>
        {timeLabel ? <Text style={timestampStyle}>{timeLabel}</Text> : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color="#111827" />
          </TouchableOpacity>

          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>Chat with Driver</Text>
            <Text style={styles.headerSubtitle}>
              {`${driverName} • ${carName} • ${bookingId}`}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCallDriver}
          >
            <Ionicons name="call" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <View style={styles.chatArea}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.hintText}>
            Messages between you and the driver will appear here.
          </Text>
          {messages.map(renderMessage)}
        </ScrollView>
      </View>

      {/* Input bar */}
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={insets.bottom + 60}
      >
        <View
          style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}
        >
          <View style={styles.inputWrapper}>
            <Ionicons
              name="happy-outline"
              size={18}
              color="#9ca3af"
              style={{ marginRight: 6 }}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Type a message…"
              placeholderTextColor="#9ca3af"
              value={input}
              onChangeText={setInput}
              multiline
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              !input.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  headerWrapper: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    zIndex: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitles: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    ...FONTS.body1,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    ...FONTS.body3,
    color: '#6b7280',
    marginTop: 2,
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0ecff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 96,
  },
  hintText: {
    ...FONTS.body4,
    textAlign: 'center',
    color: '#9ca3af',
    marginBottom: 16,
  },
  messageBlock: {
    marginBottom: 10,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: '#0f172a0d',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  ownerBubble: {
    backgroundColor: '#1f7cff',
    borderTopRightRadius: 4,
  },
  driverBubble: {
    backgroundColor: '#e5e7eb',
    borderTopLeftRadius: 4,
  },
  bubbleText: {
    ...FONTS.body2,
  },
  ownerText: {
    color: '#fff',
  },
  driverText: {
    color: '#111827',
  },
  timestamp: {
    ...FONTS.body4,
    color: '#9ca3af',
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textInput: {
    flex: 1,
    ...FONTS.body2,
    color: '#111827',
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatWithDriverScreen;
