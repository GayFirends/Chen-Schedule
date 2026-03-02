import { initDB, STORES } from './index';
import type { PersistStorage, StorageValue } from 'zustand/middleware/persist';

// IndexedDB 存储适配器（支持 Zustand v5 persist 中间件）
export function createIndexedDBStorage<S>(storeName: string): PersistStorage<S> {
  return {
    getItem: async (name: string): Promise<StorageValue<S> | null> => {
      try {
        const db = await initDB();
        const result = await db.get(storeName, name);
        if (result?.value) {
          const parsed = JSON.parse(result.value);
          return parsed;
        }
        return null;
      } catch (error) {
        console.error(`Failed to get ${name} from IndexedDB:`, error);
        return null;
      }
    },
    setItem: async (name: string, value: StorageValue<S>): Promise<void> => {
      try {
        const db = await initDB();
        await db.put(storeName, { key: name, value: JSON.stringify(value) });
      } catch (error) {
        console.error(`Failed to set ${name} in IndexedDB:`, error);
      }
    },
    removeItem: async (name: string): Promise<void> => {
      try {
        const db = await initDB();
        await db.delete(storeName, name);
      } catch (error) {
        console.error(`Failed to remove ${name} from IndexedDB:`, error);
      }
    },
  };
}

// 各存储的适配器实例
export const schedulesStorage = createIndexedDBStorage(STORES.SCHEDULES_STORE);
export const coursesStorage = createIndexedDBStorage(STORES.COURSES_STORE);
export const timeSlotsStorage = createIndexedDBStorage(STORES.TIME_SLOTS_STORE);
export const settingsStorage = createIndexedDBStorage(STORES.SETTINGS_STORE);
export const webdavStorage = createIndexedDBStorage(STORES.WEBDAV_STORE);
export const reminderStorage = createIndexedDBStorage(STORES.REMINDER_STORE);