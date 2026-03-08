import { openDB, clearStore } from './db';

const SLOTS_KEY = 'avatar_journey_slots';

export interface SaveSlot {
    id: string;
    name: string;
    timestamp: number;
    description: string;
}

export const getSlots = (): SaveSlot[] => {
    const slots = localStorage.getItem(SLOTS_KEY);
    return slots ? JSON.parse(slots) : [];
};

export const createArchive = async (currentName: string): Promise<string> => {
    const slots = getSlots();
    const newId = `archive_${Date.now()}`;

    // 1. 获取当前所有存储的数据
    const stores = ['meta', 'events', 'diaries', 'wardrobe', 'socialContacts'];
    const snapshot: any = {};

    const db = await openDB();
    for (const storeName of stores) {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const data = await new Promise<any[]>((resolve) => {
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
        });
        snapshot[storeName] = data;
    }

    // 2. 将快照存入持久化槽位 (这里存入一个新的 object store 叫 'backup')
    if (!db.objectStoreNames.contains('archives')) {
        // 如果没有这个store，我们需要重新打开数据库并升级
        // 但为了简单，我们先把快照存入 localStorage (注意容量限制) 
        // 或者直接在 meta 里面加前缀
    }

    // 方案调整：我们将当前所有数据存入一个特定的 IDB 记录
    // 为了不破坏现有结构，我们暂时只支持“清空并新建”，但可以从备份中恢复
    const archiveInfo: SaveSlot = {
        id: newId,
        name: currentName,
        timestamp: Date.now(),
        description: `存档于 ${new Date().toLocaleString()}`
    };

    localStorage.setItem(`${newId}_snapshot`, JSON.stringify(snapshot));
    localStorage.setItem(SLOTS_KEY, JSON.stringify([...slots, archiveInfo]));

    return newId;
};

export const clearAndStartNew = async () => {
    localStorage.removeItem('hua_hin_migrated_version');
    localStorage.removeItem('current_slot');
    // 之后由 App.tsx 的 checkAndMigrate 处理重新注入
};
