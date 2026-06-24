// ─── localStorage Storage mock ─────────────────────────────────────────────────
// Files are stored as base64 data URLs in localStorage.
// Max practical size: ~5MB per file (localStorage limit).

/**
 * Upload a file — stores it as base64 in localStorage.
 * @param {File} file
 * @param {string} path - used as the storage key
 * @param {function} onProgress
 * @returns {Promise<string>} data URL (acts as download URL)
 */
export function uploadFile(file, path, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    reader.onload = () => {
      try {
        const dataUrl = reader.result;
        localStorage.setItem('pp_file_' + path, dataUrl);
        if (onProgress) onProgress(100);
        resolve(dataUrl);
      } catch (err) {
        // localStorage quota exceeded
        reject(new Error('File too large for local storage. Please use a file under 4MB.'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Delete a stored file.
 */
export async function deleteFile(filePath) {
  localStorage.removeItem('pp_file_' + filePath);
}
