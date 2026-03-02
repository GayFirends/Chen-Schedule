import { useMemo } from 'react';
import { useCourseStore } from '../data/stores';
import type { Course } from '../data/models';

export interface CourseCell extends Course {
  rowSpan: number;
  isStart: boolean;
  isEnd: boolean;
}

export function useScheduleGrid(scheduleId: string, week: number) {
  // 直接获取 courses 数组，确保响应式更新
  const courses = useCourseStore((state) => state.courses);

  // 过滤当前周的课程
  const weekCourses = useMemo(() => {
    return courses.filter(
      (c) => c.scheduleId === scheduleId && c.weeks.includes(week)
    );
  }, [courses, scheduleId, week]);

  // 按 (dayOfWeek, startSection) 排序
  const sortedCourses = useMemo(() => {
    return [...weekCourses].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.startSection - b.startSection;
    });
  }, [weekCourses]);

  // 构建网格数据 (7天 x 最大节次)
  const grid = useMemo(() => {
    const maxSection = Math.max(...weekCourses.map((c: Course) => c.endSection), 10);
    const gridMap: Map<string, CourseCell> = new Map();

    sortedCourses.forEach((course) => {
      const key = `${course.dayOfWeek}-${course.startSection}`;
      gridMap.set(key, {
        ...course,
        rowSpan: course.endSection - course.startSection + 1,
        isStart: true,
        isEnd: course.endSection === course.startSection,
      });

      // 标记被占用的格子
      for (let i = course.startSection + 1; i <= course.endSection; i++) {
        const occupiedKey = `${course.dayOfWeek}-${i}`;
        gridMap.set(occupiedKey, {
          ...course,
          rowSpan: course.endSection - course.startSection + 1,
          isStart: false,
          isEnd: i === course.endSection,
        });
      }
    });

    return { gridMap, maxSection };
  }, [sortedCourses, weekCourses]);

  return {
    courses: sortedCourses,
    gridMap: grid.gridMap,
    maxSection: grid.maxSection,
  };
}