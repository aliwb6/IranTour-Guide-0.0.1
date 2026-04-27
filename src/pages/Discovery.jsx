import React from 'react'
import {
  SearchIcon, ChevronRightIcon, FilterIcon,
  TagIcon, MapPinIcon, CalendarIcon, SparklesIcon,
  XIcon, BookOpenIcon, ClockIcon,
} from '../icons.jsx'
import { EventCard, SectionHeader, Input } from '../components.jsx'
import {
  SAMPLE_EVENTS, SAMPLE_ARTICLES, EVENT_CATEGORIES, CATEGORY_COLORS,
  IRAN_PROVINCES, toPersianNum, formatJalali,
} from '../utils.js'

// Simulate AI suggestion (placeholder for real API integration)
async function getAiSuggestion(interests) {
  await new Promise(r => setTimeout(r, 1400))
  const relevant = SAMPLE_EVENTS
    .slice(0, 2)
    .map(e => `• ${e.title} (${e.province}) — رویداد مرتبط با علاقه‌مندی‌های شما`)
    .join('\n')
  return `بر اساس علاقه‌مندی شما به «${interests}»، رویدادهای زیر پیشنهاد می‌شود:\n\n${relevant}\n\nبرای مشاهده جزئیات بیشتر روی هر رویداد کلیک کنید.`
}

const DiscoveryPage = ({ onNavigate, defaultSection = 'events' }) => {
  const [search, setSearch] = React.useState('')
  const [selectedCats, setSelectedCats] = React.useState([])
  const [selectedProvinces, setSelectedProvinces] = React.useState([])
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')
  const [aiInterests, setAiInterests] = React.useState('')
  const [aiLoading, setAiLoading] = React.useState(false)
  const [aiResult, setAiResult] = React.useState(null)
  const [activeSection, setActiveSection] = React.useState(defaultSection)

  const toggleCat = (id) => setSelectedCats(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id])
  const toggleProv = (p) => setSelectedProvinces(c => c.includes(p) ? c.filter(x => x !== p) : [...c, p])

  const filtered = SAMPLE_EVENTS.filter(ev => {
    const q = search.trim().toLowerCase()
    const matchSearch = !q ||
      ev.title.toLowerCase().includes(q) ||
      ev.province.toLowerCase().includes(q) ||
      (ev.city || '').toLowerCase().includes(q) ||
      (ev.venue || '').toLowerCase().includes(q)
    const matchCat    = !selectedCats.length || selectedCats.includes(ev.category)
    const matchProv   = !selectedProvinces.length || selectedProvinces.includes(ev.province)
    const matchFrom   = !dateFrom || new Date(ev.startDate) >= new Date(dateFrom)
    const matchTo     = !dateTo   || new Date(ev.startDate) <= new Date(dateTo)
    return matchSearch && matchCat && matchProv && matchFrom && matchTo
  })

  const handleAiSuggest = async () => {
    if (!aiInterests.trim()) return
    setAiLoading(true)
    setAiResult(null)
    try {
      const text = await getAiSuggestion(aiInterests)
      setAiResult(text)
    } finally {
      setAiLoading(false)
    }
  }

  // ── Filter Sidebar ──────────────────────────────────────────
  const FilterSidebar = () => (
    <aside className="w-64 shrink-0 flex flex-col gap-4">
      {/* Categories */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <p className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <TagIcon size={14} className="text-blue-600" />دسته‌بندی
        </p>
        <div className="flex flex-col gap-1.5">
          {EVENT_CATEGORIES.map(cat => {
            const sel = selectedCats.includes(cat.id)
            const c = CATEGORY_COLORS[cat.color]
            return (
              <button key={cat.id} onClick={() => toggleCat(cat.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-right w-full
                  ${sel ? 'font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                style={sel ? { background: c.bg, color: c.text } : {}}>
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all
                  ${sel ? 'border-transparent' : 'border-slate-300 bg-white'}`}
                  style={sel ? { background: c.text } : {}}>
                  {sel && (
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                {cat.label}
              </button>
            )
          })}
        </div>
        {selectedCats.length > 0 && (
          <button onClick={() => setSelectedCats([])} className="text-xs text-red-500 hover:text-red-700 mt-2 w-full text-center">پاک کردن فیلتر</button>
        )}
      </div>

      {/* Provinces */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <p className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <MapPinIcon size={14} className="text-blue-600" />استان
        </p>
        <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
          {IRAN_PROVINCES.map(prov => {
            const sel = selectedProvinces.includes(prov)
            return (
              <button key={prov} onClick={() => toggleProv(prov)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all text-right w-full
                  ${sel ? 'bg-blue-50 text-blue-800 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0
                  ${sel ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                  {sel && (
                    <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                {prov}
              </button>
            )
          })}
        </div>
        {selectedProvinces.length > 0 && (
          <button onClick={() => setSelectedProvinces([])} className="text-xs text-red-500 hover:text-red-700 mt-2 w-full text-center">پاک کردن فیلتر</button>
        )}
      </div>

      {/* Date Range */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <p className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <CalendarIcon size={14} className="text-blue-600" />بازه سفر
        </p>
        <div className="flex flex-col gap-2">
          <Input placeholder="از تاریخ" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <Input placeholder="تا تاریخ"  type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)} />
        </div>
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo('') }} className="text-xs text-red-500 hover:text-red-700 mt-2 w-full text-center">پاک کردن</button>
        )}
      </div>
    </aside>
  )

  // ── AI Suggestion Card ──────────────────────────────────────
  const AiCard = () => (
    <div className="bg-gradient-to-l from-blue-900 to-blue-700 rounded-xl p-5 text-white mb-5">
      <div className="flex items-center gap-2 mb-3">
        <SparklesIcon size={18} className="text-yellow-300" />
        <span className="font-bold text-base">پیشنهاد هوشمند رویداد</span>
        <span className="text-xs text-blue-200 bg-blue-800/50 px-2 py-0.5 rounded-full">هوش مصنوعی</span>
      </div>
      <p className="text-blue-100 text-sm mb-3 leading-relaxed">علاقه‌مندی‌های خود را وارد کنید تا رویدادهای متناسب با سلیقه شما پیشنهاد شود.</p>
      <div className="flex gap-2">
        <input value={aiInterests} onChange={e => setAiInterests(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAiSuggest()}
          placeholder="مثال: موسیقی کلاسیک، گردشگری تاریخی، تهران..."
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-blue-200 focus:outline-none focus:bg-white/20 transition-all" />
        <button onClick={handleAiSuggest} disabled={aiLoading || !aiInterests.trim()}
          className="bg-white text-blue-800 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0">
          {aiLoading
            ? <span className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{animationDelay:`${i*100}ms`}} />)}</span>
            : <SparklesIcon size={15} />}
          {aiLoading ? 'در حال پردازش...' : 'پیشنهاد بده'}
        </button>
      </div>
      {aiResult && (
        <div className="mt-4 bg-white/10 rounded-lg p-4 text-sm text-blue-50 leading-relaxed border border-white/10 whitespace-pre-line">
          {aiResult}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => onNavigate('landing')} className="text-slate-400 hover:text-slate-700 transition-colors">
            <ChevronRightIcon size={22} />
          </button>
          <div className="flex-1 relative">
            <SearchIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="جستجو در رویدادها، استان‌ها..."
              className="w-full border border-slate-200 rounded-lg pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="flex gap-1">
            {['events','magazine'].map(sec => (
              <button key={sec} onClick={() => setActiveSection(sec)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${activeSection === sec ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {sec === 'events' ? 'رویدادها' : 'مجله'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 w-full">
        {/* Sidebar — events only */}
        {activeSection === 'events' && <div className="hidden md:block"><FilterSidebar /></div>}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSection === 'events' && (
            <>
              <AiCard />

              {/* Active Filters */}
              {(selectedCats.length > 0 || selectedProvinces.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCats.map(id => {
                    const cat = EVENT_CATEGORIES.find(c => c.id === id)
                    return cat ? (
                      <span key={id} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                        {cat.label}
                        <button onClick={() => toggleCat(id)}><XIcon size={11} /></button>
                      </span>
                    ) : null
                  })}
                  {selectedProvinces.map(p => (
                    <span key={p} className="flex items-center gap-1 text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full font-medium">
                      {p}<button onClick={() => toggleProv(p)}><XIcon size={11} /></button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-900">{toPersianNum(filtered.length)}</strong> رویداد یافت شد
                </p>
              </div>

              {filtered.length > 0 ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map(ev => <EventCard key={ev.id} event={ev} onClick={() => onNavigate('event-detail', ev)} />)}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <SearchIcon size={36} className="text-slate-300 mx-auto mb-3" />
                  <p className="font-semibold text-slate-700">رویدادی یافت نشد</p>
                  <p className="text-sm text-slate-500 mt-1">فیلترهای خود را تغییر دهید</p>
                  <button onClick={() => { setSelectedCats([]); setSelectedProvinces([]); setSearch('') }}
                    className="mt-4 text-sm text-blue-700 font-medium">پاک کردن همه فیلترها</button>
                </div>
              )}
            </>
          )}

          {/* Magazine Section */}
          {activeSection === 'magazine' && (
            <div>
              <SectionHeader title="مجله رویداد ایران" subtitle="مقالات، راهنماهای سفر و اخبار رویدادها" />
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {SAMPLE_ARTICLES.map(art => {
                  const cat = EVENT_CATEGORIES.find(c => c.id === art.category)
                  const cc  = cat ? CATEGORY_COLORS[cat.color] : CATEGORY_COLORS.slate
                  return (
                    <div key={art.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden flex flex-col">
                      <div className="h-40 relative overflow-hidden bg-slate-100">
                        <img
                          src={`https://images.unsplash.com/photo-${['1524995997946-a1c2e315a42f','1497633762265-9d179a990aa6','1469474968028-56623f02e42e'][art.id % 3]}?w=600&h=300&fit=crop&auto=format&q=75`}
                          alt={art.title} className="w-full h-full object-cover"
                          onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-slate-100 items-center justify-center hidden absolute inset-0">
                          <BookOpenIcon size={36} className="text-slate-300" />
                        </div>
                        <span className="absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full" style={{background: cc.bg, color: cc.text}}>
                          {cat?.label}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col gap-2 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">{art.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{art.excerpt}</p>
                        <div className="flex items-center justify-between pt-2 mt-auto border-t border-slate-100 text-xs text-slate-400">
                          <span>{formatJalali(art.date)}</span>
                          <span className="flex items-center gap-1"><ClockIcon size={11} />{toPersianNum(art.readTime)} دقیقه مطالعه</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DiscoveryPage
