import type { ImportResult, EducationalSystemType } from '../models';

// 解析周次字符串，如 "1-8周", "1,3,5周", "单周", "双周"
export function parseWeeks(weekStr: string): number[] {
  const weeks: number[] = [];
  const str = weekStr.trim();

  // 单周
  if (str.includes('单')) {
    for (let i = 1; i <= 25; i += 2) weeks.push(i);
    return weeks;
  }

  // 双周
  if (str.includes('双')) {
    for (let i = 2; i <= 25; i += 2) weeks.push(i);
    return weeks;
  }

  // 移除"周"字
  const cleanStr = str.replace(/周/g, '');

  // 处理逗号分隔
  const parts = cleanStr.split(/[,，]/);
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // 范围格式 1-8
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(s => parseInt(s.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) weeks.push(i);
      }
    } else {
      const num = parseInt(trimmed);
      if (!isNaN(num)) weeks.push(num);
    }
  }

  return [...new Set(weeks)].sort((a, b) => a - b);
}

// 解析节次字符串，如 "1-2节", "第1-2节", "1,2节"
export function parseSections(sectionStr: string): { start: number; end: number } | null {
  const str = sectionStr.trim().replace(/节/g, '').replace(/第/g, '');

  // 范围格式
  if (str.includes('-')) {
    const [start, end] = str.split('-').map(s => parseInt(s.trim()));
    if (!isNaN(start) && !isNaN(end)) {
      return { start, end };
    }
  }

  // 逗号分隔
  if (str.includes(',') || str.includes('，')) {
    const nums = str.split(/[,，]/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (nums.length > 0) {
      return { start: Math.min(...nums), end: Math.max(...nums) };
    }
  }

  // 单个数字
  const num = parseInt(str);
  if (!isNaN(num)) {
    return { start: num, end: num };
  }

  return null;
}

// 解析星期，如 "星期一", "周一", "一", "1"
export function parseDayOfWeek(dayStr: string): number {
  const str = dayStr.trim();

  const dayMap: Record<string, number> = {
    '一': 1, '周一': 1, '星期一': 1, '1': 1,
    '二': 2, '周二': 2, '星期二': 2, '2': 2,
    '三': 3, '周三': 3, '星期三': 3, '3': 3,
    '四': 4, '周四': 4, '星期四': 4, '4': 4,
    '五': 5, '周五': 5, '星期五': 5, '5': 5,
    '六': 6, '周六': 6, '星期六': 6, '6': 6,
    '日': 7, '周日': 7, '星期日': 7, '七': 7, '7': 7,
  };

  for (const [key, value] of Object.entries(dayMap)) {
    if (str.includes(key)) return value;
  }

  return 0;
}

// 正方教务系统 HTML 解析
export function parseZhengfangHTML(html: string, scheduleId: string): ImportResult {
  const courses: ImportResult['courses'] = [];
  const errors: string[] = [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 查找课表表格
    const tables = doc.querySelectorAll('table');

    for (const table of tables) {
      const rows = table.querySelectorAll('tr');

      for (const row of rows) {
        const cells = row.querySelectorAll('td, th');

        for (let i = 0; i < cells.length; i++) {
          const cell = cells[i];
          const text = cell.textContent?.trim() || '';

          // 跳过空单元格和表头
          if (!text || text.includes('星期') || text.includes('节次')) continue;

          // 解析课程信息
          const courseInfo = parseZhengfangCourseCell(text);
          if (courseInfo) {
            courses.push({
              name: courseInfo.name,
              teacher: courseInfo.teacher,
              location: courseInfo.location,
              weeks: courseInfo.weeks,
              dayOfWeek: i, // 列索引对应星期
              startSection: 1, // 需要根据行索引计算
              endSection: 2,
              color: undefined,
              remark: undefined,
            });
          }
        }
      }
    }
  } catch (e) {
    errors.push(`解析错误: ${e}`);
  }

  return { success: courses.length > 0, courses, errors };
}

// 解析正方系统单元格内容
function parseZhengfangCourseCell(text: string): {
  name: string;
  teacher?: string;
  location?: string;
  weeks: number[];
} | null {
  // 正方系统通常格式: 课程名\n教师\n教室\n周次
  const lines = text.split(/\n|<br\/?>/).map(l => l.trim()).filter(Boolean);

  if (lines.length < 2) return null;

  const name = lines[0];
  let teacher: string | undefined;
  let location: string | undefined;
  let weeks: number[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // 检测周次
    if (line.includes('周')) {
      weeks = parseWeeks(line);
    }
    // 检测地点（通常包含楼、室等）
    else if (line.includes('楼') || line.includes('室') || line.includes('教室')) {
      location = line;
    }
    // 其余当作教师名
    else if (!teacher) {
      teacher = line;
    }
  }

  return { name, teacher, location, weeks };
}

// 青果教务系统 HTML 解析
export function parseQingguoHTML(html: string, scheduleId: string): ImportResult {
  const courses: ImportResult['courses'] = [];
  const errors: string[] = [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 青果系统的表格结构
    const tables = doc.querySelectorAll('table');

    for (const table of tables) {
      const rows = table.querySelectorAll('tr');

      for (const row of rows) {
        const cells = row.querySelectorAll('td');

        for (const cell of cells) {
          const text = cell.textContent?.trim() || '';
          if (!text) continue;

          const courseInfo = parseQingguoCourseCell(text);
          if (courseInfo) {
            courses.push({
              name: courseInfo.name,
              teacher: courseInfo.teacher,
              location: courseInfo.location,
              weeks: courseInfo.weeks,
              dayOfWeek: courseInfo.dayOfWeek,
              startSection: courseInfo.startSection,
              endSection: courseInfo.endSection,
              color: undefined,
              remark: undefined,
            });
          }
        }
      }
    }
  } catch (e) {
    errors.push(`解析错误: ${e}`);
  }

  return { success: courses.length > 0, courses, errors };
}

// 解析青果系统单元格内容
function parseQingguoCourseCell(text: string): {
  name: string;
  teacher?: string;
  location?: string;
  weeks: number[];
  dayOfWeek: number;
  startSection: number;
  endSection: number;
} | null {
  // 青果系统格式略有不同
  const lines = text.split(/\n|<br\/?>/).map(l => l.trim()).filter(Boolean);

  if (lines.length === 0) return null;

  // 简单解析，实际需要根据青果系统具体格式调整
  return {
    name: lines[0],
    teacher: lines[1],
    location: lines[2],
    weeks: parseWeeks(lines.find(l => l.includes('周')) || ''),
    dayOfWeek: 1,
    startSection: 1,
    endSection: 2,
  };
}

// 通用 HTML 表格解析
export function parseGenericHTML(html: string, scheduleId: string): ImportResult {
  const courses: ImportResult['courses'] = [];
  const errors: string[] = [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tables = doc.querySelectorAll('table');

    // 找到最大的表格作为课表
    let scheduleTable: HTMLTableElement | null = null;
    let maxCells = 0;

    for (const table of tables) {
      const cellCount = table.querySelectorAll('td, th').length;
      if (cellCount > maxCells) {
        maxCells = cellCount;
        scheduleTable = table;
      }
    }

    if (!scheduleTable) {
      return { success: false, courses: [], errors: ['未找到课表表格'] };
    }

    const rows = scheduleTable.querySelectorAll('tr');

    // 找表头行
    for (const row of rows) {
      const cells = row.querySelectorAll('th');
      if (cells.length > 0) {
        break;
      }
    }

    // 解析数据行
    for (const row of rows) {
      const cells = row.querySelectorAll('td');
      if (cells.length === 0) continue;

      // 第一列通常是节次
      const sectionText = cells[0].textContent?.trim() || '';
      const section = parseSections(sectionText);

      // 后续列是每一天的课程
      for (let i = 1; i < cells.length; i++) {
        const cell = cells[i];
        const text = cell.textContent?.trim() || '';

        if (!text || text.length < 2) continue;

        const courseInfo = parseGenericCourseCell(text);
        if (courseInfo && section) {
          courses.push({
            name: courseInfo.name,
            teacher: courseInfo.teacher,
            location: courseInfo.location,
            weeks: courseInfo.weeks.length > 0 ? courseInfo.weeks : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
            dayOfWeek: i, // 列索引对应星期
            startSection: section.start,
            endSection: section.end,
            color: undefined,
            remark: undefined,
          });
        }
      }
    }
  } catch (e) {
    errors.push(`解析错误: ${e}`);
  }

  return { success: courses.length > 0, courses, errors };
}

// 通用单元格解析
function parseGenericCourseCell(text: string): {
  name: string;
  teacher?: string;
  location?: string;
  weeks: number[];
} | null {
  const lines = text.split(/\n|<br\/?>/).map(l => l.trim()).filter(Boolean);

  if (lines.length === 0) return null;

  return {
    name: lines[0],
    teacher: lines.length > 1 ? lines[1] : undefined,
    location: lines.length > 2 ? lines[2] : undefined,
    weeks: parseWeeks(lines.find(l => l.includes('周')) || '1-18'),
  };
}

// 统一导入函数
export function importFromHTML(
  html: string,
  scheduleId: string,
  systemType: EducationalSystemType
): ImportResult {
  switch (systemType) {
    case 'zhengfang':
      return parseZhengfangHTML(html, scheduleId);
    case 'qingguo':
      return parseQingguoHTML(html, scheduleId);
    case 'generic':
    default:
      return parseGenericHTML(html, scheduleId);
  }
}

// 从 URL 抓取课表（需要后端代理或 CORS 支持）
export async function fetchScheduleFromURL(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`无法获取课表: ${error}`);
  }
}