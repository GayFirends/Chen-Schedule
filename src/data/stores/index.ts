import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Schedule, Course, TimeSlot, AppSettings } from '../models';
import { DEFAULT_TIME_SLOTS, STORAGE_KEYS } from '../../core/constants';

export { useWebDAVStore } from './webdav';

// 课程表 Store
interface ScheduleStore {
  schedules: Schedule[];
  currentScheduleId: string | null;

  addSchedule: (schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateSchedule: (id: string, schedule: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  setCurrentSchedule: (id: string | null) => void;
  getCurrentSchedule: () => Schedule | undefined;
}

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set, get) => ({
      schedules: [],
      currentScheduleId: null,

      addSchedule: (scheduleData) => {
        const now = new Date().toISOString();
        const id = uuidv4();
        const schedule: Schedule = {
          ...scheduleData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          schedules: [...state.schedules, schedule],
          currentScheduleId: state.currentScheduleId || id,
        }));
        return id;
      },

      updateSchedule: (id, scheduleData) => {
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, ...scheduleData, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      deleteSchedule: (id) => {
        set((state) => ({
          schedules: state.schedules.filter((s) => s.id !== id),
          currentScheduleId: state.currentScheduleId === id ? null : state.currentScheduleId,
        }));
      },

      setCurrentSchedule: (id) => {
        set({ currentScheduleId: id });
      },

      getCurrentSchedule: () => {
        const { schedules, currentScheduleId } = get();
        return schedules.find((s) => s.id === currentScheduleId);
      },
    }),
    { name: STORAGE_KEYS.SCHEDULES }
  )
);

// 课程 Store
interface CourseStore {
  courses: Course[];

  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  getCoursesBySchedule: (scheduleId: string) => Course[];
  getCoursesByWeek: (scheduleId: string, week: number) => Course[];
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      courses: [],

      addCourse: (courseData) => {
        const now = new Date().toISOString();
        const id = uuidv4();
        const course: Course = {
          ...courseData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          courses: [...state.courses, course],
        }));
        return id;
      },

      updateCourse: (id, courseData) => {
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id ? { ...c, ...courseData, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      deleteCourse: (id) => {
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
        }));
      },

      getCoursesBySchedule: (scheduleId) => {
        return get().courses.filter((c) => c.scheduleId === scheduleId);
      },

      getCoursesByWeek: (scheduleId, week) => {
        return get().courses.filter(
          (c) => c.scheduleId === scheduleId && c.weeks.includes(week)
        );
      },
    }),
    { name: STORAGE_KEYS.COURSES }
  )
);

// 时间表 Store
interface TimeSlotStore {
  timeSlots: TimeSlot[];
  setTimeSlots: (slots: TimeSlot[]) => void;
  updateTimeSlot: (section: number, slot: Partial<TimeSlot>) => void;
}

export const useTimeSlotStore = create<TimeSlotStore>()(
  persist(
    (set) => ({
      timeSlots: DEFAULT_TIME_SLOTS,

      setTimeSlots: (slots) => {
        set({ timeSlots: slots });
      },

      updateTimeSlot: (section, slotData) => {
        set((state) => ({
          timeSlots: state.timeSlots.map((s) =>
            s.section === section ? { ...s, ...slotData } : s
          ),
        }));
      },
    }),
    { name: STORAGE_KEYS.TIME_SLOTS }
  )
);

// 设置 Store
interface SettingsStore extends AppSettings {
  setTheme: (theme: AppSettings['theme']) => void;
  setCurrentWeek: (week: number) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'system',
      currentScheduleId: undefined,
      currentWeek: 1,
      timeSlots: DEFAULT_TIME_SLOTS,

      setTheme: (theme) => {
        set({ theme });
      },

      setCurrentWeek: (week) => {
        set({ currentWeek: week });
      },
    }),
    { name: STORAGE_KEYS.SETTINGS }
  )
);