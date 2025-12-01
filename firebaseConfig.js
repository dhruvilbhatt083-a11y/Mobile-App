// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "carrentalapp-xxxx.firebaseapp.com",
  projectId: "carrentalapp-xxxx",
  storageBucket: "carrentalapp-xxxx.appspot.com",
  messagingSenderId: "xxxxxxxxxx",
  appId: "1:xxxxxxxxxx:web:xxxxxxxxxx"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;
