# 创建版本标签触发 APK 构建

## 前提条件
- 已 commit 并 push 所有更改到 main 分支
- GitHub Actions 配置正确（`.github/workflows/mobile.yml`）

## 创建标签

```bash
# 方式一：创建并推送标签（推荐）
git tag v1.0.2 && git push github v1.0.2

# 方式二：分步执行
git tag v1.0.2          # 创建标签
git push github v1.0.2  # 推送标签
```

## 版本号规范
- 格式：`v主版本号.次版本号.修订号`
- 示例：`v1.0.0`, `v1.0.1`, `v1.1.0`, `v2.0.0`

## 删除标签

```bash
# 删除本地标签
git tag -d v1.0.2

# 删除远程标签
git push --delete github v1.0.2
```

## 更新标签

```bash
# 删除旧标签并创建新标签
git push --delete github v1.0.2
git tag -d v1.0.2
git tag v1.0.2
git push github v1.0.2
```

## 下载 APK

1. 进入 GitHub 仓库的 **Actions** 页面
2. 点击已完成的 "Build Mobile App" 工作流
3. 滚动到页面底部的 **Artifacts** 区域
4. 点击 `android-apk` 下载压缩包
5. 解压后得到 `app-debug.apk` 文件