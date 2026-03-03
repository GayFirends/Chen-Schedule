import { useEffect, useRef } from 'react';
import { useCourseStore, useTimeSlotStore, useScheduleStore } from '../data/stores';
import { useReminderStore } from '../data/stores/reminder';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendCourseNotification,
  getNextCourseTime,
  getMinutesUntilCourse,
} from '../data/services/notification';

export function useReminder() {
  const { courses } = useCourseStore();
  const { timeSlots } = useTimeSlotStore();
  const { currentScheduleId } = useScheduleStore();
  const { enabled, advanceMinutes } = useReminderStore();
  const checkIntervalRef = useRef<number | null>(null);

  // 检查并发送提醒
  const checkAndNotify = async () => {
    if (!enabled) return;
    const permission = await getNotificationPermission();
    if (permission !== 'granted') return;
    if (!currentScheduleId) return;

    const scheduleCourses = courses.filter(c => c.scheduleId === currentScheduleId);
    // 计算当前周次（简化处理，实际应从设置获取）
    const currentWeek = getCurrentWeek();

    const next = getNextCourseTime(scheduleCourses, timeSlots, currentWeek);
    if (!next) return;

    const minutesUntil = getMinutesUntilCourse(next.date);

    // 如果在提醒时间范围内，发送通知
    if (minutesUntil > 0 && minutesUntil <= advanceMinutes) {
      await sendCourseNotification(next.course, next.timeSlot);
    }
  };

  // 启用提醒
  const enableReminder = async () => {
    if (!isNotificationSupported()) {
      alert('您的设备不支持通知功能');
      return false;
    }

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      alert('请允许通知权限以启用课程提醒');
      return false;
    }

    return true;
  };

  // 定时检查
  useEffect(() => {
    const startChecking = async () => {
      const permission = await getNotificationPermission();
      if (enabled && permission === 'granted') {
        // 每分钟检查一次
        checkIntervalRef.current = window.setInterval(checkAndNotify, 60000);
        // 立即检查一次
        checkAndNotify();
      }
    };

    startChecking();

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [enabled, courses, timeSlots, advanceMinutes]);

  return {
    isSupported: isNotificationSupported(),
    enableReminder,
  };
}

// 简单计算当前周次（实际应根据学期开始日期计算）
function getCurrentWeek(): number {
  // 这里简化处理，返回1，实际应该根据设置中的学期开始日期计算
  return 1;
}