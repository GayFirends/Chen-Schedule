import { openDB, type IDBPDatabase } from 'idb';
import type { Schedule, Course, TimeSlot, AppSettings, WebDAVConfig, SyncHistoryItem, ReminderSettings } from '../models';

const DB_NAME = 'course-schedule-db';
const DB_VERSION = 2;

// 存储名称
export const STORES = {
  // 原始存储
  SCHEDULES: 'schedules',
  COURSES: 'courses',
  TIME_SLOTS: 'timeSlots',
  SETTINGS: 'settings',
  WEBDAV_CONFIG: 'webdavConfig',
  SYNC_HISTORY: 'syncHistory',
  REMINDER_SETTINGS: 'reminderSettings',
  // Zustand 持久化存储
  SCHEDULES_STORE: 'schedules-store',
  COURSES_STORE: 'courses-store',
  TIME_SLOTS_STORE: 'timeSlots-store',
  SETTINGS_STORE: 'settings-store',
  WEBDAV_STORE: 'webdav-store',
  REMINDER_STORE: 'reminder-store',
} as const;

let dbPromise: Promise<IDBPDatabase> | null = null;

// 初始化数据库
export async function initDB(): Promise<IDBPDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 课表存储
      if (!db.objectStoreNames.contains(STORES.SCHEDULES)) {
        db.createObjectStore(STORES.SCHEDULES, { keyPath: 'id' });
      }

      // 课程存储
      if (!db.objectStoreNames.contains(STORES.COURSES)) {
        const courseStore = db.createObjectStore(STORES.COURSES, { keyPath: 'id' });
        courseStore.createIndex('scheduleId', 'scheduleId');
      }

      // 时间表存储
      if (!db.objectStoreNames.contains(STORES.TIME_SLOTS)) {
        db.createObjectStore(STORES.TIME_SLOTS, { keyPath: 'section' });
      }

      // 设置存储
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }

      // WebDAV 配置
      if (!db.objectStoreNames.contains(STORES.WEBDAV_CONFIG)) {
        db.createObjectStore(STORES.WEBDAV_CONFIG, { keyPath: 'key' });
      }

      // 同步历史
      if (!db.objectStoreNames.contains(STORES.SYNC_HISTORY)) {
        const syncStore = db.createObjectStore(STORES.SYNC_HISTORY, { keyPath: 'id' });
        syncStore.createIndex('timestamp', 'timestamp');
      }

      // 提醒设置
      if (!db.objectStoreNames.contains(STORES.REMINDER_SETTINGS)) {
        db.createObjectStore(STORES.REMINDER_SETTINGS, { keyPath: 'key' });
      }

      // Zustand 持久化存储（用于 zustand persist 中间件）
      if (!db.objectStoreNames.contains(STORES.SCHEDULES_STORE)) {
        db.createObjectStore(STORES.SCHEDULES_STORE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.COURSES_STORE)) {
        db.createObjectStore(STORES.COURSES_STORE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.TIME_SLOTS_STORE)) {
        db.createObjectStore(STORES.TIME_SLOTS_STORE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.SETTINGS_STORE)) {
        db.createObjectStore(STORES.SETTINGS_STORE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.WEBDAV_STORE)) {
        db.createObjectStore(STORES.WEBDAV_STORE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.REMINDER_STORE)) {
        db.createObjectStore(STORES.REMINDER_STORE, { keyPath: 'key' });
      }
    },
  });

  return dbPromise;
}

// 通用 CRUD 操作
export async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await initDB();
  return db.getAll(storeName) as Promise<T[]>;
}

export async function getByKey<T>(storeName: string, key: string | number): Promise<T | undefined> {
  const db = await initDB();
  return db.get(storeName, key) as Promise<T | undefined>;
}

export async function getByIndex<T>(storeName: string, indexName: string, value: string | number): Promise<T[]> {
  const db = await initDB();
  return db.getAllFromIndex(storeName, indexName, value) as Promise<T[]>;
}

export async function put<T>(storeName: string, data: T): Promise<void> {
  const db = await initDB();
  await db.put(storeName, data);
}

export async function putAll<T>(storeName: string, data: T[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  await Promise.all([
    ...data.map(item => tx.store.put(item)),
    tx.done,
  ]);
}

export async function remove(storeName: string, key: string | number): Promise<void> {
  const db = await initDB();
  await db.delete(storeName, key);
}

export async function clear(storeName: string): Promise<void> {
  const db = await initDB();
  await db.clear(storeName);
}

// 课表操作
export const schedulesDB = {
  getAll: () => getAll<Schedule>(STORES.SCHEDULES),
  getById: (id: string) => getByKey<Schedule>(STORES.SCHEDULES, id),
  put: (schedule: Schedule) => put(STORES.SCHEDULES, schedule),
  putAll: (schedules: Schedule[]) => putAll(STORES.SCHEDULES, schedules),
  delete: (id: string) => remove(STORES.SCHEDULES, id),
  clear: () => clear(STORES.SCHEDULES),
};

// 课程操作
export const coursesDB = {
  getAll: () => getAll<Course>(STORES.COURSES),
  getById: (id: string) => getByKey<Course>(STORES.COURSES, id),
  getByScheduleId: (scheduleId: string) => getByIndex<Course>(STORES.COURSES, 'scheduleId', scheduleId),
  put: (course: Course) => put(STORES.COURSES, course),
  putAll: (courses: Course[]) => putAll(STORES.COURSES, courses),
  delete: (id: string) => remove(STORES.COURSES, id),
  clear: () => clear(STORES.COURSES),
};

// 时间表操作
export const timeSlotsDB = {
  getAll: () => getAll<TimeSlot>(STORES.TIME_SLOTS),
  put: (slot: TimeSlot) => put(STORES.TIME_SLOTS, slot),
  putAll: (slots: TimeSlot[]) => putAll(STORES.TIME_SLOTS, slots),
  clear: () => clear(STORES.TIME_SLOTS),
};

// 设置操作
export const settingsDB = {
  get: async <T>(key: string): Promise<T | undefined> => {
    const result = await getByKey<{ key: string; value: T }>(STORES.SETTINGS, key);
    return result?.value;
  },
  set: async <T>(key: string, value: T): Promise<void> => {
    await put(STORES.SETTINGS, { key, value });
  },
  getAll: async (): Promise<Record<string, unknown>> => {
    const items = await getAll<{ key: string; value: unknown }>(STORES.SETTINGS);
    return items.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
  },
};

// WebDAV 配置操作
export const webdavConfigDB = {
  get: async (): Promise<WebDAVConfig | undefined> => {
    const result = await getByKey<{ key: string; config: WebDAVConfig }>(STORES.WEBDAV_CONFIG, 'config');
    return result?.config;
  },
  set: async (config: WebDAVConfig): Promise<void> => {
    await put(STORES.WEBDAV_CONFIG, { key: 'config', config });
  },
  clear: () => remove(STORES.WEBDAV_CONFIG, 'config'),
};

// 同步历史操作
export const syncHistoryDB = {
  getAll: () => getAll<SyncHistoryItem>(STORES.SYNC_HISTORY),
  add: (item: SyncHistoryItem) => put(STORES.SYNC_HISTORY, item),
  clear: () => clear(STORES.SYNC_HISTORY),
};

// 提醒设置操作
export const reminderSettingsDB = {
  get: async (): Promise<ReminderSettings | undefined> => {
    const result = await getByKey<{ key: string; settings: ReminderSettings }>(STORES.REMINDER_SETTINGS, 'settings');
    return result?.settings;
  },
  set: async (settings: ReminderSettings): Promise<void> => {
    await put(STORES.REMINDER_SETTINGS, { key: 'settings', settings });
  },
};

// 从 localStorage 迁移数据到 IndexedDB
export async function migrateFromLocalStorage(): Promise<void> {
  const db = await initDB();

  // 检查是否已迁移
  const migrated = localStorage.getItem('indexeddb-migrated');
  if (migrated === 'true') return;

  try {
    // 迁移课表
    const schedulesData = localStorage.getItem('schedules');
    if (schedulesData) {
      const { state } = JSON.parse(schedulesData);
      if (state?.schedules) {
        await schedulesDB.putAll(state.schedules);
      }
    }

    // 迁移课程
    const coursesData = localStorage.getItem('courses');
    if (coursesData) {
      const { state } = JSON.parse(coursesData);
      if (state?.courses) {
        await coursesDB.putAll(state.courses);
      }
    }

    // 迁移时间表
    const timeSlotsData = localStorage.getItem('timeSlots');
    if (timeSlotsData) {
      const { state } = JSON.parse(timeSlotsData);
      if (state?.timeSlots) {
        await timeSlotsDB.putAll(state.timeSlots);
      }
    }

    // 迁移设置
    const settingsData = localStorage.getItem('settings');
    if (settingsData) {
      const { state } = JSON.parse(settingsData);
      if (state) {
        for (const [key, value] of Object.entries(state)) {
          if (key !== 'timeSlots') {
            await settingsDB.set(key, value);
          }
        }
      }
    }

    // 标记已迁移
    localStorage.setItem('indexeddb-migrated', 'true');
    console.log('数据迁移完成');
  } catch (error) {
    console.error('数据迁移失败:', error);
  }
}