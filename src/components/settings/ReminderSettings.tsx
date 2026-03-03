import { useState, useEffect } from 'react';
import { useReminderStore } from '../../data/stores/reminder';
import { isNotificationSupported, getNotificationPermission } from '../../data/services/notification';
import { Button } from '../common';

interface ReminderSettingsProps {
  onEnable?: () => Promise<boolean>;
}

export function ReminderSettings({ onEnable }: ReminderSettingsProps) {
  const {
    enabled,
    advanceMinutes,
    enableSound,
    enableVibration,
    setEnabled,
    setAdvanceMinutes,
    setEnableSound,
    setEnableVibration,
  } = useReminderStore();

  const [isEnabling, setIsEnabling] = useState(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'default'>('default');
  const isSupported = isNotificationSupported();

  useEffect(() => {
    const checkPermission = async () => {
      const perm = await getNotificationPermission();
      setPermission(perm);
    };
    checkPermission();
  }, []);

  const handleToggle = async () => {
    if (!enabled) {
      setIsEnabling(true);
      try {
        if (onEnable) {
          const success = await onEnable();
          if (success) {
            setEnabled(true);
            const perm = await getNotificationPermission();
            setPermission(perm);
          }
        } else {
          setEnabled(true);
        }
      } finally {
        setIsEnabling(false);
      }
    } else {
      setEnabled(false);
    }
  };

  if (!isSupported) {
    return (
      <div style={{ padding: '16px', color: 'var(--on-surface-variant)' }}>
        您的设备不支持通知功能
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      {/* 开关 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontWeight: 500, color: 'var(--on-surface)' }}>课程提醒</div>
          <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
            {permission === 'granted' ? '已授权通知' : permission === 'denied' ? '通知权限被拒绝' : '需要授权通知'}
          </div>
        </div>
        <Button
          variant={enabled ? 'primary' : 'secondary'}
          size="sm"
          onClick={handleToggle}
          disabled={isEnabling || permission === 'denied'}
        >
          {isEnabling ? '请求权限...' : enabled ? '已开启' : '开启'}
        </Button>
      </div>

      {/* 详细设置 */}
      {enabled && permission === 'granted' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 提前时间 */}
          <div>
            <label style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginBottom: '8px', display: 'block' }}>
              提前提醒时间
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[5, 10, 15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setAdvanceMinutes(mins)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: advanceMinutes === mins ? 'var(--primary)' : 'var(--surface-container-highest)',
                    color: advanceMinutes === mins ? 'var(--on-primary)' : 'var(--on-surface)',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  {mins < 60 ? `${mins}分钟` : '1小时'}
                </button>
              ))}
            </div>
          </div>

          {/* 声音和振动 */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enableSound}
                onChange={(e) => setEnableSound(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ color: 'var(--on-surface)' }}>提示音</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enableVibration}
                onChange={(e) => setEnableVibration(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ color: 'var(--on-surface)' }}>振动</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}