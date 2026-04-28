import React from 'react'
import {
  SearchIcon, ChevronRightIcon, FilterIcon,
  TagIcon, MapPinIcon, CalendarIcon, SparklesIcon,
  XIcon, BookOpenIcon, ClockIcon, SortIcon,
} from '../icons.jsx'
import { EventCard, SectionHeader, Input, Modal } from '../components.jsx'
import {
  SAMPLE_ARTICLES, EVENT_CATEGORIES, CATEGORY_COLORS,
  IRAN_PROVINCES, toPersianNum, formatJalali, jalaliToGregorian,
} from '../utils.js'
import { eventsAPI } from '../services/api.js'

const DiscoveryPage = ({ onNavigate, defaultSection = 'events' }) => {
  const [events, setEvents]       = React.useState([])
  const [loading, setLoading]     = React.useState(true)
  const [fetchError, setFetchError] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [selectedCats, setSelectedCats] = React.useState([])
  const [selectedProvinces, setSelectedProvinces] = React.useState([])
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')
  const [aiInterests, setAiInterests] = React.useState('')
  const [aiLoading, setAiLoading] = React.useState(false)
  const [aiResult, setAiResult] = React.useState(null)
  const [activeSection, setActiveSection] = React.useState(defaultSection)
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [sortBy, setSortBy] = React.useState('default')
  const [selectedArticle, setSelectedArticle] = React.useState(null)

  React.useEffect(() => {
    setLoading(true)
    setFetchError('')
    eventsAPI.list({ limit: 100 })
      .then(data => setEvents(Array.isArray(data) ? data : (data.events ?? [])))
      .catch(err => setFetchError(err.message || 'خطا در دریافت رویدادها'))
      .finally(() => setLoading(false))
  }, [])

  const toggleCat = (id) => setSelectedCats(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id])
  const toggleProv = (p) => setSelectedProvinces(c => c.includes(p) ? c.filter(x => x !== p) : [...c, p])

  const parseJalali = (str) => {
    if (!str) return null
    const ascii = str.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    const parts = ascii.split('/')
    if (parts.length !== 3) return null
    const [jy, jm, jd] = parts.map(Number)
    if (!jy || !jm || !jd || jm < 1 || jm > 12 || jd < 1 || jd > 31) return null
    try { return new Date(jalaliToGregorian(jy, jm, jd)) } catch { return null }
  }
  const dateFromGreg = parseJalali(dateFrom)
  const dateToGreg   = parseJalali(dateTo)

  const filtered = events.filter(ev => {
    const q = search.trim().toLowerCase()
    const matchSearch = !q ||
      ev.title.toLowerCase().includes(q) ||
      ev.province.toLowerCase().includes(q) ||
      (ev.city || '').toLowerCase().includes(q) ||
      (ev.venue || '').toLowerCase().includes(q)
    const matchCat    = !selectedCats.length || selectedCats.includes(ev.category)
    const matchProv   = !selectedProvinces.length || selectedProvinces.includes(ev.province)
    const matchFrom   = !dateFromGreg || new Date(ev.startDate) >= dateFromGreg
    const matchTo     = !dateToGreg   || new Date(ev.startDate) <= dateToGreg
    return matchSearch && matchCat && matchProv && matchFrom && matchTo
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest')    return new Date(b.startDate) - new Date(a.startDate)
    if (sortBy === 'oldest')    return new Date(a.startDate) - new Date(b.startDate)
    if (sortBy === 'attendees') return (b.attendees || 0) - (a.attendees || 0)
    if (sortBy === 'alpha')     return a.title.localeCompare(b.title, 'fa')
    return 0
  })

  const handleAiSuggest = async () => {
    if (!aiInterests.trim()) return
    setAiLoading(true)
    setAiResult(null)
    try {
      await new Promise(r => setTimeout(r, 1400))
      const relevant = events
        .slice(0, 2)
        .map(e => `• ${e.title} (${e.province}) — رویداد مرتبط با علاقه‌مندی‌های شما`)
        .join('\n')
      setAiResult(`بر اساس علاقه‌مندی شما به «${aiInterests}»، رویدادهای زیر پیشنهاد می‌شود:\n\n${relevant}\n\nبرای مشاهده جزئیات بیشتر روی هر رویداد کلیک کنید.`)
    } finally {
      setAiLoading(false)
    }
  }

  const clearAllFilters = () => {
    setSelectedCats([])
    setSelectedProvinces([])
    setDateFrom('')
    setDateTo('')
    setSearch('')
  }

  // ── Build category list: standard + any custom from loaded events ──
  const allCategories = React.useMemo(() => {
    const knownIds = new Set(EVENT_CATEGORIES.map(c => c.id))
    const custom = []
    events.forEach(ev => {
      if (ev.category && !knownIds.has(ev.category) && !custom.find(c => c.id === ev.category)) {
        custom.push({ id: ev.category, label: ev.category, color: 'slate' })
      }
    })
    return [...EVENT_CATEGORIES, ...custom]
  }, [events])

  // ── Filter Content ──────────────────────────────────────────
  const FilterContent = () => (
    <div className="flex flex-col gap-4">
      {/* Categories */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <p className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <TagIcon size={14} className="text-blue-600" />دسته‌بندی
        </p>
        <div className="flex flex-col gap-1.5">
          {allCategories.map(cat => {
            const sel = selectedCats.includes(cat.id)
            const c = CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.slate
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
          <CalendarIcon size={14} className="text-blue-600" />بازه زمانی
        </p>
        <div className="flex flex-col gap-2">
          <Input placeholder="از تاریخ — سال/ماه/روز" type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <Input placeholder="تا تاریخ — سال/ماه/روز"  type="text" value={dateTo}   onChange={e => setDateTo(e.target.value)} />
        </div>
        <p className="text-xs text-slate-400 mt-1.5 text-right">مثال: ۱۴۰۴/۰۱/۰۱</p>
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo('') }} className="text-xs text-red-500 hover:text-red-700 mt-2 w-full text-center">پاک کردن</button>
        )}
      </div>
    </div>
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

  const activeFilterCount = selectedCats.length + selectedProvinces.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => onNavigate('landing')} className="text-slate-400 hover:text-slate-700 transition-colors shrink-0">
            <ChevronRightIcon size={22} />
          </button>
          <div className="flex-1 relative">
            <SearchIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="جستجو در رویدادها، استان‌ها..."
              className="w-full border border-slate-200 rounded-lg pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          {/* Mobile filter button */}
          {activeSection === 'events' && (
            <button onClick={() => setFilterOpen(true)}
              className="md:hidden relative flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-all shrink-0">
              <FilterIcon size={15} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
          <div className="flex gap-1 shrink-0">
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

      {/* Mobile Filter Drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
          <aside className="relative z-10 w-72 bg-slate-50 h-full overflow-y-auto border-l border-slate-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <FilterIcon size={16} className="text-blue-600" />فیلترها
                {activeFilterCount > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>}
              </span>
              <button onClick={() => setFilterOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <XIcon size={20} />
              </button>
            </div>
            <div className="p-4">
              <FilterContent />
              {activeFilterCount > 0 && (
                <button onClick={() => { clearAllFilters(); setFilterOpen(false) }}
                  className="mt-3 w-full py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all">
                  پاک کردن همه فیلترها
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 w-full">
        {/* Desktop Sidebar */}
        {activeSection === 'events' && (
          <div className="hidden md:block w-64 shrink-0">
            <FilterContent />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSection === 'events' && (
            <>
              <AiCard />

              {/* Fetch error */}
              {fetchError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4 flex items-center gap-2">
                  <span className="font-semibold">خطا:</span> {fetchError}
                  <button onClick={() => { setFetchError(''); setLoading(true); eventsAPI.list({ limit: 100 }).then(d => setEvents(Array.isArray(d) ? d : (d.events ?? []))).catch(e => setFetchError(e.message)).finally(() => setLoading(false)) }}
                    className="mr-auto text-xs underline text-red-600 hover:text-red-800">تلاش مجدد</button>
                </div>
              )}

              {/* Skeleton */}
              {loading && (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
                      <div className="h-40 bg-slate-200" />
                      <div className="p-4 flex flex-col gap-3">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                        <div className="h-3 bg-slate-100 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Active Filters */}
              {!loading && (selectedCats.length > 0 || selectedProvinces.length > 0) && (
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

              {!loading && (
                <>
                  <div className="flex items-center justify-between mb-4 gap-3">
                    <p className="text-sm text-slate-600">
                      <strong className="text-slate-900">{toPersianNum(sorted.length)}</strong> رویداد یافت شد
                    </p>
                    <div className="flex items-center gap-1.5">
                      <SortIcon size={14} className="text-slate-400" />
                      <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer">
                        <option value="default">پیش‌فرض</option>
                        <option value="newest">جدیدترین</option>
                        <option value="oldest">قدیمی‌ترین</option>
                        <option value="attendees">بیشترین ظرفیت</option>
                        <option value="alpha">الفبایی</option>
                      </select>
                    </div>
                  </div>

                  {sorted.length > 0 ? (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {sorted.map(ev => <EventCard key={ev.id} event={ev} onClick={() => onNavigate('event-detail', ev)} />)}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                      <SearchIcon size={36} className="text-slate-300 mx-auto mb-3" />
                      <p className="font-semibold text-slate-700">رویدادی یافت نشد</p>
                      <p className="text-sm text-slate-500 mt-1">فیلترهای خود را تغییر دهید</p>
                      <button onClick={clearAllFilters}
                        className="mt-4 text-sm text-blue-700 font-medium">پاک کردن همه فیلترها</button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Magazine Section */}
          {activeSection === 'magazine' && (
            <div>
              <SectionHeader title="مجله رویدادیار" subtitle="مقالات، راهنماهای سفر و اخبار رویدادها" />
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {SAMPLE_ARTICLES.map(art => {
                  const cat = EVENT_CATEGORIES.find(c => c.id === art.category)
                  const cc  = cat ? CATEGORY_COLORS[cat.color] : CATEGORY_COLORS.slate
                  const imgIds = ['1524995997946-a1c2e315a42f','1497633762265-9d179a990aa6','1469474968028-56623f02e42e','1553729459-efe14ef6055d','1514320291840-2e0a9bf2a9ae','1461896836934-ffe607ba8211','1518770660439-4636190af475','1541961017774-22349e4a1262','1533174072545-7a4b6ad7a6c3']
                  return (
                    <div key={art.id}
                      onClick={() => setSelectedArticle(art)}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden flex flex-col">
                      <div className="h-40 relative overflow-hidden bg-slate-100">
                        <img
                          src={`https://images.unsplash.com/photo-${imgIds[(art.id - 1) % imgIds.length]}?w=600&h=300&fit=crop&auto=format&q=75`}
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

      {/* Article Detail Modal */}
      {selectedArticle && (
        <Modal open={!!selectedArticle} onClose={() => setSelectedArticle(null)} title={selectedArticle.title}>
          <div className="flex flex-col gap-4">
            <div className="h-40 rounded-xl overflow-hidden bg-slate-100">
              {(() => {
                const imgIds = ['1524995997946-a1c2e315a42f','1497633762265-9d179a990aa6','1469474968028-56623f02e42e','1553729459-efe14ef6055d','1514320291840-2e0a9bf2a9ae','1461896836934-ffe607ba8211','1518770660439-4636190af475','1541961017774-22349e4a1262','1533174072545-7a4b6ad7a6c3']
                return (
                  <img src={`https://images.unsplash.com/photo-${imgIds[(selectedArticle.id - 1) % imgIds.length]}?w=800&h=300&fit=crop&auto=format&q=80`}
                    alt={selectedArticle.title} className="w-full h-full object-cover"
                    onError={e => e.target.style.display='none'} />
                )
              })()}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{formatJalali(selectedArticle.date)}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><ClockIcon size={11} />{toPersianNum(selectedArticle.readTime)} دقیقه مطالعه</span>
              {(() => {
                const cat = EVENT_CATEGORIES.find(c => c.id === selectedArticle.category)
                const cc = cat ? CATEGORY_COLORS[cat.color] : CATEGORY_COLORS.slate
                return cat ? <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{background: cc.bg, color: cc.text}}>{cat.label}</span> : null
              })()}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{selectedArticle.content || selectedArticle.excerpt}</p>
            <button onClick={() => setSelectedArticle(null)}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg,#4338CA,#1E2E6E)' }}>
              بستن
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default DiscoveryPage
