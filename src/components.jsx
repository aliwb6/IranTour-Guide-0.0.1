import React from 'react'
import { CheckIcon, XIcon, MapPinIcon, CalendarIcon, UsersIcon } from './icons.jsx'
import { EVENT_CATEGORIES, CATEGORY_COLORS, formatJalali, toPersianNum } from './utils.js'

// ── Button ────────────────────────────────────────────────────
export const Button = ({ children, variant = 'primary', size = 'md', icon, iconLeft, disabled, onClick, className = '', type = 'button' }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg cursor-pointer select-none'
  const variants = {
    primary:   'text-white hover:opacity-90 active:opacity-80 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 shadow-sm',
    ghost:     'bg-transparent text-indigo-700 hover:bg-indigo-50 active:bg-indigo-100',
    danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
    success:   'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
    outline:   'bg-transparent text-indigo-700 border border-indigo-300 hover:bg-indigo-50',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={variant === 'primary' ? {background:'linear-gradient(135deg,#4338CA,#1E2E6E)', boxShadow:'0 4px 12px rgba(30,46,110,.3)'} : undefined}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}>
      {iconLeft && <span className="shrink-0">{iconLeft}</span>}
      {children}
      {icon && <span className="shrink-0">{icon}</span>}
    </button>
  )
}

// ── Badge ─────────────────────────────────────────────────────
export const Badge = ({ children, color = 'blue', size = 'sm' }) => {
  const colors = {
    blue:   'bg-blue-100 text-blue-800',
    green:  'bg-emerald-100 text-emerald-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red:    'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
    slate:  'bg-slate-100 text-slate-700',
    orange: 'bg-orange-100 text-orange-800',
    teal:   'bg-teal-100 text-teal-800',
  }
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'} ${colors[color] || colors.slate}`}>
      {children}
    </span>
  )
}

// ── Card ──────────────────────────────────────────────────────
export const Card = ({ children, className = '', hover = false, padding = true }) => (
  <div className={`bg-white rounded-xl border border-slate-200 ${padding ? 'p-5' : ''} ${hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : 'shadow-sm'} ${className}`}>
    {children}
  </div>
)

// ── Input ─────────────────────────────────────────────────────
export const Input = ({ label, placeholder, value, onChange, type = 'text', icon, hint, error, required, className = '' }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && (
      <label className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 mr-1">*</span>}
      </label>
    )}
    <div className="relative">
      {icon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border rounded-lg py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all
          ${icon ? 'pr-10 pl-3' : 'px-3'}
          ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
      />
    </div>
    {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
)

// ── Textarea ──────────────────────────────────────────────────
export const Textarea = ({ label, placeholder, value, onChange, rows = 4, hint, error, required, className = '' }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && (
      <label className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 mr-1">*</span>}
      </label>
    )}
    <textarea
      value={value} onChange={onChange} rows={rows} placeholder={placeholder}
      className={`w-full border rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all
        ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
    />
    {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
)

// ── Select ────────────────────────────────────────────────────
export const Select = ({ label, value, onChange, options, placeholder, required, className = '' }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && (
      <label className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 mr-1">*</span>}
      </label>
    )}
    <select value={value} onChange={onChange}
      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-300 transition-all appearance-none cursor-pointer">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
      ))}
    </select>
  </div>
)

// ── StepIndicator ─────────────────────────────────────────────
export const StepIndicator = ({ steps, current }) => (
  <div className="flex items-center gap-0">
    {steps.map((step, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center gap-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
            ${i < current ? 'bg-blue-700 text-white' : i === current ? 'bg-blue-700 text-white ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400'}`}>
            {i < current ? <CheckIcon size={14} strokeWidth={2.5} /> : toPersianNum(i + 1)}
          </div>
          <span className={`text-xs whitespace-nowrap ${i === current ? 'text-blue-700 font-medium' : 'text-slate-400'}`}>{step}</span>
        </div>
        {i < steps.length - 1 && (
          <div className={`h-0.5 flex-1 mx-2 mb-5 transition-all ${i < current ? 'bg-blue-700' : 'bg-slate-200'}`} style={{minWidth:40}}/>
        )}
      </React.Fragment>
    ))}
  </div>
)

// ── StatusBadge ───────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = {
    active:    { label: 'فعال',       color: 'green'  },
    pending:   { label: 'در انتظار', color: 'yellow' },
    completed: { label: 'پایان‌یافته', color: 'slate'  },
    cancelled: { label: 'لغو شده',   color: 'red'    },
    draft:     { label: 'پیش‌نویس',  color: 'purple' },
  }
  const s = map[status] || map.draft
  return <Badge color={s.color}>{s.label}</Badge>
}

// ── EventCard ─────────────────────────────────────────────────
export const EventCard = ({ event, onClick }) => {
  const cat = EVENT_CATEGORIES.find(c => c.id === event.category)
  const catColor = cat ? CATEGORY_COLORS[cat.color] : CATEGORY_COLORS.slate
  return (
    <div onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col">
      <div className="h-36 relative overflow-hidden"
        style={{background:'linear-gradient(135deg,#1e3a5f,#0f2647)'}}>
        <div className="absolute top-3 right-3">
          <span className="text-xs font-medium px-2 py-1 rounded-full" style={{background: catColor.bg, color: catColor.text}}>
            {cat ? cat.label : ''}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <StatusBadge status={event.status} />
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">{event.title}</h3>
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <MapPinIcon size={13} />
          <span>{event.province}</span>
          {event.venue && <><span className="text-slate-300">•</span><span className="truncate max-w-[120px]">{event.venue.split('،')[0]}</span></>}
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <CalendarIcon size={13} />
          <span>{event.dateStr || formatJalali(event.startDate)}</span>
        </div>
        {event.description && (
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{event.description}</p>
        )}
        <div className="flex items-center justify-between pt-1 mt-auto border-t border-slate-100">
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <UsersIcon size={13} />
            <span>{toPersianNum(event.attendees)} نفر</span>
          </div>
          {event.link ? (
            <a href={event.link} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-indigo-700 text-xs font-medium hover:underline">
              وب‌سایت رویداد ←
            </a>
          ) : (
            <span className="text-slate-400 text-xs">جزئیات بیشتر</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── SectionHeader ─────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
)

// ── Divider ───────────────────────────────────────────────────
export const Divider = ({ className = '' }) => <div className={`border-t border-slate-200 ${className}`} />

// ── Stat Card ─────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, trend, color = 'blue' }) => {
  const colors = {
    blue:   { bg: 'bg-indigo-50',  icon: 'text-indigo-700',  val: 'text-indigo-900' },
    green:  { bg: 'bg-emerald-50',  icon: 'text-emerald-600', val: 'text-emerald-900' },
    purple: { bg: 'bg-purple-50',   icon: 'text-purple-600', val: 'text-purple-900' },
    orange: { bg: 'bg-orange-50',   icon: 'text-orange-600', val: 'text-orange-900' },
  }
  const c = colors[color] || colors.blue
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0 ${c.icon}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
        {trend && <p className="text-xs text-emerald-600 mt-0.5">{trend}</p>}
      </div>
    </Card>
  )
}

// ── Modal ─────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, width = 'max-w-lg' }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="font-bold text-slate-900 text-lg">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><XIcon size={20} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────
export const Toast = ({ message, type = 'success', visible }) => {
  if (!visible) return null
  const map = { success: 'bg-emerald-600', error: 'bg-red-600', info: 'bg-blue-700' }
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 ${map[type]} text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg flex items-center gap-2`}>
      <CheckIcon size={16} strokeWidth={2.5} />
      {message}
    </div>
  )
}

// ── GlassEventCard (dark landing) ─────────────────────────────
export const GlassEventCard = ({ event, idx, onClick }) => {
  const cat = EVENT_CATEGORIES.find(c => c.id === event.category)
  return (
    <div onClick={onClick}
      className="glass-card rounded-2xl overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1 transition-all duration-200">
      <div className="h-36 relative overflow-hidden"
        style={{background:'linear-gradient(135deg,#0f2647,#07102E)'}}>
        <div className="absolute top-3 right-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm"
            style={{background:'rgba(0,0,0,.35)', color:'#fff', border:'1px solid rgba(255,255,255,.15)'}}>
            {cat ? cat.label : ''}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <StatusBadge status={event.status} />
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">{event.title}</h3>
        <div className="flex items-center gap-1.5 text-blue-300 text-xs">
          <MapPinIcon size={12} /><span>{event.province}</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-300 text-xs">
          <CalendarIcon size={12} /><span>{event.dateStr || formatJalali(event.startDate)}</span>
        </div>
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-white/10">
          <div className="flex items-center gap-1 text-blue-300 text-xs">
            <UsersIcon size={12} /><span>{toPersianNum(event.attendees)} نفر</span>
          </div>
          <span className="text-blue-300 text-xs font-medium hover:text-white transition-colors">مشاهده ←</span>
        </div>
      </div>
    </div>
  )
}
