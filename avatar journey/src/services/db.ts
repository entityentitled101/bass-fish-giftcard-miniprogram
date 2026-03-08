const DB_NAME = 'AvatarJourneyDB';
const DB_VERSION = 2; // 升级版本到 2

export const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains('meta')) {
                db.createObjectStore('meta');
            }
            if (!db.objectStoreNames.contains('events')) {
                db.createObjectStore('events', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('diaries')) {
                db.createObjectStore('diaries', { keyPath: 'id' });
            }
            // 新增华欣版扩展存储
            if (!db.objectStoreNames.contains('wardrobe')) {
                db.createObjectStore('wardrobe');
            }
            if (!db.objectStoreNames.contains('socialContacts')) {
                db.createObjectStore('socialContacts', { keyPath: 'id' });
            }
        };
    });
};

export const getValue = async (storeName: string, key: string) => {
    const db = await openDB();
    return new Promise<any>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const setValue = async (storeName: string, key: string, value: any) => {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        // 如果 store 有 keyPath，则不需要传递 key 参数，key 应该在 value 中
        const request = store.keyPath ? store.put(value) : store.put(value, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getAll = async (storeName: string) => {
    const db = await openDB();
    return new Promise<any[]>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const clearStore = async (storeName: string) => {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).clear();
};
