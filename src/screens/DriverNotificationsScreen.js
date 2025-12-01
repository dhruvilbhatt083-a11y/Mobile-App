// src/screens/DriverNotificationsScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { db } from '../services/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function DriverNotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id && !user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const driverId = user.id || user.uid;
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', driverId),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const createdAtSeconds = data.createdAt?.seconds || data.createdAt?._seconds || null;
          return {
            id: docSnap.id,
            ...data,
            createdAtRaw: data.createdAt || null,
            createdAtMs: createdAtSeconds ? createdAtSeconds * 1000 : null,
          };
        });
        setNotifications(list);
        setUnreadCount(list.filter((item) => !item.isRead).length);
        setLoading(false);
      },
      (error) => {
        console.warn('notifications listener error', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user?.id, user?.uid]);

  const handlePress = useCallback(
    async (notification) => {
      if (!notification?.id) return;

      if (!notification.isRead) {
        try {
          const ref = doc(db, 'notifications', notification.id);
          await updateDoc(ref, { isRead: true });
        } catch (error) {
          console.warn('Failed to mark notification read', error);
        }
      }

      const bookingId =
        notification?.data?.bookingId ||
        notification?.data?.bookingID ||
        notification?.data?.booking ||
        null;

      if (bookingId) {
        navigation.navigate('BookingDetails', { bookingId });
      } else {
        navigation.navigate('MyBookings');
      }
    },
    [navigation],
  );

  const renderItem = ({ item }) => {
    const isUnread = !item.isRead;
    const createdLabel = item.createdAtMs
      ? new Date(item.createdAtMs).toLocaleString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: 'short',
        })
      : '';

    return (
      <TouchableOpacity
        style={[styles.item, isUnread && styles.itemUnread]}
        activeOpacity={0.85}
        onPress={() => handlePress(item)}
      >
        <View style={styles.itemIconWrap}>
          <View style={[styles.iconCircle, isUnread ? styles.iconUnread : styles.iconRead]}>
            <Ionicons
              name="notifications-outline"
              size={18}
              color={isUnread ? '#0b67ff' : '#6b7280'}
            />
          </View>
        </View>

        <View style={styles.itemBody}>
          <Text style={[styles.title, isUnread && styles.titleUnread]} numberOfLines={1}>
            {item.title || 'Notification'}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {item.body || ''}
          </Text>
        </View>

        <View style={styles.itemMeta}>
          <Text style={styles.time}>{createdLabel}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }] }>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{unreadCount}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color="#1F7CFF" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={42} color="#9CA3AF" />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E7EC',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B1230',
  },
  unreadBadge: {
    minWidth: 32,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FF4C4C',
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemUnread: {
    backgroundColor: '#F1F6FF',
  },
  separator: {
    height: 1,
    backgroundColor: '#EEF2F7',
  },
  itemIconWrap: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUnread: {
    backgroundColor: '#E0ECFF',
  },
  iconRead: {
    backgroundColor: '#F3F4F6',
  },
  itemBody: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0B1230',
  },
  titleUnread: {
    color: '#0B67FF',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  itemMeta: {
    width: 110,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  time: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    color: '#9CA3AF',
    fontSize: 14,
  },
});
