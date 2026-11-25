const databaseName = 'student-c1-high-school-portfolio';
const storeName = 'drafts';
const draftKey = 'current';
const fallbackKey = `${databaseName}:${draftKey}`;

let databasePromise;
let pendingMutation = Promise.resolve();

function openDatabase() {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(storeName);
      request.onsuccess = () => {
        const database = request.result;
        database.onversionchange = () => database.close();
        resolve(database);
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Database is blocked'));
    });
  }

  return databasePromise;
}

async function accessDraft(mode, operation) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const request = operation(transaction.objectStore(storeName));
    transaction.oncomplete = () => resolve(request.result);
    transaction.onabort = () => reject(transaction.error);
  });
}

function fallbackDraft() {
  try {
    return localStorage.getItem(fallbackKey);
  } catch {
    return null;
  }
}

function removeFallback() {
  try {
    localStorage.removeItem(fallbackKey);
  } catch {
    // The primary database has already committed the change.
  }
}

export async function loadDraft() {
  await pendingMutation;
  const fallback = fallbackDraft();

  try {
    if (fallback !== null) return JSON.parse(fallback);
  } catch {
    // A malformed fallback can still be recovered from the primary database.
  }

  try {
    return (await accessDraft('readonly', store => store.get(draftKey))) ?? null;
  } catch {
    return null;
  }
}

function persistDraft(draft) {
  pendingMutation = pendingMutation.then(async () => {
    try {
      await accessDraft('readwrite', store => (
        draft === null ? store.delete(draftKey) : store.put(draft, draftKey)
      ));
      removeFallback();
      return true;
    } catch {
      try {
        localStorage.setItem(fallbackKey, JSON.stringify(draft));
        return true;
      } catch {
        return false;
      }
    }
  });

  return pendingMutation;
}

export async function saveDraft(state) {
  try {
    const draft = typeof structuredClone === 'function'
      ? structuredClone(state)
      : JSON.parse(JSON.stringify(state));
    return await persistDraft(draft);
  } catch {
    return false;
  }
}

export function clearDraft() {
  return persistDraft(null);
}

const maxPhotoBytes = 35 * 1024 * 1024;
const maxPhotoSide = 1600;
const photoTypes = /^image\/(?:jpe?g|pjpeg|png|webp|avif|gif|bmp|x-ms-bmp|heic|heif)$/i;
const photoExtensions = /\.(?:jpe?g|png|webp|avif|gif|bmp|heic|heif)$/i;

async function decodePhoto(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { image: bitmap, width: bitmap.width, height: bitmap.height, dispose: () => bitmap.close() };
    } catch {
      // The browser's image element may support more formats than its bitmap API.
    }
  }

  const url = URL.createObjectURL(file);
  const image = new Image();

  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = url;
    });
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }

  return { image, width: image.naturalWidth, height: image.naturalHeight, dispose: () => URL.revokeObjectURL(url) };
}

export async function preparePhoto(file) {
  if (!file || file.size === 0) {
    throw new Error('這張照片是空的，請重新選擇。');
  }

  if (!photoTypes.test(file.type) && !photoExtensions.test(file.name)) {
    throw new Error('請選擇 JPG、PNG、WebP 或其他常見的照片格式。');
  }

  if (file.size > maxPhotoBytes) {
    throw new Error('照片超過 35 MB，請先縮小檔案再加入。');
  }

  let decoded;

  try {
    decoded = await decodePhoto(file);
    if (!decoded.width || !decoded.height) throw new Error('Empty image');

    const ratio = Math.min(1, maxPhotoSide / Math.max(decoded.width, decoded.height));
    const width = Math.max(1, Math.round(decoded.width * ratio));
    const height = Math.max(1, Math.round(decoded.height * ratio));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d', { alpha: false });
    context.fillStyle = '#fff';
    context.fillRect(0, 0, width, height);
    context.drawImage(decoded.image, 0, 0, width, height);

    const src = canvas.toDataURL('image/jpeg', 0.86);
    if (!src.startsWith('data:image/jpeg;base64,')) throw new Error('JPEG export failed');

    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return { id, src, caption: '', name: file.name, width, height };
  } catch {
    throw new Error('這張照片無法讀取。若是手機的 HEIC 照片，請轉成 JPG 或 PNG 再加入。');
  } finally {
    decoded?.dispose();
  }
}
