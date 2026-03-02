import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WebDAVConfig, SyncStatus } from '../models';
import { STORAGE_KEYS } from '../../core/constants';

interface WebDAVStore {
  config: WebDAVConfig | null;
  syncStatus: SyncStatus;
  setConfig: (config: WebDAVConfig | null) => void;
  setSyncStatus: (status: Partial<SyncStatus>) => void;
}

export const useWebDAVStore = create<WebDAVStore>()(
  persist(
    (set) => ({
      config: null,
      syncStatus: {
        isSyncing: false,
      },

      setConfig: (config) => {
        set({ config });
      },

      setSyncStatus: (status) => {
        set((state) => ({
          syncStatus: { ...state.syncStatus, ...status },
        }));
      },
    }),
    { name: STORAGE_KEYS.WEBDAV_CONFIG }
  )
);