import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';

const OwnerProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('Owner logout failed', error);
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="person-circle-outline" size={96} color="#1f7cff" />
      <Text style={styles.name}>{user?.fullName || user?.name || 'Owner'}</Text>
      <Text style={styles.phone}>+91 {user?.phone || user?.phoneNumber || '—'}</Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OwnerProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f9fbff',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    color: '#0a0a0a',
  },
  phone: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  logoutBtn: {
    marginTop: 30,
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
