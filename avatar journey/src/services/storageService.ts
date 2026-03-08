import { Character, TravelState, TravelEvent, Diary, Wardrobe, SocialContact } from '../types';
import { getValue, setValue, getAll, openDB, clearStore } from './db';

// 存储键名常量 (meta store keys)
const META_KEYS = {
  CHARACTER: 'character',
  TRAVEL_STATE: 'travelState'
};

// 保存角色信息
export const saveCharacter = async (character: Character): Promise<void> => {
  await setValue('meta', META_KEYS.CHARACTER, character);
};

// 加载角色信息
export const loadCharacter = async (): Promise<Character> => {
  const result = await getValue('meta', META_KEYS.CHARACTER);
  return result || {
    name: '',
    description: '',
    departureLocation: '',
    destination: '',
    travelMethod: '',
    travelStyle: ''
  } as Character;
};

// 保存旅行状态
export const saveTravelState = async (travelState: TravelState): Promise<void> => {
  await setValue('meta', META_KEYS.TRAVEL_STATE, travelState);
};

// 加载旅行状态
export const loadTravelState = async (): Promise<TravelState> => {
  const result = await getValue('meta', META_KEYS.TRAVEL_STATE);
  return result || {
    isActive: false,
    currentLocation: '',
    currentActivity: '',
    lastUpdate: null,
    nextEventTime: null,
    stats: { joy: 100, experience: 0, discovery: 0 }
  } as TravelState;
};

// 保存衣柜
export const saveWardrobe = async (wardrobe: Wardrobe): Promise<void> => {
  await setValue('wardrobe', 'current', wardrobe);
};

// 加载衣柜
export const loadWardrobe = async (): Promise<Wardrobe | undefined> => {
  return await getValue('wardrobe', 'current');
};

// 加载社交关系列表
export const loadSocialContacts = async (): Promise<SocialContact[]> => {
  return await getAll('socialContacts');
};

// 保存社交关系
export const saveSocialContact = async (contact: SocialContact): Promise<void> => {
  await setValue('socialContacts', contact.id, contact);
};

// 保存事件列表
export const saveEvents = async (events: TravelEvent[]): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction('events', 'readwrite');
  const store = tx.objectStore('events');
  store.clear();
  for (const event of events) {
    store.put(event);
  }
};

// 加载事件列表
export const loadEvents = async (): Promise<TravelEvent[]> => {
  return await getAll('events');
};

// 保存日记列表
export const saveDiaries = async (diaries: Diary[]): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction('diaries', 'readwrite');
  const store = tx.objectStore('diaries');
  store.clear();
  for (const diary of diaries) {
    store.put(diary);
  }
};

// 加载日记列表
export const loadDiaries = async (): Promise<Diary[]> => {
  return await getAll('diaries');
};

// 清除所有数据
export const clearAllData = async (): Promise<void> => {
  await clearStore('meta');
  await clearStore('events');
  await clearStore('diaries');
  await clearStore('wardrobe');
  await clearStore('socialContacts');
};

// 导出所有数据
export const exportAllData = async (): Promise<string> => {
  const data = {
    character: await loadCharacter(),
    travelState: await loadTravelState(),
    events: await loadEvents(),
    diaries: await loadDiaries(),
    wardrobe: await loadWardrobe(),
    socialContacts: await loadSocialContacts(),
    exportTime: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
};

// 导入数据
export const importData = async (jsonData: string): Promise<void> => {
  const data = JSON.parse(jsonData);
  if (data.character) await saveCharacter(data.character);
  if (data.travelState) await saveTravelState(data.travelState);
  if (data.events) await saveEvents(data.events);
  if (data.diaries) await saveDiaries(data.diaries);
  if (data.wardrobe) await saveWardrobe(data.wardrobe);
  if (data.socialContacts) {
    for (const contact of data.socialContacts) {
      await saveSocialContact(contact);
    }
  }
};