import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const fetchCars = async () => {
  const carsCol = collection(db, 'cars');
  const snapshot = await getDocs(carsCol);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
