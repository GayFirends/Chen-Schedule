export * from './color';

// 格式化时间
export function formatTime(time: string): string {
  return time;
}

// 获取当前周次（基于学期开始日期）
export function getCurrentWeek(semesterStartDate: Date): number {
  const now = new Date();
  const diff = now.getTime() - semesterStartDate.getTime();
  const week = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, week);
}

// 生成周次选项
export function generateWeekOptions(maxWeek: number): number[] {
  return Array.from({ length: maxWeek }, (_, i) => i + 1);
}

// 判断两个时间范围是否重叠
export function isTimeOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 <= end2 && start2 <= end1;
}

// 判断两个课程是否时间冲突
export function isCourseConflict(course1: {
  weeks: number[];
  dayOfWeek: number;
  startSection: number;
  endSection: number;
}, course2: {
  weeks: number[];
  dayOfWeek: number;
  startSection: number;
  endSection: number;
}): boolean {
  // 不同天不冲突
  if (course1.dayOfWeek !== course2.dayOfWeek) return false;

  // 检查周次是否有交集
  const hasCommonWeek = course1.weeks.some((w) => course2.weeks.includes(w));
  if (!hasCommonWeek) return false;

  // 检查节次是否重叠
  return isTimeOverlap(
    course1.startSection,
    course1.endSection,
    course2.startSection,
    course2.endSection
  );
}

// 深拷贝
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// 防抖
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}