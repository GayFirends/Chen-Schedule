import type { Course, TimeSlot } from '../../data/models';
import { useTimeSlotStore } from '../../data/stores';
import { useScheduleGrid, type CourseCell } from '../../hooks/useScheduleGrid';
import { CourseCard, CourseCardLarge } from './CourseCard';
import { WEEKDAYS } from '../../core/constants';
import { Button, Modal } from '../common';
import { useState } from 'react';

interface ScheduleGridProps {
  scheduleId: string;
  week: number;
  onAddCourse?: (dayOfWeek: number, startSection: number) => void;
  onEditCourse?: (course: Course) => void;
  onDeleteCourse?: (course: Course) => void;
}

export function ScheduleGrid({ scheduleId, week, onAddCourse, onEditCourse, onDeleteCourse }: ScheduleGridProps) {
  const { timeSlots } = useTimeSlotStore();
  const { gridMap, maxSection } = useScheduleGrid(scheduleId, week);
  const [selectedCourse, setSelectedCourse] = useState<CourseCell | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const today = new Date().getDay();
  const todayWeekday = today === 0 ? 7 : today;

  const handleCellClick = (dayOfWeek: number, section: number) => {
    const cell = gridMap.get(`${dayOfWeek}-${section}`);
    if (cell && cell.isStart) {
      setSelectedCourse(cell);
    } else if (!cell) {
      onAddCourse?.(dayOfWeek, section);
    }
  };

  const handleDelete = () => {
    if (selectedCourse) {
      onDeleteCourse?.(selectedCourse);
      setSelectedCourse(null);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="schedule-grid">
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="schedule-th">节</th>
              {WEEKDAYS.map((day, i) => (
                <th key={day} className={`schedule-th ${i + 1 === todayWeekday ? 'is-today-header' : ''}`}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxSection }, (_, i) => i + 1).map((section) => {
              const slot = timeSlots.find((t) => t.section === section) as TimeSlot | undefined;
              return (
                <tr key={section} className="schedule-tr">
                  <td className="schedule-td schedule-time">
                    <div className="schedule-section">{section}</div>
                    {slot && <div className="schedule-clock">{slot.startTime}<br />{slot.endTime}</div>}
                  </td>
                  {WEEKDAYS.map((_, i) => {
                    const dayOfWeek = i + 1;
                    const key = `${dayOfWeek}-${section}`;
                    const cell = gridMap.get(key);

                    if (!cell) {
                      return (
                        <td
                          key={key}
                          className={`schedule-td ${dayOfWeek === todayWeekday ? 'is-today' : ''}`}
                          onClick={() => handleCellClick(dayOfWeek, section)}
                        />);
                    }

                    if (!cell.isStart) return null;

                    return (
                      <td
                        key={key}
                        className={`schedule-td ${dayOfWeek === todayWeekday ? 'is-today' : ''}`}
                        rowSpan={cell.rowSpan}
                        onClick={() => handleCellClick(dayOfWeek, section)}
                      >
                        <CourseCard course={cell} onClick={() => setSelectedCourse(cell)} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Course Detail Modal */}
      <Modal isOpen={!!selectedCourse} onClose={() => setSelectedCourse(null)}>
        {selectedCourse && (
          <CourseCardLarge
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)}
            onEdit={() => { onEditCourse?.(selectedCourse); setSelectedCourse(null); }}
            onDelete={() => setShowDeleteConfirm(true)}
          />
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="确认删除">
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '20px' }}>
          确定要删除「<span style={{ fontWeight: 500, color: 'var(--on-surface)' }}>{selectedCourse?.name}</span>」吗？
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(false)}>取消</Button>
          <Button variant="danger" style={{ flex: 1 }} onClick={handleDelete}>删除</Button>
        </div>
      </Modal>
    </>
  );
}