// src/screens/ChatWithOwnerScreen.js
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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { useAuth } from '../src/context/AuthContext';
import { DEV_DRIVER_ID } from '../src/config/currentUser';
import {
  sendChatMessage,
  subscribeToChatMessages,
} from '../services/chatService';

// 🔴 VERY IMPORTANT:
// We always need bookingId, ownerId and userId to build the chat room.
// userId comes from route.params if you pass it, otherwise we fall back
// to a hard-coded "driver" test id.
const ChatWithOwnerScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();

  const {
    bookingId,
    carName = 'Car',
    ownerName = 'Owner',
    ownerPhone,
    ownerId,
    userId: routeUserId,
  } = route?.params || {};

  // Prefer logged-in driver id, fall back to route param, then dev constant
  const driverId = currentUser?.id || routeUserId || DEV_DRIVER_ID;

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  // 🔄 Subscribe to Firestore messages for this room
  useEffect(() => {
    if (!bookingId || !ownerId || !driverId) {
      console.log('Chat missing ids', { bookingId, ownerId, driverId });
      return;
    }

    const unsubscribe = subscribeToChatMessages(
      { bookingId, ownerId, userId: driverId },
      (remoteMessages) => setMessages(remoteMessages),
    );

    return () => unsubscribe && unsubscribe();
  }, [bookingId, ownerId, driverId]);

  // 📜 Always keep scroll at bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleCallOwner = () => {
    if (!ownerPhone) return;
    Linking.openURL(`tel:${ownerPhone}`);
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;

    if (!bookingId || !ownerId || !driverId) {
      Alert.alert('Error', 'Missing booking/owner/user id for chat.');
      return;
    }

    try {
      await sendChatMessage({
        bookingId,
        ownerId,
        userId: driverId,
        text,
        senderType: 'driver', // this screen is from DRIVER side
      });

      setDraft('');
    } catch (error) {
      console.log('Failed to send message:', error);
      Alert.alert('Error', 'Could not send message.');
    }
  };

  const renderMessage = (message) => {
    const isDriver = message.senderType === 'driver';

    const bubbleStyle = [
      styles.bubble,
      isDriver ? styles.driverBubble : styles.ownerBubble,
      { alignSelf: isDriver ? 'flex-end' : 'flex-start' },
    ];

    const textStyle = [
      styles.bubbleText,
      isDriver ? styles.driverText : styles.ownerText,
    ];

    const timeStyle = [
      styles.timestamp,
      {
        textAlign: isDriver ? 'right' : 'left',
        alignSelf: isDriver ? 'flex-end' : 'flex-start',
      },
    ];

    return (
      <View key={message.id} style={styles.messageWrapper}>
        <View style={bubbleStyle}>
          <Text style={textStyle}>{message.text}</Text>
        </View>
        {message.createdAt && (
          <Text style={timeStyle}>
            {message.createdAt.toDate
              ? message.createdAt.toDate().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </Text>
        )}
      </View>
    );
  };

  const isSendDisabled = draft.trim().length === 0;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerShadowWrapper}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color="#111827" />
          </TouchableOpacity>

          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>Chat with Owner</Text>
            <Text style={styles.headerSubtitle}>
              {`${ownerName} • ${carName}${
                bookingId ? ` • ${bookingId}` : ''
              }`}
            </Text>
          </View>

          <TouchableOpacity style={styles.callButton} onPress={handleCallOwner}>
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
          {messages.length === 0 && (
            <Text style={styles.hintText}>
              No messages yet. Start the conversation.
            </Text>
          )}
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
              value={draft}
              onChangeText={setDraft}
              multiline
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              isSendDisabled && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={isSendDisabled}
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
  headerShadowWrapper: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    zIndex: 10,
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    backgroundColor: '#f5f7fb',
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
    marginBottom: 14,
  },
  messageWrapper: {
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
    backgroundColor: '#e5e7eb',
    borderTopLeftRadius: 4,
  },
  driverBubble: {
    backgroundColor: '#1f7cff',
    borderTopRightRadius: 4,
  },
  bubbleText: {
    ...FONTS.body2,
  },
  ownerText: {
    color: '#111827',
  },
  driverText: {
    color: '#fff',
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

export default ChatWithOwnerScreen;
