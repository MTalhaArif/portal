import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a file to Firebase Storage.
 * @param {File} file - The file to upload
 * @param {string} path - Storage path, e.g. "documents/uid/filename"
 * @param {function} onProgress - optional callback(percentage)
 * @returns {Promise<string>} download URL
 */
export function uploadFile(file, path, onProgress) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      'state_changed',
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(pct);
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

/**
 * Delete a file from Firebase Storage by its full path.
 */
export async function deleteFile(filePath) {
  await deleteObject(ref(storage, filePath));
}
