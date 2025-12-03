import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDofB81Eu9PxE3HoBU9t_2btRYlMIZipho',
  authDomain: 'urbanfleet-x.firebaseapp.com',
  projectId: 'urbanfleet-x',
  storageBucket: 'urbanfleet-x.firebasestorage.app',
  messagingSenderId: '685710079488',
  appId: '1:685710079488:web:03b8ced1f6b079aec4cae5',
  measurementId: 'G-NBQF2EW523',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
