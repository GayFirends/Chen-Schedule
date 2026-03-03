# 课程表 (Course Schedule)

一个基于 React + TypeScript 构建的跨平台课程表应用，支持 PWA 和 Capacitor 原生应用。

## 项目概述

这是一个功能完整的课程表管理应用，提供了课程管理、课表导入、WebDAV 云同步、本地通知提醒等功能。支持 Web、Android 和 iOS 多平台部署。

## 技术栈

| 类型 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 7 |
| UI 样式 | Tailwind CSS 4 |
| 状态管理 | Zustand 5 |
| 路由 | React Router DOM 7 |
| 数据存储 | IndexedDB (idb) |
| 日期处理 | date-fns |
| 云同步 | WebDAV |
| 跨平台 | Capacitor 6 |
| PWA | vite-plugin-pwa |

## 项目结构

```
src/
├── components/           # UI 组件
│   ├── common/          # 通用组件 (Button, Modal, Input, Select, Card)
│   ├── schedule/        # 课程表相关组件 (ScheduleGrid, CourseCard)
│   └── settings/        # 设置相关组件
├── core/                 # 核心模块
│   ├── constants/       # 常量定义 (颜色、时间表、存储键名)
│   ├── theme/           # 主题样式
│   └── utils/           # 工具函数
├── data/                 # 数据层
│   ├── db/              # IndexedDB 数据库操作
│   ├── models/          # TypeScript 类型定义
│   ├── services/        # 业务服务 (导入、WebDAV、通知)
│   └── stores/          # Zustand 状态管理
├── hooks/                # 自定义 Hooks
│   ├── useCourseForm.ts # 课程表单逻辑
│   ├── useReminder.ts   # 提醒功能
│   ├── useScheduleGrid.ts # 课程表格逻辑
│   └── useTheme.ts      # 主题切换
├── pages/                # 页面组件
│   ├── HomePage.tsx     # 首页 - 课程表展示
│   ├── ImportPage.tsx   # 导入页面
│   ├── SyncPage.tsx     # 云同步页面
│   └── SettingsPage.tsx # 设置页面
├── App.tsx               # 应用入口，路由配置
└── main.tsx              # React 渲染入口
```

## 功能特性

### 1. 课程管理
- 创建多个课表（支持不同学期）
- 添加、编辑、删除课程
- 设置课程周次范围（支持单双周）
- 课程颜色自定义
- 教师和地点信息记录

### 2. 课程表展示
- 周视图展示
- 支持周次切换
- 响应式布局
- 快速添加课程（点击空白格子）

### 3. 课程导入
- 从教务系统导入
- 支持 URL 导入
- 支持 HTML 粘贴导入
- 支持文件上传导入
- 支持方正教务系统格式

### 4. 云同步 (WebDAV)
- 配置 WebDAV 服务器
- 上传/下载数据
- 智能同步（自动判断上传或下载）
- 同步历史记录

### 5. 本地通知
- Capacitor Local Notifications
- 课前提醒
- 自定义提前时间
- 声音和震动设置

### 6. 主题设置
- 浅色/深色/跟随系统
- Material Design 3 风格

## 数据模型

### Schedule (课表)
```typescript
interface Schedule {
  id: string;
  name: string;
  startWeek: number;
  endWeek: number;
  academicYear?: string;
  semester?: number;
  createdAt: string;
  updatedAt: string;
}
```

### Course (课程)
```typescript
interface Course {
  id: string;
  scheduleId: string;
  name: string;
  teacher?: string;
  location?: string;
  weeks: number[];
  dayOfWeek: number;    // 1-7
  startSection: number;
  endSection: number;
  color?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}
```

### TimeSlot (时间设置)
```typescript
interface TimeSlot {
  section: number;
  startTime: string;    // HH:mm
  endTime: string;
}
```

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint

# Capacitor 命令
npm run cap:sync          # 同步 Web 资源到原生项目
npm run cap:open:android  # 打开 Android Studio
npm run cap:open:ios      # 打开 Xcode
npm run build:android     # 构建 Android
npm run build:ios         # 构建 iOS
```

## PWA 支持

应用配置了 PWA 支持，可安装到桌面：

- 离线可用
- 自动更新
- 独立窗口运行
- 支持手机和桌面

## 默认配置

### 默认时间表
| 节次 | 时间 |
|------|------|
| 第1节 | 08:00 - 08:45 |
| 第2节 | 08:55 - 09:40 |
| 第3节 | 10:00 - 10:45 |
| 第4节 | 10:55 - 11:40 |
| 第5节 | 14:00 - 14:45 |
| 第6节 | 14:55 - 15:40 |
| 第7节 | 16:00 - 16:45 |
| 第8节 | 16:55 - 17:40 |
| 第9节 | 19:00 - 19:45 |
| 第10节 | 19:55 - 20:40 |

### 课程颜色预设
靛蓝、紫色、粉色、玫红、橙色、黄色、绿色、青色、蓝绿、蓝色

## Capacitor 配置

- App ID: `com.example.courseschedule`
- 应用名: 课程表
- 启动页时长: 2秒
- 主题色: `#6750A4`

## 依赖检查

运行 `npm install` 确保所有依赖已安装。主要依赖包括：

- `react` & `react-dom`: UI 框架
- `react-router-dom`: 路由管理
- `zustand`: 状态管理
- `idb`: IndexedDB 操作
- `date-fns`: 日期处理
- `webdav`: WebDAV 客户端
- `uuid`: 唯一 ID 生成
- `@capacitor/*`: 跨平台支持
- `tailwindcss`: 样式框架

## 许可证

MIT License