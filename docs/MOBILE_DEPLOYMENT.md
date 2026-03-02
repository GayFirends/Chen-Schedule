# 课程表 App 移动端发布指南

## 一、环境要求

- Node.js 18+
- npm 或 pnpm

---

## 二、依赖安装

```bash
npm install
```

---

## 三、开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

---

## 四、移动端发布方案

### 方案 A：PWA（渐进式 Web 应用）

1. 构建项目：
```bash
npm run build
```

2. 部署到任意静态托管服务（Vercel、Netlify、GitHub Pages 等）

3. 用户通过浏览器访问后，点击"添加到主屏幕"即可安装

### 方案 B：PWABuilder 云端打包（推荐，无需本地环境）

1. 构建项目：
```bash
npm run build
```

2. 部署到线上（如 Vercel）：
```bash
# 示例：部署到 Vercel
npx vercel --prod
```

3. 访问 https://pwabuilder.com

4. 输入你的 PWA 网址

5. 选择平台并下载：
   - Android: 生成 APK 文件
   - Windows: 生成 MSIX 安装包
   - iOS: 需要 macOS + Xcode 重新签名

### 方案 C：Capgo 云端 OTA 更新

1. 注册 Capgo 账号：
   - 访问 https://capgo.app
   - 注册并创建应用，获取 API Key

2. 安装 Capgo CLI：
```bash
npm install -g @capgo/cli
```

3. 登录：
```bash
npx @capgo/cli login YOUR_API_KEY
```

4. 上传新版本：
```bash
npm run build
npx @capgo/cli upload
```

5. 已安装 App 的用户将自动收到更新

---

## 五、Capacitor 原生打包（需要本地环境）

### Android 打包（需要 Android Studio）

```bash
# 1. 安装依赖
npm install

# 2. 构建
npm run build

# 3. 添加 Android 平台
npx cap add android

# 4. 同步
npx cap sync android

# 5. 打开 Android Studio
npx cap open android
```

在 Android Studio 中构建签名 APK

### iOS 打包（需要 macOS + Xcode）

```bash
# 1. 添加 iOS 平台
npx cap add ios

# 2. 同步
npx cap sync ios

# 3. 打开 Xcode
npx cap open ios
```

在 Xcode 中构建并上传 App Store

---

## 六、项目配置文件说明

| 文件 | 说明 |
|------|------|
| `capacitor.config.ts` | Capacitor 原生配置 |
| `capgo.config.json` | Capgo OTA 更新配置 |
| `vite.config.ts` | Vite + PWA 配置 |
| `index.html` | 移动端 meta 标签配置 |

---

## 七、常用 npm 脚本

```json
{
  "dev": "启动开发服务器",
  "build": "构建生产版本",
  "preview": "预览构建结果",
  "cap:sync": "同步 Capacitor 原生项目",
  "cap:open:android": "打开 Android Studio",
  "cap:open:ios": "打开 Xcode",
  "build:android": "构建并同步 Android",
  "build:ios": "构建并同步 iOS"
}
```

---

## 八、注意事项

1. **应用签名**：发布到应用商店需要签名证书
2. **App ID**：如需发布，修改 `capacitor.config.ts` 中的 `appId`
3. **图标**：替换 `public/` 目录下的图标文件
4. **隐私政策**：上架应用商店需要提供隐私政策链接