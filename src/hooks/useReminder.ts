import { useEffect, useRef, useCallback } from 'react';
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
  const { currentScheduleId, schedules } = useScheduleStore();
  const { enabled, advanceMinutes } = useReminderStore();
  const checkIntervalRef = useRef<number | null>(null);
  const lastNotifiedRef = useRef<string | null>(null); // 防止重复通知

  // 计算当前周次
  const getCurrentWeek = useCallback((): number => {
    if (!currentScheduleId) return 1;
    const schedule = schedules.find(s => s.id === currentScheduleId);
    if (!schedule) return 1;

    // 使用学期开始日期计算当前周次（假设第一周从 startWeek 开始）
    // 这里简化处理，返回 schedule.startWeek
    // 实际应用应存储学期开始日期并计算
    const now = new Date();
    const dayOfWeek = now.getDay() || 7;

    // 简单计算：假设当前是学期第几周
    // 实际应该根据学期开始日期计算
    const currentWeek = schedule.startWeek;
    return currentWeek;
  }, [currentScheduleId, schedules]);

  // 检查并发送提醒
  const checkAndNotify = useCallback(async () => {
    if (!enabled) return;
    const permission = await getNotificationPermission();
    if (permission !== 'granted') return;
    if (!currentScheduleId) return;

    const scheduleCourses = courses.filter(c => c.scheduleId === currentScheduleId);
    const currentWeek = getCurrentWeek();

    const next = getNextCourseTime(scheduleCourses, timeSlots, currentWeek);
    if (!next) return;

    const minutesUntil = getMinutesUntilCourse(next.date);
    const notificationKey = `${next.course.id}-${next.date.toDateString()}`;

    // 如果在提醒时间范围内，且未发送过通知，则发送
    if (minutesUntil > 0 && minutesUntil <= advanceMinutes && lastNotifiedRef.current !== notificationKey) {
      lastNotifiedRef.current = notificationKey;
      await sendCourseNotification(next.course, next.timeSlot);
    }
  }, [enabled, currentScheduleId, courses, timeSlots, advanceMinutes, getCurrentWeek]);

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
      if (enabled && permission === 'granted' && currentScheduleId) {
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
  }, [enabled, currentScheduleId, checkAndNotify]);

  return {
    isSupported: isNotificationSupported(),
    enableReminder,
  };
}