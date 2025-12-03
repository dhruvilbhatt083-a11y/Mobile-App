// src/services/storageService.js
import firebase from './firebaseCompat';

export async function uploadFileAsync(uri, path, onProgress = () => {}) {
  if (!uri || !path) {
    throw new Error('uploadFileAsync requires both uri and path');
  }

  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = firebase.storage().ref().child(path);
  const uploadTask = storageRef.put(blob);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0) {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(pct);
        }
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await storageRef.getDownloadURL();
          resolve(url);
        } catch (err) {
          reject(err);
        }
      },
    );
  });
}
