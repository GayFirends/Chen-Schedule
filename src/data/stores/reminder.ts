import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReminderSettings } from '../models';
import { DEFAULT_REMINDER_SETTINGS } from '../services/notification';

interface ReminderStore extends ReminderSettings {
  setEnabled: (enabled: boolean) => void;
  setAdvanceMinutes: (minutes: number) => void;
  setEnableSound: (enable: boolean) => void;
  setEnableVibration: (enable: boolean) => void;
  reset: () => void;
}

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set) => ({
      ...DEFAULT_REMINDER_SETTINGS,

      setEnabled: (enabled) => set({ enabled }),
      setAdvanceMinutes: (advanceMinutes) => set({ advanceMinutes }),
      setEnableSound: (enableSound) => set({ enableSound }),
      setEnableVibration: (enableVibration) => set({ enableVibration }),
      reset: () => set(DEFAULT_REMINDER_SETTINGS),
    }),
    { name: 'reminder-settings' }
  )
);