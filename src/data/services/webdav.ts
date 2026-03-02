import { createClient, type WebDAVClient } from 'webdav';
import type { WebDAVConfig, SyncHistoryItem } from '../models';
import { v4 as uuidv4 } from 'uuid';

let client: WebDAVClient | null = null;

export function getWebDAVClient(): WebDAVClient | null {
  return client;
}

export function initWebDAVClient(config: WebDAVConfig): WebDAVClient {
  client = createClient(config.serverUrl, {
    username: config.username,
    password: config.password,
  });
  return client;
}

export function clearWebDAVClient(): void {
  client = null;
}

// 测试连接
export async function testConnection(config: WebDAVConfig): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = createClient(config.serverUrl, {
      username: config.username,
      password: config.password,
    });
    await testClient.getDirectoryContents('/');
    return { success: true, message: '连接成功' };
  } catch (error) {
    const message = error instanceof Error ? error.message : '连接失败';
    return { success: false, message };
  }
}

// 确保远程目录存在
async function ensureRemoteDirectory(c: WebDAVClient, path: string): Promise<void> {
  try {
    await c.createDirectory(path, { recursive: true });
  } catch {
    // 目录可能已存在
  }
}

// 计算数据的修改时间戳
export function calculateDataTimestamp(data: { schedules: unknown[]; courses: unknown[]; timeSlots: unknown[] }): string {
  const allItems = [
    ...data.schedules as Array<{ updatedAt?: string }>,
    ...data.courses as Array<{ updatedAt?: string }>,
  ];

  if (allItems.length === 0) return new Date().toISOString();

  const timestamps = allItems
    .map(item => item.updatedAt ? new Date(item.updatedAt).getTime() : 0)
    .filter(t => t > 0);

  if (timestamps.length === 0) return new Date().toISOString();

  return new Date(Math.max(...timestamps)).toISOString();
}

// 增量同步 - 获取远程元数据
export async function getRemoteMetadata(
  config: WebDAVConfig
): Promise<{ exists: boolean; timestamp?: string; version?: number }> {
  try {
    const c = initWebDAVClient(config);
    const metaPath = `${config.remotePath}/metadata.json`;
    const exists = await c.exists(metaPath);

    if (!exists) {
      return { exists: false };
    }

    const content = await c.getFileContents(metaPath, { format: 'text' }) as string;
    const meta = JSON.parse(content);
    return {
      exists: true,
      timestamp: meta.timestamp,
      version: meta.version || 1,
    };
  } catch {
    return { exists: false };
  }
}

// 保存远程元数据
async function saveRemoteMetadata(
  c: WebDAVClient,
  config: WebDAVConfig,
  timestamp: string
): Promise<void> {
  const metaPath = `${config.remotePath}/metadata.json`;
  const meta = {
    timestamp,
    version: 2,
    updatedAt: new Date().toISOString(),
  };
  await c.putFileContents(metaPath, JSON.stringify(meta, null, 2));
}

// 导出数据到 WebDAV（增量版本）
export async function exportToWebDAV(
  config: WebDAVConfig,
  data: { schedules: unknown[]; courses: unknown[]; timeSlots: unknown[] }
): Promise<{ success: boolean; message: string }> {
  try {
    const c = initWebDAVClient(config);
    await ensureRemoteDirectory(c, config.remotePath);

    const filePath = `${config.remotePath}/schedule_data.json`;
    const jsonData = JSON.stringify(data, null, 2);
    const timestamp = calculateDataTimestamp(data);

    await c.putFileContents(filePath, jsonData);
    await saveRemoteMetadata(c, config, timestamp);

    return { success: true, message: '上传成功' };
  } catch (error) {
    const message = error instanceof Error ? error.message : '上传失败';
    return { success: false, message };
  }
}

// 从 WebDAV 导入数据
export async function importFromWebDAV(
  config: WebDAVConfig
): Promise<{ success: boolean; message: string; data?: { schedules: unknown[]; courses: unknown[]; timeSlots: unknown[] } }> {
  try {
    const c = initWebDAVClient(config);

    const filePath = `${config.remotePath}/schedule_data.json`;
    const exists = await c.exists(filePath);

    if (!exists) {
      return { success: false, message: '远程数据不存在' };
    }

    const content = await c.getFileContents(filePath, { format: 'text' });
    const data = JSON.parse(content as string) as {
      schedules: unknown[];
      courses: unknown[];
      timeSlots: unknown[];
    };

    return { success: true, message: '下载成功', data };
  } catch (error) {
    const message = error instanceof Error ? error.message : '下载失败';
    return { success: false, message };
  }
}

// 增量同步 - 比较本地和远程时间戳决定同步方向
export async function smartSync(
  config: WebDAVConfig,
  localData: { schedules: unknown[]; courses: unknown[]; timeSlots: unknown[] },
  _onConflict?: (remoteTimestamp: string, localTimestamp: string) => 'upload' | 'download' | 'cancel'
): Promise<{
  action: 'upload' | 'download' | 'none' | 'cancelled';
  success: boolean;
  message: string;
  data?: { schedules: unknown[]; courses: unknown[]; timeSlots: unknown[] };
}> {
  const localTimestamp = calculateDataTimestamp(localData);
  const remoteMeta = await getRemoteMetadata(config);

  // 远程没有数据，直接上传
  if (!remoteMeta.exists) {
    const result = await exportToWebDAV(config, localData);
    return { action: 'upload', ...result };
  }

  // 比较时间戳
  const localTime = new Date(localTimestamp).getTime();
  const remoteTime = new Date(remoteMeta.timestamp || 0).getTime();

  // 本地更新，上传
  if (localTime > remoteTime) {
    const result = await exportToWebDAV(config, localData);
    return { action: 'upload', ...result };
  }

  // 远程更新，下载
  if (remoteTime > localTime) {
    const result = await importFromWebDAV(config);
    return { action: 'download', ...result };
  }

  // 时间相同，无需同步
  return { action: 'none', success: true, message: '数据已是最新' };
}

// 获取远程文件信息
export async function getRemoteFileInfo(
  config: WebDAVConfig
): Promise<{ exists: boolean; lastModified?: string; size?: number }> {
  try {
    const c = initWebDAVClient(config);
    const filePath = `${config.remotePath}/schedule_data.json`;
    const exists = await c.exists(filePath);

    if (!exists) {
      return { exists: false };
    }

    const stat = await c.stat(filePath) as { lastModified?: string; size?: number };
    return {
      exists: true,
      lastModified: stat.lastModified,
      size: stat.size,
    };
  } catch {
    return { exists: false };
  }
}

// 创建同步历史记录
export function createSyncHistoryItem(
  type: SyncHistoryItem['type'],
  status: SyncHistoryItem['status'],
  stats?: { schedules: number; courses: number },
  message?: string
): SyncHistoryItem {
  return {
    id: uuidv4(),
    type,
    timestamp: new Date().toISOString(),
    status,
    message,
    stats,
  };
}