import { createClient, type WebDAVClient } from 'webdav';
import type { WebDAVConfig } from '../models';

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

// 导出数据到 WebDAV
export async function exportToWebDAV(
  config: WebDAVConfig,
  data: { schedules: unknown[]; courses: unknown[]; timeSlots: unknown[] }
): Promise<{ success: boolean; message: string }> {
  try {
    const c = initWebDAVClient(config);
    await ensureRemoteDirectory(c, config.remotePath);

    const filePath = `${config.remotePath}/schedule_data.json`;
    const jsonData = JSON.stringify(data, null, 2);

    await c.putFileContents(filePath, jsonData);
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