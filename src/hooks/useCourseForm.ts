import { useState, useCallback } from 'react';
import type { Course } from '../data/models';
import { useCourseStore } from '../data/stores';
import { COURSE_COLORS } from '../core/constants';

export function useCourseForm(scheduleId: string, initialCourse?: Course) {
  const { addCourse, updateCourse } = useCourseStore();

  const [formData, setFormData] = useState({
    name: initialCourse?.name || '',
    teacher: initialCourse?.teacher || '',
    location: initialCourse?.location || '',
    weeks: initialCourse?.weeks || [],
    dayOfWeek: initialCourse?.dayOfWeek || 1,
    startSection: initialCourse?.startSection || 1,
    endSection: initialCourse?.endSection || 1,
    color: initialCourse?.color || COURSE_COLORS[0],
    remark: initialCourse?.remark || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback(<K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入课程名称';
    }

    if (formData.weeks.length === 0) {
      newErrors.weeks = '请选择上课周次';
    }

    if (formData.startSection > formData.endSection) {
      newErrors.sections = '开始节次不能大于结束节次';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const save = useCallback(() => {
    if (!validate()) return false;

    if (initialCourse?.id) {
      updateCourse(initialCourse.id, formData);
    } else {
      addCourse({
        scheduleId,
        ...formData,
      });
    }

    return true;
  }, [initialCourse, scheduleId, formData, validate, addCourse, updateCourse]);

  const toggleWeek = useCallback((week: number) => {
    setFormData((prev) => {
      const weeks = prev.weeks.includes(week)
        ? prev.weeks.filter((w) => w !== week)
        : [...prev.weeks, week].sort((a, b) => a - b);
      return { ...prev, weeks };
    });
  }, []);

  const setWeekRange = useCallback((start: number, end: number) => {
    const weeks = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    setFormData((prev) => ({ ...prev, weeks }));
  }, []);

  return {
    formData,
    errors,
    updateField,
    validate,
    save,
    toggleWeek,
    setWeekRange,
  };
}