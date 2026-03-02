import { useState } from 'react';
import { Button, Card, Input, Modal } from '../components/common';
import { useWebDAVStore, useScheduleStore, useCourseStore, useTimeSlotStore } from '../data/stores';
import { testConnection, exportToWebDAV, importFromWebDAV } from '../data/services/webdav';
import type { WebDAVConfig } from '../data/models';

export function SyncPage() {
  const { config, syncStatus, setConfig, setSyncStatus } = useWebDAVStore();
  const { schedules } = useScheduleStore();
  const { courses } = useCourseStore();
  const { timeSlots } = useTimeSlotStore();

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<WebDAVConfig>(config || { serverUrl: '', username: '', password: '', remotePath: '/schedule' });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => { setTesting(true); setTestResult(null); const result = await testConnection(editingConfig); setTestResult(result); setTesting(false); };
  const handleUpload = async () => { if (!config) return; setSyncStatus({ isSyncing: true, lastError: undefined }); const result = await exportToWebDAV(config, { schedules, courses, timeSlots }); if (result.success) { setSyncStatus({ isSyncing: false, lastSyncTime: new Date().toISOString() }); alert('上传成功！'); } else { setSyncStatus({ isSyncing: false, lastError: result.message }); alert(`上传失败：${result.message}`); } };
  const handleDownload = async () => { if (!config) return; setSyncStatus({ isSyncing: true, lastError: undefined }); const result = await importFromWebDAV(config); if (result.success && result.data) { localStorage.setItem('schedules', JSON.stringify(result.data.schedules)); localStorage.setItem('courses', JSON.stringify(result.data.courses)); localStorage.setItem('timeSlots', JSON.stringify(result.data.timeSlots)); setSyncStatus({ isSyncing: false, lastSyncTime: new Date().toISOString() }); alert('下载成功！页面将刷新。'); window.location.reload(); } else { setSyncStatus({ isSyncing: false, lastError: result.message }); alert(`下载失败：${result.message}`); } };

  return (
    <div className="settings-page">
      <header className="page-header">
        <h1 className="page-title">云同步</h1>
      </header>

      <main className="page-main">
        {/* WebDAV Config */}
        <section className="page-section">
          <h2 className="section-title">WebDAV 配置</h2>
          <Card className="list-card">
            {config ? (
              <div className="list-item">
                <div className="list-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
                </div>
                <div className="list-content">
                  <div className="list-title">{config.username}</div>
                  <div className="list-subtitle">{config.serverUrl}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setEditingConfig(config); setTestResult(null); setShowConfigModal(true); }}>编辑</Button>
              </div>
            ) : (
              <button onClick={() => { setEditingConfig({ serverUrl: '', username: '', password: '', remotePath: '/schedule' }); setTestResult(null); setShowConfigModal(true); }} className="list-item">
                <div className="list-icon plain">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </div>
                <div className="list-content">
                  <div className="list-title">添加 WebDAV 服务器</div>
                  <div className="list-subtitle">支持坚果云、Nextcloud 等</div>
                </div>
                <svg className="list-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
          </Card>
        </section>

        {/* Sync Actions */}
        {config && (
          <section className="page-section">
            <h2 className="section-title">同步操作</h2>
            <Card>
              <div style={{ padding: '16px' }}>
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={handleUpload} disabled={syncStatus.isSyncing}>上传到云端</Button>
                  <Button variant="secondary" className="flex-1" onClick={handleDownload} disabled={syncStatus.isSyncing}>从云端下载</Button>
                </div>
                {syncStatus.lastSyncTime && (
                  <div className="sync-status">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>上次同步：{new Date(syncStatus.lastSyncTime).toLocaleString('zh-CN')}</span>
                  </div>
                )}
              </div>
            </Card>
          </section>
        )}

        {/* Local Data */}
        {config && (
          <section className="page-section">
            <h2 className="section-title">本地数据</h2>
            <Card>
              <div className="stats-row">
                <div className="stat-item">
                  <div className="stat-num">{schedules.length}</div>
                  <div className="stat-label">课表</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">{courses.length}</div>
                  <div className="stat-label">课程</div>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Help */}
        <section className="page-section">
          <h2 className="section-title">使用帮助</h2>
          <Card>
            <div style={{ padding: '16px' }}>
              <p style={{ color: 'var(--on-surface)', marginBottom: '12px' }}>WebDAV 是一种标准的文件同步协议，支持多种云存储服务。</p>
              <div className="help-box">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <div className="help-title">坚果云用户</div>
                  <div className="help-text">账户信息 → 安全选项 → 添加应用密码</div>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <Modal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} title="WebDAV 配置">
        <div className="space-y-4">
          <Input label="服务器地址" placeholder="https://dav.jianguoyun.com/dav/" value={editingConfig.serverUrl} onChange={(e) => setEditingConfig({ ...editingConfig, serverUrl: e.target.value })} />
          <Input label="用户名" placeholder="邮箱或用户名" value={editingConfig.username} onChange={(e) => setEditingConfig({ ...editingConfig, username: e.target.value })} />
          <Input label="密码" type="password" placeholder="应用密码" value={editingConfig.password} onChange={(e) => setEditingConfig({ ...editingConfig, password: e.target.value })} />
          <Input label="远程路径" placeholder="/schedule" value={editingConfig.remotePath} onChange={(e) => setEditingConfig({ ...editingConfig, remotePath: e.target.value })} />
          {testResult && (
            <div className={`result-box ${testResult.success ? 'success' : 'error'}`}>
              {testResult.message}
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleTestConnection} disabled={testing}>{testing ? '测试中...' : '测试连接'}</Button>
            <div style={{ flex: 1 }} />
            <Button variant="ghost" onClick={() => setShowConfigModal(false)}>取消</Button>
            <Button onClick={() => { setConfig(editingConfig); setShowConfigModal(false); }}>保存</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}