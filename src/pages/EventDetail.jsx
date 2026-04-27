import React from 'react'
import {
  ChevronRightIcon, MapPinIcon, CalendarIcon, UsersIcon,
  ClockIcon, ExternalLinkIcon, SparklesIcon, TagIcon, SearchIcon,
} from '../icons.jsx'
import { StatusBadge, Badge } from '../components.jsx'
import {
  EVENT_CATEGORIES, CATEGORY_COLORS, formatJalali, toPersianNum, getEventImage,
} from '../utils.js'

const EventDetail = ({ event, onBack }) => {
  const [oppOpen, setOppOpen] = React.useState(false)
  const [chalOpen, setChalOpen] = React.useState(false)

  if (!event) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-2">
        <CalendarIcon size={36} className="text-slate-300" />
      </div>
      <p className="font-bold text-slate-700 text-lg">رویداد انتخاب نشده</p>
      <p className="text-slate-500 text-sm">لطفاً از صفحه کشف رویداد، رویداد مورد نظر را انتخاب کنید</p>
      <button onClick={onBack}
        className="mt-2 px-6 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
        style={{background:'linear-gradient(135deg,#4338CA,#1E2E6E)'}}>
        بازگشت
      </button>
    </div>
  )

  const cat = EVENT_CATEGORIES.find(c => c.id === event.category)
  const catColor = cat ? CATEGORY_COLORS[cat.color] : CATEGORY_COLORS.slate
  const heroUrl = getEventImage(event)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative h-64 md:h-80 bg-slate-900 overflow-hidden">
        <img src={heroUrl} alt={event.title}
          className="w-full h-full object-cover opacity-60"
          onError={e => { e.target.style.display='none' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

        {/* Back button */}
        <button onClick={onBack}
          className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-lg transition-all">
          <ChevronRightIcon size={18} />
          بازگشت
        </button>

        {/* Hero content */}
        <div className="absolute bottom-0 right-0 left-0 p-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {cat && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: catColor.bg, color: catColor.text }}>
                {cat.label}
              </span>
            )}
            <StatusBadge status={event.status} />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white leading-snug">{event.title}</h1>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5">

        {/* Quick info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoItem icon={<MapPinIcon size={15} />} label="استان" value={event.province} />
          <InfoItem icon={<MapPinIcon size={15} />} label="شهر" value={event.city || '—'} />
          <InfoItem icon={<CalendarIcon size={15} />} label="تاریخ" value={event.dateStr || formatJalali(event.startDate)} />
          <InfoItem icon={<UsersIcon size={15} />} label="ظرفیت" value={`${toPersianNum(event.attendees)} نفر`} />
        </div>

        {/* Venue & Duration */}
        {(event.venue || event.duration) && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
            {event.venue && (
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <MapPinIcon size={15} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">محل برگزاری</p>
                  <p>{event.venue}</p>
                </div>
              </div>
            )}
            {event.duration && (
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <ClockIcon size={15} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">مدت رویداد</p>
                  <p>{event.duration}</p>
                </div>
              </div>
            )}
            {event.style && (
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <TagIcon size={15} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">نوع رویداد</p>
                  <p>{event.style}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Opportunities */}
        {event.opportunities && (
          <Collapsible
            open={oppOpen} onToggle={() => setOppOpen(v => !v)}
            icon={<SparklesIcon size={15} className="text-emerald-600" />}
            title="فرصت‌ها و جذابیت‌ها"
            content={event.opportunities}
            accent="emerald"
          />
        )}

        {/* Challenges */}
        {event.challenges && (
          <Collapsible
            open={chalOpen} onToggle={() => setChalOpen(v => !v)}
            icon={<SparklesIcon size={15} className="text-amber-600" />}
            title="چالش‌ها و نکات"
            content={event.challenges}
            accent="amber"
          />
        )}

        {/* CTA */}
        {event.link && (
          <a href={event.link} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 active:opacity-80"
            style={{ background: 'linear-gradient(135deg,#4338CA,#1E2E6E)', boxShadow: '0 4px 12px rgba(30,46,110,.3)' }}>
            <ExternalLinkIcon size={18} />
            مشاهده وب‌سایت رویداد
          </a>
        )}
      </div>
    </div>
  )
}

const InfoItem = ({ icon, label, value }) => (
  <div className="flex flex-col gap-1">
    <p className="text-xs text-slate-400 flex items-center gap-1">{icon}{label}</p>
    <p className="text-sm font-semibold text-slate-800">{value}</p>
  </div>
)

const Collapsible = ({ open, onToggle, icon, title, content, accent }) => {
  const accents = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800' },
    amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-800'   },
  }
  const c = accents[accent] || accents.emerald
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} overflow-hidden`}>
      <button onClick={onToggle}
        className={`w-full flex items-center justify-between px-5 py-4 ${c.text} font-semibold text-sm`}>
        <span className="flex items-center gap-2">{icon}{title}</span>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-slate-700 leading-relaxed border-t border-inherit">
          {content}
        </div>
      )}
    </div>
  )
}

export default EventDetail
