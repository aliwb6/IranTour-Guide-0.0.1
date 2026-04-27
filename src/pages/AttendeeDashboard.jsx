import React from 'react'
import {
  SearchIcon, StarIcon, UsersIcon, LogOutIcon, SparklesIcon,
  CalendarIcon, ArrowLeftIcon, MenuIcon, XIcon,
} from '../icons.jsx'
import { EventCard, StatCard, SectionHeader } from '../components.jsx'
import { toPersianNum, SAMPLE_EVENTS } from '../utils.js'

const AI_RESPONSES = [
  'بر اساس علاقه‌مندی شما به «{q}»، رویداد «{e1}» در {p1} و «{e2}» در {p2} پیشنهاد می‌شود. برای مشاهده جزئیات روی هر رویداد کلیک کنید.',
  'رویدادهایی مرتبط با «{q}» پیدا شد: «{e1}» ({p1}) یکی از پرطرفدارترین رویدادها در این حوزه است. همچنین «{e2}» در {p2} می‌تواند جالب باشد.',
  '«{q}» حوزه جذابی‌ است! «{e1}» در {p1} و «{e2}» در {p2} از رویدادهایی هستند که با علاقه‌مندی‌های شما تطابق دارند.',
]

const getAiSuggestion = async (q) => {
  await new Promise(r => setTimeout(r, 1200))
  const evs = SAMPLE_EVENTS.slice(0, Math.min(SAMPLE_EVENTS.length, 10))
  const e1 = evs[Math.floor(Math.random() * 5)]
  const e2 = evs[Math.floor(Math.random() * 5) + 5] || evs[1]
  const tpl = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)]
  return tpl.replace('{q}', q).replace('{e1}', e1.title).replace('{p1}', e1.province).replace('{e2}', e2.title).replace('{p2}', e2.province)
}

const AttendeeDashboard = ({ onNavigate, user = {}, savedEvents: savedEventsProp, onToggleSave }) => {
  const [activeTab, setActiveTab] = React.useState('discover')
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [savedEvents, setSavedEvents] = React.useState(savedEventsProp?.length > 0 ? savedEventsProp : SAMPLE_EVENTS.slice(3, 6))

  React.useEffect(() => {
    if (savedEventsProp) setSavedEvents(savedEventsProp)
  }, [savedEventsProp])
  const [aiInput, setAiInput] = React.useState('')
  const [aiLoading, setAiLoading] = React.useState(false)
  const [aiResult, setAiResult] = React.useState(null)
  const [profileForm, setProfileForm] = React.useState({ phone: '۰۹۱۲۳۴۵۶۷۸۹', email: 'sara@example.ir', city: 'تهران' })
  const [profileSaved, setProfileSaved] = React.useState(false)

  const displayName = user.name || 'سارا رضایی'
  const initials = displayName.charAt(0)

  const handleAiSuggest = async () => {
    if (!aiInput.trim()) return
    setAiLoading(true); setAiResult(null)
    try { setAiResult(await getAiSuggestion(aiInput)) } finally { setAiLoading(false) }
  }

  const handleSaveProfile = () => {
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2500)
  }

  const unsaveEvent = (ev) => {
    setSavedEvents(s => s.filter(e => e.id !== ev.id))
    if (onToggleSave) onToggleSave(ev)
  }

  const tabs = [
    { id: 'discover', label: 'کشف رویداد',   icon: <SearchIcon size={16} /> },
    { id: 'saved',    label: 'ذخیره‌شده‌ها', icon: <StarIcon   size={16} /> },
    { id: 'profile',  label: 'پروفایل',       icon: <UsersIcon  size={16} /> },
  ]

  const Sidebar = ({ mobile }) => (
    <aside className={mobile
      ? 'fixed inset-0 z-50 flex'
      : 'w-60 flex-col hidden md:flex shrink-0'}
      style={mobile ? {} : { background: 'linear-gradient(180deg,#0A1840 0%,#07102E 100%)' }}>
      {mobile && <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />}
      <div className="relative z-10 w-60 flex flex-col h-full"
        style={{ background: 'linear-gradient(180deg,#0A1840 0%,#07102E 100%)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,.07)' }}>
          {mobile && (
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 left-4 text-blue-300 hover:text-white">
              <XIcon size={20} />
            </button>
          )}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#166534,#065F46)' }}>
              <UsersIcon size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white">رویداد ایران</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,.07)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: 'rgba(22,101,52,.4)', color: '#6EE7B7' }}>{initials}</div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(110,231,183,.7)' }}>شرکت‌کننده</p>
            </div>
          </div>
        </div>
        <nav className="p-3 flex flex-col gap-1 flex-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setSidebarOpen(false) }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-right
                ${activeTab === t.id ? 'sidebar-nav-active font-medium' : 'sidebar-nav-item'}`}>
              {t.icon}<span>{t.label}</span>
            </button>
          ))}
          <div className="mt-auto pt-3" style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
            <button onClick={() => onNavigate('logout')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all w-full sidebar-nav-item">
              <LogOutIcon size={17} /><span>خروج</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F1F5F9' }}>
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: '100vh' }}>
        <Sidebar />
        {sidebarOpen && <Sidebar mobile />}

        <main className="flex-1 overflow-y-auto">
          {/* Topbar */}
          <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-slate-800 transition-colors">
                <MenuIcon size={22} />
              </button>
              <h1 className="font-bold text-slate-900 text-base md:text-lg">
                {activeTab === 'discover' ? 'کشف رویدادها' : activeTab === 'saved' ? 'رویدادهای ذخیره‌شده' : 'پروفایل من'}
              </h1>
            </div>
            <button onClick={() => onNavigate('discovery')}
              className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-white rounded-lg transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#166534,#065F46)', boxShadow: '0 4px 12px rgba(22,101,52,.3)' }}>
              <SearchIcon size={14} /> <span className="hidden sm:inline">جستجوی رویداد</span><span className="sm:hidden">جستجو</span>
            </button>
          </div>

          <div className="p-4 md:p-6">

            {/* ── Discover Tab ── */}
            {activeTab === 'discover' && (
              <div className="flex flex-col gap-6">
                {/* AI Suggestion */}
                <div className="rounded-2xl p-5 text-white relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,#07102E,#0A1840)' }}>
                  <div className="absolute left-0 top-0 w-48 h-full pointer-events-none"
                    style={{ background: 'linear-gradient(to right,rgba(22,101,52,.15),transparent)' }} />
                  <div className="flex items-center gap-2 mb-2 relative z-10">
                    <SparklesIcon size={17} className="text-yellow-300" />
                    <span className="font-bold text-sm">پیشنهاد ویژه برای شما</span>
                  </div>
                  <p className="text-blue-200 text-xs mb-3 relative z-10">علاقه‌مندی‌های خود را وارد کنید</p>
                  <div className="flex gap-2 relative z-10">
                    <input value={aiInput} onChange={e => setAiInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAiSuggest()}
                      placeholder="مثلاً: موسیقی، گردشگری، فناوری..."
                      className="flex-1 rounded-lg px-3 py-2 text-sm text-white placeholder-blue-300/50 focus:outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)' }} />
                    <button onClick={handleAiSuggest} disabled={aiLoading || !aiInput.trim()}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-1.5 shrink-0 transition-all disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#166534,#065F46)' }}>
                      {aiLoading
                        ? <span className="flex gap-1">{[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 120}ms` }} />)}</span>
                        : <SparklesIcon size={14} />}
                      {aiLoading ? 'در حال پردازش...' : 'پیشنهاد'}
                    </button>
                  </div>
                  {aiResult && (
                    <div className="mt-4 relative z-10 bg-white/10 rounded-lg p-3 text-xs text-blue-50 leading-relaxed border border-white/10">
                      {aiResult}
                    </div>
                  )}
                </div>

                <SectionHeader title="رویدادهای پیشنهادی"
                  subtitle="بر اساس محبوب‌ترین رویدادهای جاری"
                  action={
                    <button onClick={() => onNavigate('discovery')} className="text-sm font-medium text-indigo-700 flex items-center gap-1">
                      مشاهده همه <ArrowLeftIcon size={14} />
                    </button>
                  } />
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {SAMPLE_EVENTS.slice(0, 6).map(ev => (
                    <EventCard key={ev.id} event={ev} onClick={() => onNavigate('event-detail', ev)} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Saved Tab ── */}
            {activeTab === 'saved' && (
              <div>
                {savedEvents.length > 0 ? (
                  <>
                    <p className="text-sm text-slate-500 mb-4">{toPersianNum(savedEvents.length)} رویداد ذخیره‌شده</p>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {savedEvents.map(ev => (
                        <div key={ev.id} className="relative group">
                          <EventCard event={ev} onClick={() => onNavigate('event-detail', ev)} />
                          <button onClick={() => unsaveEvent(ev)}
                            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-red-50 text-red-500 rounded-full p-1.5 shadow-sm">
                            <XIcon size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <StarIcon size={36} className="text-slate-300 mx-auto mb-3" />
                    <p className="font-semibold text-slate-700">هنوز رویدادی ذخیره نکرده‌اید</p>
                    <p className="text-sm text-slate-400 mt-1">رویدادهای مورد علاقه‌تان را ذخیره کنید</p>
                    <button onClick={() => setActiveTab('discover')}
                      className="mt-4 text-sm text-indigo-700 font-medium hover:underline">کشف رویدادها</button>
                  </div>
                )}
              </div>
            )}

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <div className="max-w-lg flex flex-col gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                      style={{ background: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)', color: '#166534' }}>{initials}</div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{displayName}</p>
                      <p className="text-sm text-slate-500">شرکت‌کننده</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: 'شماره موبایل', field: 'phone', placeholder: '۰۹۱۲۳۴۵۶۷۸۹' },
                      { label: 'ایمیل',        field: 'email', placeholder: 'example@ir'  },
                      { label: 'شهر',          field: 'city',  placeholder: 'تهران'        },
                    ].map(f => (
                      <div key={f.field} className="flex items-center gap-3 py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500 w-28 shrink-0">{f.label}</span>
                        <input value={profileForm[f.field]}
                          onChange={e => setProfileForm(p => ({ ...p, [f.field]: e.target.value }))}
                          placeholder={f.placeholder}
                          className="flex-1 text-sm text-slate-900 bg-transparent focus:outline-none focus:border-b focus:border-indigo-400 transition-all" />
                      </div>
                    ))}
                  </div>
                  <button onClick={handleSaveProfile}
                    className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#166534,#065F46)' }}>
                    {profileSaved ? '✓ ذخیره شد' : 'ذخیره تغییرات'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="رویداد شرکت‌شده" value={toPersianNum(8)} icon={<CalendarIcon size={20} />} color="blue" />
                  <StatCard label="رویداد ذخیره‌شده" value={toPersianNum(savedEvents.length)} icon={<StarIcon size={20} />} color="purple" />
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

export default AttendeeDashboard
