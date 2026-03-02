import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react';

// Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

export function Button({ variant = 'primary', size = 'sm', className = '', children, loading, disabled, ...props }: ButtonProps) {
  const v = { primary: 'btn-primary', secondary: 'btn-secondary', ghost: 'btn-ghost', danger: 'btn-danger' };
  const s = { sm: 'btn-sm', md: '', lg: 'btn-lg' };
  return (
    <button className={`btn ${v[variant]} ${s[size]} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
      {children}
    </button>
  );
}

// Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; }
export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-1.5">{label}</label>}
      <input className={`input ${error ? '!border-red-400' : ''} ${className}`} {...props} />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

// Select
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; options: { value: string | number; label: string }[]; }
export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-1.5">{label}</label>}
      <div className="select-wrap">
        <select className={`select ${className}`} {...props}>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
        <svg className="select-arrow w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  );
}

// Modal
interface ModalProps { isOpen: boolean; onClose: () => void; title?: string; children: ReactNode; size?: 'sm' | 'md' | 'lg'; }
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      <div className="modal-bg" onClick={onClose} />
      <div className="modal-box">
        {title && (
          <div className="modal-head">
            <h2 className="modal-title">{title}</h2>
            <button onClick={onClose} className="modal-close">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// Card
interface CardProps { children: ReactNode; className?: string; onClick?: () => void; }
export function Card({ children, className = '', onClick }: CardProps) {
  return <div className={`card ${onClick ? 'cursor-pointer' : ''} ${className}`} onClick={onClick}>{children}</div>;
}

// Badge
interface BadgeProps { children: ReactNode; variant?: 'default' | 'primary' | 'success' | 'error'; className?: string; }
export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const s = { default: 'bg-[var(--bg-muted)] text-[var(--text-soft)]', primary: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', success: 'bg-green-100 text-green-600', error: 'bg-red-100 text-red-600' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s[variant]} ${className}`}>{children}</span>;
}

// EmptyState
interface EmptyStateProps { icon?: ReactNode; title: string; description?: string; action?: ReactNode; }
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="w-16 h-16 rounded-2xl bg-[var(--bg-muted)] flex items-center justify-center mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && <p className="text-[var(--text-soft)] mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}