import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDofB81Eu9PxE3HoBU9t_2btRYlMIZipho',
  authDomain: 'urbanfleet-x.firebaseapp.com',
  projectId: 'urbanfleet-x',
  storageBucket: 'urbanfleet-x.firebasestorage.app',
  messagingSenderId: '685710079488',
  appId: '1:685710079488:web:03b8ced1f6b079aec4cae5',
  measurementId: 'G-NBQF2EW523',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Storage is disabled for now; export a placeholder so imports stay safe
export const storage = null;
