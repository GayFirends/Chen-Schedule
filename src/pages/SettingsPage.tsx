import { useState } from 'react';
import { Button, Card, Input, Modal } from '../components/common';
import { useTimeSlotStore, useScheduleStore } from '../data/stores';
import { useTheme } from '../hooks/useTheme';
import { useReminder } from '../hooks/useReminder';
import { ReminderSettings } from '../components/settings/ReminderSettings';
import type { TimeSlot } from '../data/models';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { schedules, deleteSchedule } = useScheduleStore();
  const { timeSlots, setTimeSlots } = useTimeSlotStore();
  const { enableReminder } = useReminder();
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [editingTimeSlots, setEditingTimeSlots] = useState<TimeSlot[]>([]);

  const handleEditTimeSlots = () => { setEditingTimeSlots([...timeSlots]); setShowTimeSlotModal(true); };
  const handleUpdateTimeSlot = (index: number, field: 'startTime' | 'endTime', value: string) => { setEditingTimeSlots((prev) => { const updated = [...prev]; updated[index] = { ...updated[index], [field]: value }; return updated; }); };
  const handleAddTimeSlot = () => { const lastSlot = editingTimeSlots[editingTimeSlots.length - 1]; const newSection = lastSlot ? lastSlot.section + 1 : 1; setEditingTimeSlots((prev) => [...prev, { section: newSection, startTime: '08:00', endTime: '08:45' }]); };
  const handleRemoveTimeSlot = (index: number) => { setEditingTimeSlots((prev) => prev.filter((_, i) => i !== index).map((slot, i) => ({ ...slot, section: i + 1 }))); };
  const handleExportData = () => { const data = { schedules, timeSlots, exportDate: new Date().toISOString() }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `schedule_backup_${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url); };

  return (
    <div className="settings-page">
      <header className="page-header">
        <h1 className="page-title">设置</h1>
      </header>

      <main className="page-main">
        {/* Theme */}
        <section className="page-section">
          <h2 className="section-title">外观</h2>
          <Card>
            <div className="theme-row">
              {[{ value: 'light', label: '浅色' }, { value: 'dark', label: '深色' }, { value: 'system', label: '自动' }].map((t) => (
                <button key={t.value} onClick={() => setTheme(t.value as 'light' | 'dark' | 'system')} className={`theme-btn ${theme === t.value ? 'active' : ''}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </Card>
        </section>

        {/* Time Slots */}
        <section className="page-section">
          <h2 className="section-title">时间表</h2>
          <Card>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'var(--on-surface)' }}>共 {timeSlots.length} 节课</span>
                <Button variant="ghost" size="sm" onClick={handleEditTimeSlots}>编辑</Button>
              </div>
              <div className="time-grid">
                {timeSlots.slice(0, 8).map((slot) => (
                  <div key={slot.section} className="time-item">
                    <div className="time-num">第{slot.section}节</div>
                    <div className="time-val">{slot.startTime}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* Reminder */}
        <section className="page-section">
          <h2 className="section-title">课程提醒</h2>
          <Card>
            <ReminderSettings onEnable={enableReminder} />
          </Card>
        </section>

        {/* Schedules */}
        <section className="page-section">
          <h2 className="section-title">课表管理</h2>
          <Card className="list-card">
            {schedules.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>暂无课表</div>
            ) : schedules.map((s) => (
              <div key={s.id} className="schedule-list-item">
                <div>
                  <div className="schedule-list-name">{s.name}</div>
                  <div className="schedule-list-weeks">第 {s.startWeek}-{s.endWeek} 周</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => confirm('确定删除？') && deleteSchedule(s.id)} style={{ color: 'var(--error)' }}>删除</Button>
              </div>
            ))}
          </Card>
        </section>

        {/* Data */}
        <section className="page-section">
          <h2 className="section-title">数据管理</h2>
          <Card className="list-card">
            <button onClick={handleExportData} className="list-item">
              <div className="list-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </div>
              <div className="list-content">
                <div className="list-title">导出数据</div>
                <div className="list-subtitle">备份课表到本地文件</div>
              </div>
              <svg className="list-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </Card>
        </section>

        {/* About */}
        <section className="page-section">
          <Card>
            <div className="about-row">
              <div className="about-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
              </div>
              <div>
                <div className="about-name">课程表</div>
                <div className="about-version">v1.0.0</div>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <Modal isOpen={showTimeSlotModal} onClose={() => setShowTimeSlotModal(false)} title="编辑时间表">
        <div className="space-y-4">
          <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="space-y-2">
            {editingTimeSlots.map((slot, i) => (
              <div key={i} className="time-edit-row">
                <span className="time-edit-num">{slot.section}</span>
                <Input type="time" value={slot.startTime} onChange={(e) => handleUpdateTimeSlot(i, 'startTime', e.target.value)} style={{ flex: 1 }} />
                <span className="time-edit-sep">-</span>
                <Input type="time" value={slot.endTime} onChange={(e) => handleUpdateTimeSlot(i, 'endTime', e.target.value)} style={{ flex: 1 }} />
                <Button variant="ghost" size="sm" onClick={() => handleRemoveTimeSlot(i)} style={{ color: 'var(--error)' }}>×</Button>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleAddTimeSlot}>+ 添加节次</Button>
            <div style={{ flex: 1 }} />
            <Button variant="secondary" onClick={() => setShowTimeSlotModal(false)}>取消</Button>
            <Button onClick={() => { setTimeSlots(editingTimeSlots); setShowTimeSlotModal(false); }}>保存</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}