// 课程表
export interface Schedule {
  id: string;
  name: string;
  startWeek: number;
  endWeek: number;
  academicYear?: string;
  semester?: number;
  createdAt: string;
  updatedAt: string;
}

// 课程
export interface Course {
  id: string;
  scheduleId: string;
  name: string;
  teacher?: string;
  location?: string;
  weeks: number[]; // 周次列表
  dayOfWeek: number; // 星期几 (1-7)
  startSection: number; // 开始节次
  endSection: number; // 结束节次
  color?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

// 时间设置
export interface TimeSlot {
  section: number; // 节次
  startTime: string; // 开始时间 HH:mm
  endTime: string; // 结束时间 HH:mm
}

// 应用设置
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  currentScheduleId?: string;
  currentWeek?: number;
  timeSlots: TimeSlot[];
}

// 提醒设置
export interface ReminderSettings {
  enabled: boolean;
  advanceMinutes: number; // 提前多少分钟提醒
  enableSound: boolean;
  enableVibration: boolean;
}

// WebDAV 配置
export interface WebDAVConfig {
  serverUrl: string;
  username: string;
  password: string; // 加密存储
  remotePath: string;
}

// 同步状态
export interface SyncStatus {
  lastSyncTime?: string;
  isSyncing: boolean;
  lastError?: string;
}

// 同步历史记录
export interface SyncHistoryItem {
  id: string;
  type: 'upload' | 'download' | 'auto';
  timestamp: string;
  status: 'success' | 'failed';
  message?: string;
  stats?: {
    schedules: number;
    courses: number;
  };
}

// 导入来源类型
export type ImportSourceType = 'url' | 'html' | 'file';

// 教务系统类型
export type EducationalSystemType = 'zhengfang' | 'qingguo' | 'generic';

// 导入结果
export interface ImportResult {
  success: boolean;
  courses: Omit<Course, 'id' | 'scheduleId' | 'createdAt' | 'updatedAt'>[];
  errors?: string[];
}