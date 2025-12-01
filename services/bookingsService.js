import { db } from './firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';

const BOOKINGS_COLLECTION = 'bookings';

export const createBooking = async (bookingData) => {
  const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
    cancelled: false,
    completed: false,
    createdAt: serverTimestamp(),
    ...bookingData,
  });

  return docRef.id;
};

export const getBookingsByUser = async (userId) => {
  if (!userId) return [];

  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getBookingsByOwner = async (ownerId) => {
  if (!ownerId) return [];

  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('ownerId', '==', ownerId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateBookingStatus = async (bookingId, updates) => {
  if (!bookingId || !updates) return;

  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);

  if (typeof updates === 'string') {
    const normalized = updates.toLowerCase();
    const payload = {
      status: normalized,
      cancelled: normalized === 'cancelled',
      completed: normalized === 'completed',
    };

    if (normalized === 'pending' || normalized === 'confirmed') {
      payload.cancelled = false;
      payload.completed = false;
    }

    await updateDoc(bookingRef, payload);
    return;
  }

  if (typeof updates === 'object') {
    const cleaned = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined),
    );
    if (!Object.keys(cleaned).length) return;
    await updateDoc(bookingRef, cleaned);
  }
};

export const updateBookingPayment = async (
  bookingId,
  paymentStatus,
  paymentMethod,
) => {
  if (!bookingId || !paymentStatus) return;

  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const payload = {
    paymentStatus: paymentStatus.toLowerCase(),
  };

  if (paymentMethod) {
    payload.paymentMethod = paymentMethod.toLowerCase();
  }

  await updateDoc(bookingRef, payload);
};

// --- Owner earnings helper (simple, no extra Firestore indexes) ---
export const getOwnerEarnings = async (ownerId) => {
  if (!ownerId) {
    console.warn('getOwnerEarnings called without ownerId');
    return { totalAmount: 0, bookings: [] };
  }

  // Re-use existing service – only one query
  const allOwnerBookings = await getBookingsByOwner(ownerId);

  // Only count paid bookings
  const earningsBookings = allOwnerBookings.filter((b) => {
    const payment = (b.paymentStatus || '').toLowerCase();
    return payment === 'paid';
  });

  // Sum prices
  let total = 0;
  earningsBookings.forEach((b) => {
    const raw = typeof b.price === 'string' ? b.price : String(b.price ?? '0');
    // take just the number part, e.g. "900" from "₹900/day"
    const numeric = parseFloat(raw.replace(/[^\d.]/g, '')) || 0;
    total += numeric;
  });

  return {
    totalAmount: total,
    bookings: earningsBookings,
  };
};

// --- Driver cancel helper ---
export const cancelBookingByUser = async (bookingId, reason) => {
  if (!bookingId) {
    throw new Error('cancelBookingByUser called without bookingId');
  }

  const ref = doc(db, BOOKINGS_COLLECTION, bookingId);

  await updateDoc(ref, {
    status: 'cancelled',
    cancelReason: reason || '',
    cancelled: true,
    cancelledAt: serverTimestamp(),
  });
};

// --- Driver deposit payment helper ---
export const updateBookingDepositPaid = async (bookingId, paymentMode, depositAmount) => {
  if (!bookingId) {
    throw new Error('updateBookingDepositPaid called without bookingId');
  }

  const ref = doc(db, BOOKINGS_COLLECTION, bookingId);
  const payload = {
    depositPaid: true,
    depositPaymentMode: paymentMode || 'online',
    paymentMode: paymentMode || 'online',
    paymentMethod: paymentMode || 'online',
    paymentStatus: 'deposit_paid',
    depositPaidAt: serverTimestamp(),
  };

  if (typeof depositAmount === 'number' && Number.isFinite(depositAmount)) {
    payload.depositAmount = depositAmount;
  }

  await updateDoc(ref, payload);
};

export const declareCashRentPayment = async (bookingId, amount, createdBy = 'driver') => {
  if (!bookingId) {
    throw new Error('declareCashRentPayment called without bookingId');
  }

  const numericAmount = Number(amount) || 0;
  const transactionsRef = collection(db, BOOKINGS_COLLECTION, bookingId, 'transactions');

  const docRef = await addDoc(transactionsRef, {
    amount: numericAmount,
    type: 'rent',
    method: 'cash',
    status: 'pending',
    reference: 'driver_declared_cash',
    createdBy,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};
