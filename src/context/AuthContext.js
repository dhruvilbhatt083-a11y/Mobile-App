// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { findUserByPhone } from '../services/usersService';

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

      const normalizedRole = (existing.role || '').trim().toLowerCase();
      if (normalizedRole !== 'driver') {
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
      setRole(normalizedRole || 'driver');

      return existing;
    } catch (error) {
      console.log('loginDriverByPhone error', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const loginOwnerByPhone = async (rawPhone) => {
    setAuthLoading(true);
    try {
      if (!rawPhone) {
        throw new Error('PHONE_REQUIRED');
      }

      const existing = await findUserByPhone(rawPhone);
      if (!existing) {
        throw new Error('USER_NOT_FOUND');
      }

      const normalizedRole = (existing.role || '').trim().toLowerCase();
      if (normalizedRole !== 'owner') {
        throw new Error('NOT_OWNER');
      }

      if (existing.isBlocked === true) {
        throw new Error('USER_BLOCKED');
      }

      const kycStatus = existing.kyc?.overallStatus || existing.kycStatus || existing.verificationStatus;
      const normalizedStatus = (kycStatus || '').toLowerCase();
      const isVerified = ['approved', 'verified'].includes(normalizedStatus);
      if (!isVerified) {
        throw new Error('KYC_NOT_APPROVED');
      }

      setUser(existing);
      setRole(normalizedRole || 'owner');

      return existing;
    } catch (error) {
      console.log('loginOwnerByPhone error', error);
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
    setUser(null);
    setRole(null);
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
    <AuthContext.Provider
      value={{ user, role, authLoading, loginDriverByPhone, loginOwnerByPhone, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
