// src/services/usersService.js
import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

const USERS_COLLECTION = 'users';

// 🔍 Normalize phone → always last 10 digits (no +91, no spaces)
const normalizePhone = (rawPhone) => {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  return digits.slice(-10);
};

// 1) Find user by phone (used in login)
export const findUserByPhone = async (phone) => {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;

  const phoneCandidates = [normalized];
  if (!normalized.startsWith('+91')) {
    phoneCandidates.push(`+91${normalized}`);
  }

  for (const candidate of phoneCandidates) {
    const q = query(collection(db, USERS_COLLECTION), where('phone', '==', candidate));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
  }

  return null;
};

// 2) Create a new user (used in registration)
export const createUser = async ({
  name,
  phone,
  role = 'driver',
  city = '',
  aadhaarNumber = '',
  licenseNumber = '',
}) => {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    throw new Error('PHONE_REQUIRED');
  }

  const existing = await findUserByPhone(normalizedPhone);
  if (existing) {
    throw new Error('USER_ALREADY_EXISTS');
  }

  const payload = {
    name: name?.trim() || '',
    phone: normalizedPhone,
    role: role.toLowerCase(),
    city: city?.trim() || '',
    aadhaarNumber: aadhaarNumber?.trim() || '',
    licenseNumber: licenseNumber?.trim() || '',
    kyc: {
      overallStatus: 'pending',
      licenceStatus: 'pending',
      aadharStatus: 'pending',
      photoStatus: 'pending',
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: true,
    verificationStatus: 'pending',
  };

  const docRef = await addDoc(collection(db, USERS_COLLECTION), payload);
  return { id: docRef.id, ...payload };
};

// 3) Update user profile fields (name, city, etc.)
export const updateUserProfile = async (userId, updates = {}) => {
  if (!userId) {
    throw new Error('USER_ID_REQUIRED');
  }

  const cleanedEntries = Object.entries(updates)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return [key, value.trim()];
      }
      return [key, value];
    })
    .filter(([, value]) => value !== undefined && value !== null && value !== '');

  const cleaned = Object.fromEntries(cleanedEntries);
  if (!Object.keys(cleaned).length) {
    return null;
  }

  cleaned.updatedAt = serverTimestamp();

  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, cleaned);
  return cleaned;
};

// Placeholder: Firebase Storage disabled for now
export const uploadProfilePhoto = async () => {
  console.log('uploadProfilePhoto skipped: Firebase Storage disabled.');
  return null;
};

// 4) Driver submits KYC documents for review
export const submitDriverKycDocuments = async (userId, documents = {}, notes = '') => {
  if (!userId) {
    throw new Error('USER_ID_REQUIRED');
  }

  const docRef = doc(db, USERS_COLLECTION, userId);

  const orderedKeys = ['dlFront', 'dlBack', 'idProof', 'selfie'];
  const payloadDocs = {};
  let hasAnyDocument = false;

  orderedKeys.forEach((key) => {
    const docEntry = documents[key];
    if (docEntry?.dataUri) {
      payloadDocs[key] = {
        dataUri: docEntry.dataUri,
        mimeType: docEntry.mimeType || 'image/jpeg',
        uploadedAt: serverTimestamp(),
        fileName: docEntry.fileName || `${key}-${Date.now()}`,
      };
      hasAnyDocument = true;
    }
  });

  if (!hasAnyDocument) {
    throw new Error('KYC_DOCUMENTS_REQUIRED');
  }

  const updatePayload = {
    kycDocuments: payloadDocs,
    kycStatus: 'pending',
    kycSubmittedAt: serverTimestamp(),
    'kyc.overallStatus': 'pending',
    'kyc.licenceStatus': payloadDocs.dlFront && payloadDocs.dlBack ? 'submitted' : 'pending',
    'kyc.aadharStatus': payloadDocs.idProof ? 'submitted' : 'pending',
    'kyc.photoStatus': payloadDocs.selfie ? 'submitted' : 'pending',
  };

  if (notes) {
    updatePayload.kycNotes = notes;
  }

  await updateDoc(docRef, updatePayload);
  return updatePayload;
};
