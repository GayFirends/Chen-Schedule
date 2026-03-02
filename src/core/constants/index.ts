// 应用名称
export const APP_NAME = '课程表';

// 存储键名
export const STORAGE_KEYS = {
  SCHEDULES: 'schedules',
  COURSES: 'courses',
  TIME_SLOTS: 'timeSlots',
  SETTINGS: 'settings',
  WEBDAV_CONFIG: 'webdavConfig',
  SYNC_STATUS: 'syncStatus',
} as const;

// 默认时间表（每节课的时间）
export const DEFAULT_TIME_SLOTS = [
  { section: 1, startTime: '08:00', endTime: '08:45' },
  { section: 2, startTime: '08:55', endTime: '09:40' },
  { section: 3, startTime: '10:00', endTime: '10:45' },
  { section: 4, startTime: '10:55', endTime: '11:40' },
  { section: 5, startTime: '14:00', endTime: '14:45' },
  { section: 6, startTime: '14:55', endTime: '15:40' },
  { section: 7, startTime: '16:00', endTime: '16:45' },
  { section: 8, startTime: '16:55', endTime: '17:40' },
  { section: 9, startTime: '19:00', endTime: '19:45' },
  { section: 10, startTime: '19:55', endTime: '20:40' },
];

// 课程颜色预设
export const COURSE_COLORS = [
  '#6366f1', // 靛蓝
  '#8b5cf6', // 紫色
  '#ec4899', // 粉色
  '#f43f5e', // 玫红
  '#f97316', // 橙色
  '#eab308', // 黄色
  '#22c55e', // 绿色
  '#14b8a6', // 青色
  '#06b6d4', // 蓝绿
  '#3b82f6', // 蓝色
];

// 星期几的中文
export const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] as const;