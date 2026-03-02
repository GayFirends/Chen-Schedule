import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WebDAVConfig, SyncStatus, SyncHistoryItem } from '../models';
import { STORAGE_KEYS } from '../../core/constants';
import { webdavStorage } from '../db/storage';

interface WebDAVStore {
  config: WebDAVConfig | null;
  syncStatus: SyncStatus;
  syncHistory: SyncHistoryItem[];
  setConfig: (config: WebDAVConfig | null) => void;
  setSyncStatus: (status: Partial<SyncStatus>) => void;
  addSyncHistory: (item: SyncHistoryItem) => void;
  clearSyncHistory: () => void;
}

export const useWebDAVStore = create<WebDAVStore>()(
  persist(
    (set) => ({
      config: null,
      syncStatus: {
        isSyncing: false,
      },
      syncHistory: [],

      setConfig: (config) => {
        set({ config });
      },

      setSyncStatus: (status) => {
        set((state) => ({
          syncStatus: { ...state.syncStatus, ...status },
        }));
      },

      addSyncHistory: (item) => {
        set((state) => ({
          syncHistory: [item, ...state.syncHistory].slice(0, 50), // 保留最近50条
        }));
      },

      clearSyncHistory: () => {
        set({ syncHistory: [] });
      },
    }),
    {
      name: STORAGE_KEYS.WEBDAV_CONFIG,
      storage: webdavStorage,
    }
  )
);