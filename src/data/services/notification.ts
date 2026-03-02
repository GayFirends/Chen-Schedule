import type { Course, TimeSlot, ReminderSettings } from '../models';

// 检查浏览器是否支持通知
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

// 检查通知权限状态
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

// 请求通知权限
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  return await Notification.requestPermission();
}

// 发送课程提醒通知
export function sendCourseNotification(course: Course, timeSlot: TimeSlot): void {
  if (getNotificationPermission() !== 'granted') return;

  const notification = new Notification('课程提醒', {
    body: `${course.name}\n${timeSlot.startTime} 开始 | ${course.location || '未设置地点'}`,
    icon: '/pwa-192x192.png',
    tag: `course-${course.id}`,
    requireInteraction: true,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

// 获取下一个上课时间
export function getNextCourseTime(
  courses: Course[],
  timeSlots: TimeSlot[],
  currentWeek: number
): { course: Course; timeSlot: TimeSlot; date: Date } | null {
  const now = new Date();
  const today = now.getDay() || 7; // 转换为 1-7
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // 今天的课程（按开始时间排序）
  const todayCourses = courses
    .filter(c => c.weeks.includes(currentWeek) && c.dayOfWeek === today)
    .sort((a, b) => a.startSection - b.startSection);

  // 检查今天还有没有课
  for (const course of todayCourses) {
    const slot = timeSlots.find(t => t.section === course.startSection);
    if (!slot) continue;

    const [hours, minutes] = slot.startTime.split(':').map(Number);
    const courseTime = hours * 60 + minutes;

    if (courseTime > currentTime) {
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      return { course, timeSlot: slot, date };
    }
  }

  // 找下一个有课的日子
  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    const nextDay = today + dayOffset > 7 ? today + dayOffset - 7 : today + dayOffset;
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + dayOffset);
    nextDate.setHours(0, 0, 0, 0);

    const nextDayCourses = courses
      .filter(c => c.weeks.includes(currentWeek) && c.dayOfWeek === nextDay)
      .sort((a, b) => a.startSection - b.startSection);

    if (nextDayCourses.length > 0) {
      const course = nextDayCourses[0];
      const slot = timeSlots.find(t => t.section === course.startSection);
      if (!slot) continue;

      const [hours, minutes] = slot.startTime.split(':').map(Number);
      nextDate.setHours(hours, minutes, 0, 0);
      return { course, timeSlot: slot, date: nextDate };
    }
  }

  return null;
}

// 计算距离上课还有多少分钟
export function getMinutesUntilCourse(date: Date): number {
  const now = new Date();
  return Math.floor((date.getTime() - now.getTime()) / 60000);
}

// 格式化剩余时间
export function formatTimeRemaining(minutes: number): string {
  if (minutes < 0) return '已开始';
  if (minutes < 60) return `${minutes} 分钟后`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} 小时 ${mins} 分钟后` : `${hours} 小时后`;
}

// 默认提醒设置
export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: false,
  advanceMinutes: 15,
  enableSound: true,
  enableVibration: true,
};