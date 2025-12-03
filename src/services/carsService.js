import { db } from './firebase';
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

const CARS_COLLECTION = 'cars';

export async function addCar(ownerId, carData = {}) {
  if (!ownerId) {
    throw new Error('OWNER_ID_REQUIRED');
  }

  const payload = {
    ownerId,
    title: carData.title || carData.name || 'Car',
    numberPlate: carData.numberPlate || null,
    brand: carData.brand || null,
    model: carData.model || null,
    year: carData.year || null,
    pricePerDay: Number(carData.pricePerDay || 0),
    status: carData.status || 'Available',
    isListed: carData.isListed !== undefined ? !!carData.isListed : true,
    images: carData.images || [],
    docs: carData.docs || {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, CARS_COLLECTION), payload);
  return docRef.id;
}

export async function fetchCars(ownerId = null) {
  const carsRef = collection(db, CARS_COLLECTION);

  if (ownerId) {
    const ownerQuery = query(carsRef, where('ownerId', '==', ownerId));
    const snapshot = await getDocs(ownerQuery);
    const docs = snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
    return docs.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
  }

  const publicQuery = query(carsRef, orderBy('createdAt', 'desc'), limit(100));
  const snapshot = await getDocs(publicQuery);
  return snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
}
