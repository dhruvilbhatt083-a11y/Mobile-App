import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const db = firebase.firestore();

export async function addCar(ownerId, carData) {
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
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await db.collection('cars').add(payload);
  return docRef.id;
}

export async function fetchCars(ownerId = null) {
  let queryRef = db.collection('cars');
  if (ownerId) {
    queryRef = queryRef.where('ownerId', '==', ownerId);
  }
  queryRef = queryRef.orderBy('createdAt', 'desc').limit(100);

  const snapshot = await queryRef.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
