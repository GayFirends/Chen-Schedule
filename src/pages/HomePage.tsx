import { useState } from 'react';
import { useScheduleStore, useCourseStore, useSettingsStore } from '../data/stores';
import { ScheduleGrid } from '../components/schedule';
import { Button, Modal, Input, Select } from '../components/common';
import { useCourseForm } from '../hooks/useCourseForm';
import { COURSE_COLORS, WEEKDAYS } from '../core/constants';
import type { Course } from '../data/models';

export function HomePage() {
  const { schedules, currentScheduleId, addSchedule, setCurrentSchedule } = useScheduleStore();
  const { deleteCourse } = useCourseStore();
  const settings = useSettingsStore();
  const currentWeek = settings.currentWeek ?? 1;
  const setCurrentWeek = settings.setCurrentWeek;

  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [initialDay, setInitialDay] = useState(1);
  const [initialSection, setInitialSection] = useState(1);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [newScheduleStartWeek, setNewScheduleStartWeek] = useState(1);
  const [newScheduleEndWeek, setNewScheduleEndWeek] = useState(18);

  const currentSchedule = schedules.find((s) => s.id === currentScheduleId);
  const maxWeek = currentSchedule?.endWeek || 18;
  const minWeek = currentSchedule?.startWeek || 1;

  if (schedules.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
        <h1 className="empty-title">欢迎使用简课表</h1>
        <p className="empty-desc">创建你的第一个课表</p>
        <Button size="lg" onClick={() => setShowAddScheduleModal(true)}>创建课表</Button>

        <Modal isOpen={showAddScheduleModal} onClose={() => setShowAddScheduleModal(false)} title="创建课表">
          <div className="space-y-4">
            <Input label="课表名称" placeholder="2024-2025 第二学期" value={newScheduleName} onChange={(e) => setNewScheduleName(e.target.value)} />
            <div className="form-row">
              <Input label="开始周次" type="number" min={1} value={newScheduleStartWeek} onChange={(e) => setNewScheduleStartWeek(Number(e.target.value))} />
              <Input label="结束周次" type="number" min={1} value={newScheduleEndWeek} onChange={(e) => setNewScheduleEndWeek(Number(e.target.value))} />
            </div>
            <div className="form-actions">
              <Button variant="secondary" onClick={() => setShowAddScheduleModal(false)}>取消</Button>
              <Button onClick={() => { if (newScheduleName.trim()) { addSchedule({ name: newScheduleName.trim(), startWeek: newScheduleStartWeek, endWeek: newScheduleEndWeek }); setNewScheduleName(''); setShowAddScheduleModal(false); } }}>创建</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header-inner">
          <select value={currentScheduleId || ''} onChange={(e) => setCurrentSchedule(e.target.value)} className="home-schedule-select">
            {schedules.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <Button variant="ghost" size="sm" onClick={() => setShowAddScheduleModal(true)}>新课表</Button>
        </div>

        <div className="home-week-bar">
          <div className="home-week-inner">
            <button onClick={() => currentWeek > minWeek && setCurrentWeek(currentWeek - 1)} disabled={currentWeek <= minWeek} className="home-week-btn">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="home-week-info">
              <span className="home-week-num">第 {currentWeek} 周</span>
              <span className="home-week-total">/ {maxWeek - minWeek + 1}</span>
            </div>
            <button onClick={() => currentWeek < maxWeek && setCurrentWeek(currentWeek + 1)} disabled={currentWeek >= maxWeek} className="home-week-btn">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
            <Button size="sm" onClick={() => handleAddCourse(1, 1)} className="home-add-btn">添加</Button>
          </div>
        </div>
      </header>

      <div className="home-grid">
        {currentScheduleId && <ScheduleGrid scheduleId={currentScheduleId} week={currentWeek} onAddCourse={handleAddCourse} onEditCourse={handleEditCourse} onDeleteCourse={handleDeleteCourse} />}
      </div>

      {currentScheduleId && <CourseFormModal isOpen={showAddCourseModal} onClose={() => { setShowAddCourseModal(false); setEditingCourse(null); }} scheduleId={currentScheduleId} initialCourse={editingCourse} initialDay={initialDay} initialSection={initialSection} />}

      <Modal isOpen={showAddScheduleModal} onClose={() => setShowAddScheduleModal(false)} title="创建课表">
        <div className="space-y-4">
          <Input label="课表名称" placeholder="2024-2025 第二学期" value={newScheduleName} onChange={(e) => setNewScheduleName(e.target.value)} />
          <div className="form-row">
            <Input label="开始周次" type="number" min={1} value={newScheduleStartWeek} onChange={(e) => setNewScheduleStartWeek(Number(e.target.value))} />
            <Input label="结束周次" type="number" min={1} value={newScheduleEndWeek} onChange={(e) => setNewScheduleEndWeek(Number(e.target.value))} />
          </div>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setShowAddScheduleModal(false)}>取消</Button>
            <Button onClick={() => { if (newScheduleName.trim()) { addSchedule({ name: newScheduleName.trim(), startWeek: newScheduleStartWeek, endWeek: newScheduleEndWeek }); setNewScheduleName(''); setShowAddScheduleModal(false); } }}>创建</Button>
          </div>
        </div>
      </Modal>
    </div>
  );

  function handleAddCourse(dayOfWeek: number, startSection: number) { setInitialDay(dayOfWeek); setInitialSection(startSection); setEditingCourse(null); setShowAddCourseModal(true); }
  function handleEditCourse(course: Course) { setEditingCourse(course); setShowAddCourseModal(true); }
  function handleDeleteCourse(course: Course) { deleteCourse(course.id); }
}

function CourseFormModal({ isOpen, onClose, scheduleId, initialCourse, initialDay = 1, initialSection = 1 }: { isOpen: boolean; onClose: () => void; scheduleId: string; initialCourse?: Course | null; initialDay?: number; initialSection?: number; }) {
  const { formData, errors, updateField, save, toggleWeek, setWeekRange } = useCourseForm(scheduleId, initialCourse || undefined);
  const [initialized, setInitialized] = useState(false);

  if (isOpen && !initialCourse && !initialized) { setWeekRange(1, 18); updateField('dayOfWeek', initialDay); updateField('startSection', initialSection); updateField('endSection', initialSection); setInitialized(true); }

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); setInitialized(false); }} title={initialCourse ? '编辑课程' : '添加课程'}>
      <div className="space-y-4">
        <Input label="课程名称" placeholder="请输入课程名称" value={formData.name} onChange={(e) => updateField('name', e.target.value)} error={errors.name} />
        <div className="form-row">
          <Input label="教师" placeholder="教师姓名" value={formData.teacher} onChange={(e) => updateField('teacher', e.target.value)} />
          <Input label="地点" placeholder="上课地点" value={formData.location} onChange={(e) => updateField('location', e.target.value)} />
        </div>
        <div className="form-row-3">
          <Select label="星期" value={formData.dayOfWeek} onChange={(e) => updateField('dayOfWeek', Number(e.target.value))} options={WEEKDAYS.map((d, i) => ({ value: i + 1, label: d }))} />
          <Select label="开始节" value={formData.startSection} onChange={(e) => updateField('startSection', Number(e.target.value))} options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `第${i + 1}节` }))} />
          <Select label="结束节" value={formData.endSection} onChange={(e) => updateField('endSection', Number(e.target.value))} options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `第${i + 1}节` }))} />
        </div>

        <div>
          <label className="form-label">上课周次</label>
          <div className="week-pills">{Array.from({ length: 25 }, (_, i) => i + 1).map((w) => (<button key={w} type="button" onClick={() => toggleWeek(w)} className={`week-pill ${formData.weeks.includes(w) ? 'active' : ''}`}>{w}</button>))}</div>
          <div className="flex gap-2 mt-2"><Button variant="ghost" size="sm" onClick={() => setWeekRange(1, 18)}>1-18周</Button><Button variant="ghost" size="sm" onClick={() => updateField('weeks', [])}>清空</Button></div>
        </div>

        <div>
          <label className="form-label">颜色</label>
          <div className="color-swatches">{COURSE_COLORS.map((c) => (<button key={c} type="button" onClick={() => updateField('color', c)} className={`color-swatch ${formData.color === c ? 'active' : ''}`} style={{ backgroundColor: c }} />))}</div>
        </div>

        <Input label="备注" placeholder="其他信息" value={formData.remark} onChange={(e) => updateField('remark', e.target.value)} />

        <div className="form-actions">
          <Button variant="secondary" onClick={() => { onClose(); setInitialized(false); }}>取消</Button>
          <Button onClick={() => { if (save()) { onClose(); setInitialized(false); } }}>{initialCourse ? '保存' : '添加'}</Button>
        </div>
      </div>
    </Modal>
  );
}