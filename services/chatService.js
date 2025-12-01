import { db } from './firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';

const CHATS_COLLECTION = 'chats';

export const makeChatRoomId = (bookingId, ownerId, userId) =>
  `${bookingId}__${ownerId}__${userId}`;

export const sendChatMessage = async ({ bookingId, ownerId, userId, senderType, text }) => {
  if (!bookingId || !ownerId || !userId || !text) {
    throw new Error('Missing bookingId/ownerId/userId/text for chat message');
  }

  const room = makeChatRoomId(bookingId, ownerId, userId);
  const payload = {
    bookingId,
    ownerId,
    userId,
    room,
    senderType,
    text,
    createdAt: serverTimestamp(),
  };

  const colRef = collection(db, CHATS_COLLECTION);
  const docRef = await addDoc(colRef, payload);
  return docRef.id;
};

export const subscribeToChatMessages = ({ bookingId, ownerId, userId }, callback) => {
  if (!bookingId || !ownerId || !userId || typeof callback !== 'function') {
    console.warn('subscribeToChatMessages missing identifiers, skipping');
    return () => {};
  }

  const room = makeChatRoomId(bookingId, ownerId, userId);
  const colRef = collection(db, CHATS_COLLECTION);
  const q = query(colRef, where('room', '==', room), orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          senderType: data.senderType || 'driver',
          text: data.text || '',
          timestamp: data.createdAt
            ? data.createdAt
                .toDate()
                .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
        };
      });

      callback(messages);
    },
    (error) => {
      console.error('subscribeToChatMessages error:', error);
    },
  );
};
