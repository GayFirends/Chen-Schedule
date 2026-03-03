# 简课表 - 一个基于Typscript的跨平台课表App

一个基于 React + TypeScript 构建的跨平台课程表应用，支持 PWA 和 Capacitor 原生应用。

使用 AI 工具辅助编写，修改BUG。

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

## 后续计划

| 计划 | 进度 |
|------|------|
| 桌面小组件 | × |
| 更多教务系统导入 | x |
| iOS版本应用 | x |

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

## 许可证

MIT License