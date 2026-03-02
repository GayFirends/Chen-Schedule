import { useState, useRef } from 'react';
import { Button, Card, Modal } from '../components/common';
import { useScheduleStore, useCourseStore } from '../data/stores';
import { importFromHTML, fetchScheduleFromURL } from '../data/services/import';
import type { EducationalSystemType, ImportResult, Course } from '../data/models';
import { COURSE_COLORS } from '../core/constants';

type ImportMethod = 'paste' | 'file' | 'url';

export function ImportPage() {
  const { schedules, currentScheduleId } = useScheduleStore();
  const { addCourse } = useCourseStore();

  const [method, setMethod] = useState<ImportMethod>('paste');
  const [systemType, setSystemType] = useState<EducationalSystemType>('generic');
  const [htmlContent, setHtmlContent] = useState('');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    if (!currentScheduleId) {
      alert('请先创建课表');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let html = '';

      if (method === 'url') {
        html = await fetchScheduleFromURL(url);
      } else {
        html = htmlContent;
      }

      const importResult = importFromHTML(html, currentScheduleId, systemType);
      setResult(importResult);
      setShowPreview(true);
    } catch (error) {
      alert(`导入失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setHtmlContent(content);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!result || !currentScheduleId) return;

    let colorIndex = 0;
    for (const courseData of result.courses) {
      addCourse({
        ...courseData,
        color: COURSE_COLORS[colorIndex % COURSE_COLORS.length],
      });
      colorIndex++;
    }

    setShowPreview(false);
    setResult(null);
    setHtmlContent('');
    setUrl('');
    alert(`成功导入 ${result.courses.length} 门课程`);
  };

  return (
    <div className="settings-page">
      <header className="page-header">
        <h1 className="page-title">导入课表</h1>
      </header>

      <main className="page-main">
        {/* 选择课表 */}
        <section className="page-section">
          <h2 className="section-title">目标课表</h2>
          <Card>
            <div style={{ padding: '16px' }}>
              {currentScheduleId ? (
                <div style={{ color: 'var(--on-surface)' }}>
                  当前课表: {schedules.find(s => s.id === currentScheduleId)?.name || '未选择'}
                </div>
              ) : (
                <div style={{ color: 'var(--error)' }}>请先在首页创建课表</div>
              )}
            </div>
          </Card>
        </section>

        {/* 教务系统类型 */}
        <section className="page-section">
          <h2 className="section-title">教务系统</h2>
          <Card>
            <div style={{ display: 'flex', gap: '8px', padding: '16px' }}>
              {[
                { value: 'generic', label: '自动识别' },
                { value: 'zhengfang', label: '正方系统' },
                { value: 'qingguo', label: '青果系统' },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSystemType(t.value as EducationalSystemType)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: systemType === t.value ? 'var(--primary)' : 'var(--surface-container-highest)',
                    color: systemType === t.value ? 'var(--on-primary)' : 'var(--on-surface)',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Card>
        </section>

        {/* 导入方式 */}
        <section className="page-section">
          <h2 className="section-title">导入方式</h2>
          <Card>
            <div style={{ display: 'flex', gap: '8px', padding: '16px' }}>
              {[
                { value: 'paste', label: '粘贴 HTML' },
                { value: 'file', label: '上传文件' },
                { value: 'url', label: 'URL 导入' },
              ].map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMethod(m.value as ImportMethod)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: method === m.value ? 'var(--primary)' : 'var(--surface-container-highest)',
                    color: method === m.value ? 'var(--on-primary)' : 'var(--on-surface)',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </Card>
        </section>

        {/* 输入区域 */}
        <section className="page-section">
          <h2 className="section-title">课表数据</h2>
          <Card>
            <div style={{ padding: '16px' }}>
              {method === 'paste' && (
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="粘贴从教务系统复制的课表页面 HTML 代码..."
                  style={{
                    width: '100%',
                    height: '200px',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--outline)',
                    background: 'var(--surface)',
                    color: 'var(--on-surface)',
                    fontSize: '13px',
                    resize: 'vertical',
                  }}
                />
              )}

              {method === 'file' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ width: '100%' }}
                  >
                    选择 HTML 文件
                  </Button>
                  {htmlContent && (
                    <div style={{ marginTop: '12px', color: 'var(--on-surface-variant)', fontSize: '13px' }}>
                      已加载文件内容
                    </div>
                  )}
                </div>
              )}

              {method === 'url' && (
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="输入教务系统课表页面地址..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--outline)',
                    background: 'var(--surface)',
                    color: 'var(--on-surface)',
                    fontSize: '14px',
                  }}
                />
              )}
            </div>
          </Card>
        </section>

        {/* 导入按钮 */}
        <section className="page-section">
          <Button
            size="lg"
            onClick={handleImport}
            disabled={loading || !currentScheduleId || (method !== 'url' && !htmlContent) || (method === 'url' && !url)}
            style={{ width: '100%' }}
          >
            {loading ? '解析中...' : '解析课表'}
          </Button>
        </section>

        {/* 使用说明 */}
        <section className="page-section">
          <Card>
            <div style={{ padding: '16px', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
              <div style={{ fontWeight: 500, marginBottom: '8px', color: 'var(--on-surface)' }}>使用说明</div>
              <ol style={{ paddingLeft: '20px', lineHeight: 1.8 }}>
                <li>登录学校教务系统，打开课表页面</li>
                <li>右键点击页面，选择"查看网页源代码"</li>
                <li>复制全部内容，粘贴到上方输入框</li>
                <li>选择对应的教务系统类型</li>
                <li>点击"解析课表"并确认导入</li>
              </ol>
            </div>
          </Card>
        </section>
      </main>

      {/* 预览弹窗 */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="导入预览">
        <div className="space-y-4">
          {result && (
            <>
              <div style={{ color: result.success ? 'var(--primary)' : 'var(--error)', fontWeight: 500 }}>
                {result.success
                  ? `解析成功，共 ${result.courses.length} 门课程`
                  : '解析失败'}
              </div>

              {result.errors && result.errors.length > 0 && (
                <div style={{ color: 'var(--error)', fontSize: '13px' }}>
                  {result.errors.map((e, i) => (
                    <div key={i}>{e}</div>
                  ))}
                </div>
              )}

              {result.courses.length > 0 && (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {result.courses.map((course, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid var(--outline-variant)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          width: '4px',
                          height: '40px',
                          borderRadius: '2px',
                          background: COURSE_COLORS[i % COURSE_COLORS.length],
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{course.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                          {course.teacher} · {course.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="secondary" style={{ flex: 1 }} onClick={() => setShowPreview(false)}>
                  取消
                </Button>
                <Button style={{ flex: 1 }} onClick={handleConfirmImport} disabled={!result.success}>
                  确认导入
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}