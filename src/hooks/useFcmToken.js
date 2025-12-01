import { AppState, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

let currentToken = null;
let removeTokenRefreshListener = null;
let appStateListener = null;

const ensureListenerCleanup = () => {
  if (removeTokenRefreshListener) {
    removeTokenRefreshListener();
    removeTokenRefreshListener = null;
  }

  if (appStateListener) {
    appStateListener.remove?.();
    appStateListener = null;
  }
};

const writeTokenFlag = async (uid, token, value) => {
  if (!uid || !token) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { [`fcmTokens.${token}`]: value }).catch(async (error) => {
    if (error?.code === 'not-found' || error?.message?.includes('No document to update')) {
      await setDoc(userRef, { fcmTokens: { [token]: value } }, { merge: true });
    } else {
      console.warn('[FCM] writeTokenFlag error', error);
    }
  });
};

export async function initFcmToken(uid) {
  if (!uid) return null;

  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (!enabled) {
        console.log('[FCM] Permission not granted (iOS)');
      }
    }

    const token = await messaging().getToken();
    if (!token) {
      console.warn('[FCM] No FCM token available');
      return null;
    }

    currentToken = token;
    await writeTokenFlag(uid, token, true);

    ensureListenerCleanup();

    removeTokenRefreshListener = messaging().onTokenRefresh(async (newToken) => {
      try {
        if (currentToken && currentToken !== newToken) {
          await writeTokenFlag(uid, currentToken, false);
        }
        currentToken = newToken;
        await writeTokenFlag(uid, newToken, true);
      } catch (error) {
        console.warn('[FCM] onTokenRefresh error', error);
      }
    });

    appStateListener = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        try {
          const refreshed = await messaging().getToken();
          if (refreshed && refreshed !== currentToken) {
            if (currentToken) {
              await writeTokenFlag(uid, currentToken, false);
            }
            currentToken = refreshed;
            await writeTokenFlag(uid, refreshed, true);
          }
        } catch (error) {
          console.warn('[FCM] AppState token refresh error', error);
        }
      }
    });

    return token;
  } catch (error) {
    console.warn('[FCM] initFcmToken error', error);
    return null;
  }
}

export async function removeFcmToken(uid) {
  try {
    if (uid && currentToken) {
      await writeTokenFlag(uid, currentToken, false);
    }
  } catch (error) {
    console.warn('[FCM] removeFcmToken error', error);
  } finally {
    currentToken = null;
    ensureListenerCleanup();
  }
}
