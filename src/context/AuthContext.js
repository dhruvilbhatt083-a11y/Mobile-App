// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { findUserByPhone } from '../services/usersService';
import { registerForPushNotifications, removeExpoPushToken } from '../helpers/pushNotifications';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const loginDriverByPhone = async (rawPhone) => {
    setAuthLoading(true);
    try {
      if (!rawPhone) {
        throw new Error('PHONE_REQUIRED');
      }

      const existing = await findUserByPhone(rawPhone);
      if (!existing) {
        throw new Error('USER_NOT_FOUND');
      }

      if (existing.role !== 'driver') {
        throw new Error('NOT_DRIVER');
      }

      if (existing.isBlocked === true) {
        throw new Error('USER_BLOCKED');
      }

      const kycStatus = existing.kyc?.overallStatus || existing.kycStatus || existing.verificationStatus;
      const normalizedStatus = (kycStatus || '').toLowerCase();
      const isApproved = ['approved', 'verified'].includes(normalizedStatus);
      if (!isApproved) {
        throw new Error('KYC_NOT_APPROVED');
      }

      setUser(existing);
      setRole(existing.role || 'driver');

      const uid = existing.id || existing.uid;
      await registerForPushNotifications(uid);

      return existing;
    } catch (error) {
      console.log('loginDriverByPhone error', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!user?.phone) return user;
    const updated = await findUserByPhone(user.phone);
    if (updated) {
      setUser(updated);
      setRole(updated.role || 'driver');
    }
    return updated;
  };

  const logout = async () => {
    try {
      if (user?.id || user?.uid) {
        const uid = user.id || user.uid;
        await removeExpoPushToken(uid);
      }
    } catch (error) {
      console.warn('logout removeFcmToken error', error);
    } finally {
      setUser(null);
      setRole(null);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    const userRef = doc(db, 'users', user.id);
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setUser(null);
          setRole(null);
          return;
        }

        const data = snapshot.data();
        setUser({ id: snapshot.id, ...data });
        setRole(data.role || 'driver');
      },
      (error) => {
        console.error('AuthContext user listener error', error);
      },
    );

    return unsubscribe;
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ user, role, authLoading, loginDriverByPhone, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
