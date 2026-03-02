import { COURSE_COLORS } from '../constants';

// 简单的颜色哈希函数，根据课程名生成颜色
export function getCourseColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COURSE_COLORS[Math.abs(hash) % COURSE_COLORS.length];
}

// 检查颜色是否为深色
export function isColorDark(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

// 获取课程文字颜色
export function getTextColor(backgroundColor: string): string {
  return isColorDark(backgroundColor) ? '#ffffff' : '#1e293b';
}

// 生成渐变色
export function getGradient(color: string): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const lighterR = Math.min(r + 30, 255);
  const lighterG = Math.min(g + 30, 255);
  const lighterB = Math.min(b + 30, 255);

  return `linear-gradient(135deg, ${color}, rgb(${lighterR}, ${lighterG}, ${lighterB}))`;
}