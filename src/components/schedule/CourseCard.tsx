import type { Course } from '../../data/models';
import { getGradient, getTextColor } from '../../core/utils';
import { WEEKDAYS } from '../../core/constants';
import type { ReactNode } from 'react';

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
  className?: string;
}

export function CourseCard({ course, onClick, className = '' }: CourseCardProps) {
  const bg = course.color || '#6366f1';
  const gradient = getGradient(bg);
  const textColor = getTextColor(bg);

  return (
    <div
      className={`course-card ${className}`}
      style={{ background: gradient, color: textColor }}
      onClick={onClick}
    >
      <div className="course-name" style={{ color: textColor }}>{course.name}</div>
      {course.location && (
        <div className="course-info" style={{ color: textColor }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{course.location}</span>
        </div>
      )}
      {course.teacher && <div className="course-info" style={{ color: textColor }}>{course.teacher}</div>}
    </div>
  );
}

interface CourseCardLargeProps {
  course: Course;
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CourseCardLarge({ course, onClose, onEdit, onDelete }: CourseCardLargeProps) {
  const bg = course.color || '#6366f1';
  const text = getTextColor(bg);
  const gradient = getGradient(bg);

  return (
    <div className="course-detail" style={{ background: gradient, color: text }}>
      <div className="course-detail-head">
        <h3 className="course-detail-name">{course.name}</h3>
      </div>
      <div className="course-detail-body">
        <InfoRow icon="location" label="地点" value={course.location || '未设置'} />
        <InfoRow icon="user" label="教师" value={course.teacher || '未设置'} />
        <InfoRow icon="calendar" label="周次" value={`第 ${course.weeks.join('、')} 周`} />
        <InfoRow icon="clock" label="时间" value={`${WEEKDAYS[course.dayOfWeek - 1]} 第${course.startSection}-${course.endSection}节`} />
        {course.remark && <InfoRow icon="note" label="备注" value={course.remark} />}
      </div>
      <div className="course-detail-actions">
        {onEdit && <button onClick={onEdit} className="course-detail-btn course-detail-btn-edit">编辑</button>}
        {onDelete && <button onClick={onDelete} className="course-detail-btn course-detail-btn-delete">删除</button>}
        {onClose && <button onClick={onClose} className="course-detail-btn course-detail-btn-close">关闭</button>}
      </div>
    </div>
  );
}

const icons: Record<string, ReactNode> = {
  location: <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />,
  user: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  clock: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  note: <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />,
};

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="course-detail-row">
      <div className="course-detail-icon">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>{icons[icon]}</svg>
      </div>
      <div>
        <div className="course-detail-label">{label}</div>
        <div className="course-detail-value">{value}</div>
      </div>
    </div>
  );
}