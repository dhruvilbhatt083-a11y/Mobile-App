import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export async function registerForPushNotifications(uid) {
  if (!uid) return null;
  const isExpoGo = Constants?.executionEnvironment === 'storeClient';
  if (isExpoGo) {
    console.log('Expo Go detected – skipping push token registration until a dev build is used.');
    return null;
  }
  try {
    if (!Device.isDevice) {
      console.warn('Push notifications require a physical device.');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permission not granted for push notifications');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData?.data;

    console.log('PUSH TOKEN GENERATED:', token);
    if (!token) {
      console.warn('No expo push token returned');
      return null;
    }

    const userRef = doc(db, 'users', uid);
    try {
      await updateDoc(userRef, { expoPushToken: token });
    } catch (err) {
      await setDoc(userRef, { expoPushToken: token }, { merge: true });
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    Notifications.addPushTokenListener((tokenInfo) => {
      const newToken = tokenInfo.data?.expoPushToken || tokenInfo.data;
      if (newToken && newToken !== token) {
        updateDoc(userRef, { expoPushToken: newToken }).catch(() => {});
      }
    });

    return token;
  } catch (e) {
    console.warn('registerForPushNotifications error', e);
    return null;
  }
}

export async function removeExpoPushToken(uid) {
  if (!uid) return;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { expoPushToken: null }).catch(() => {});
  } catch (e) {
    console.warn('removeExpoPushToken error', e);
  }
}
