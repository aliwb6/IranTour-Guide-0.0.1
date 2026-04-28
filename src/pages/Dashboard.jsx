import React from 'react'
import {
  CalendarIcon, MapPinIcon, HomeIcon, PlusIcon, LogOutIcon,
  EyeIcon, EditIcon, TrashIcon, ArrowLeftIcon, CheckIcon,
  ChevronRightIcon, ChevronLeftIcon, UploadIcon, PhoneIcon,
  MailIcon, GlobeIcon, MenuIcon, XIcon,
} from '../icons.jsx'
import {
  Button, Card, Input, Textarea, Select, StepIndicator,
  StatusBadge, EventCard, SectionHeader, Divider, StatCard,
  Modal, Toast, Badge,
} from '../components.jsx'
import {
  toPersianNum, formatJalali,
  IRAN_PROVINCES, EVENT_CATEGORIES, CATEGORY_COLORS,
} from '../utils.js'
import { UsersIcon, ClockIcon, StarIcon } from '../icons.jsx'
import { eventsAPI, uploadAPI } from '../services/api.js'

const AUDIENCES = [
  {id:'mixed',    label:'همگانی'},
  {id:'men',      label:'آقایان'},
  {id:'women',    label:'بانوان'},
  {id:'children', label:'کودکان'},
  {id:'youth',    label:'نوجوانان'},
  {id:'family',   label:'خانوادگی'},
  {id:'students', label:'دانشجویان'},
]

// ── Multi-Step Event Form ─────────────────────────────────────
const dateToInput = (d) => {
  if (!d) return ''
  try { return (d instanceof Date ? d : new Date(d)).toISOString().split('T')[0] } catch { return '' }
}

const EventForm = ({ onBack, onSuccess, initialEvent = null, onError }) => {
  const [step, setStep] = React.useState(0)
  const [selectedCats, setSelectedCats] = React.useState(initialEvent ? [initialEvent.category].filter(Boolean) : [])
  const [selectedAudiences, setSelectedAudiences] = React.useState([])
  const [customCats, setCustomCats] = React.useState([])
  const [showAddCat, setShowAddCat] = React.useState(false)
  const [newCatInput, setNewCatInput] = React.useState('')
  const [imagePreview, setImagePreview] = React.useState(null)
  const [submitting, setSubmitting] = React.useState(false)
  const fileInputRef = React.useRef(null)
  const imageFileRef = React.useRef(null)
  const [form, setForm] = React.useState({
    title:     initialEvent?.title     || '',
    province:  initialEvent?.province  || '',
    venue:     initialEvent?.venue     || '',
    startDate: dateToInput(initialEvent?.startDate),
    endDate:   dateToInput(initialEvent?.endDate),
    phone:     initialEvent?.phone     || '',
    email:     initialEvent?.email     || '',
    website:   initialEvent?.link      || '',
    description: initialEvent?.description || '',
  })
  const steps = ['اطلاعات کلی', 'مکان', 'زمان‌بندی و تماس']

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const toggleCat = (id) => setSelectedCats(c => c.includes(id) ? c.filter(x=>x!==id) : [...c, id])
  const toggleAud = (id) => setSelectedAudiences(a => a.includes(id) ? a.filter(x=>x!==id) : [...a, id])
  const addCustomCat = () => {
    if (!newCatInput.trim()) return
    const id = 'custom_' + Date.now()
    setCustomCats(c => [...c, {id, label: newCatInput.trim()}])
    setSelectedCats(c => [...c, id])
    setNewCatInput('')
    setShowAddCat(false)
  }

  const allCats = [...EVENT_CATEGORIES, ...customCats]
  const canNext = [
    form.title && selectedCats.length > 0,
    form.province && form.venue,
    form.startDate && form.phone,
  ][step]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-700 transition-colors">
            <ChevronRightIcon size={22} />
          </button>
          <div>
            <h1 className="font-bold text-slate-900">{initialEvent ? 'ویرایش رویداد' : 'ثبت رویداد جدید'}</h1>
            <p className="text-xs text-slate-500">مرحله {toPersianNum(step + 1)} از {toPersianNum(steps.length)}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 py-8 flex-1">
        {/* Step Indicator */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
          <StepIndicator steps={steps} current={step} />
        </div>

        {/* Step 0 — General Info */}
        {step === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
            <div>
              <h2 className="font-bold text-slate-900 mb-0.5">اطلاعات کلی رویداد</h2>
              <p className="text-sm text-slate-500">عنوان، نوع رویداد و مخاطبان را مشخص کنید</p>
            </div>

            <Input label="عنوان رویداد" required value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="مثال: جشنواره بین‌المللی موسیقی فجر"
              hint="عنوانی واضح و توصیفی انتخاب کنید" />

            {/* Category multi-select */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">نوع رویداد <span className="text-red-700">*</span></label>
              <div className="flex flex-wrap gap-2">
                {allCats.map(cat => {
                  const c = CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.slate
                  const sel = selectedCats.includes(cat.id)
                  return (
                    <button key={cat.id} onClick={() => toggleCat(cat.id)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1"
                      style={sel ? { background: c.bg, color: c.text, borderColor: c.border } : { background: '#F8FAFC', color: '#64748B', borderColor: '#E2E8F0' }}>
                      {sel && <CheckIcon size={11} strokeWidth={2.5} />}
                      {cat.label}
                    </button>
                  )
                })}
                {!showAddCat && (
                  <button onClick={() => setShowAddCat(true)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 transition-all flex items-center gap-1">
                    <PlusIcon size={11} /> افزودن نوع جدید
                  </button>
                )}
              </div>
              {showAddCat && (
                <div className="flex gap-2 mt-1">
                  <input value={newCatInput} onChange={e => setNewCatInput(e.target.value)}
                    placeholder="نام نوع رویداد جدید..."
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    onKeyDown={e => e.key === 'Enter' && addCustomCat()} />
                  <Button size="sm" onClick={addCustomCat}>افزودن</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowAddCat(false); setNewCatInput('') }}>انصراف</Button>
                </div>
              )}
              {selectedCats.length === 0 && <p className="text-xs text-slate-400">می‌توانید چند نوع همزمان انتخاب کنید (مثلاً فرهنگی + آموزشی)</p>}
            </div>

            {/* Audience multi-select */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">مخاطبان رویداد <span className="text-red-700">*</span></label>
              <div className="flex flex-wrap gap-2">
                {AUDIENCES.map(aud => {
                  const sel = selectedAudiences.includes(aud.id)
                  return (
                    <button key={aud.id} onClick={() => toggleAud(aud.id)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1"
                      style={sel ? { background: '#D1FAE5', color: '#166534', borderColor: '#6EE7B7' } : { background: '#F8FAFC', color: '#64748B', borderColor: '#E2E8F0' }}>
                      {sel && <CheckIcon size={11} strokeWidth={2.5} />}
                      {aud.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-slate-400">می‌توانید چند گروه مخاطب همزمان انتخاب کنید</p>
            </div>

            {/* Image Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">تصویر کاور رویداد</label>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  imageFileRef.current = file
                  const reader = new FileReader()
                  reader.onload = ev => setImagePreview(ev.target.result)
                  reader.readAsDataURL(file)
                }} />
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 h-40">
                  <img src={imagePreview} alt="پیش‌نمایش" className="w-full h-full object-cover" />
                  <button onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all">
                    <XIcon size={14} />
                  </button>
                  <span className="absolute bottom-2 right-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">تصویر کاور</span>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center gap-3 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer group w-full text-center">
                  <div className="w-12 h-12 bg-slate-100 group-hover:bg-indigo-100 rounded-xl flex items-center justify-center transition-all">
                    <UploadIcon size={22} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">برای آپلود کلیک کنید</p>
                    <p className="text-xs text-slate-400 mt-0.5">PNG، JPG تا ۵ مگابایت</p>
                  </div>
                </button>
              )}
              <p className="text-xs text-slate-400">این تصویر به عنوان کاور رویداد نمایش داده می‌شود</p>
            </div>
          </div>
        )}

        {/* Step 1 — Location */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
            <div>
              <h2 className="font-bold text-slate-900 mb-0.5">مکان برگزاری</h2>
              <p className="text-sm text-slate-500">استان و آدرس دقیق محل برگزاری را مشخص کنید</p>
            </div>

            <Select label="استان" required value={form.province}
              onChange={e => set('province', e.target.value)}
              placeholder="انتخاب استان..."
              options={IRAN_PROVINCES.map(p => ({ value: p, label: p }))} />

            <Textarea label="آدرس دقیق / محل برگزاری" required rows={3}
              value={form.venue} onChange={e => set('venue', e.target.value)}
              placeholder="مثال: تهران، خیابان ولیعصر، تالار وحدت — سالن اصلی"
              hint="آدرس کامل شامل نام سالن یا مجموعه را وارد کنید" />

            <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4 flex items-start gap-3">
              <MapPinIcon size={16} className="text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-indigo-900">راهنما</p>
                <p className="text-xs text-indigo-700 mt-0.5 leading-relaxed">آدرس وارد‌شده به صورت عمومی نمایش داده می‌شود. آدرس دقیق و کامل وارد کنید تا شرکت‌کنندگان بتوانند محل را پیدا کنند.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Timing & Contact */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
            <div>
              <h2 className="font-bold text-slate-900 mb-0.5">زمان‌بندی و اطلاعات تماس</h2>
              <p className="text-sm text-slate-500">تاریخ‌های شروع و پایان، اطلاعات تماس و توضیحات را وارد کنید</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="تاریخ شروع" required type="date" value={form.startDate}
                onChange={e => set('startDate', e.target.value)} />
              <Input label="تاریخ پایان" required type="date" value={form.endDate}
                onChange={e => set('endDate', e.target.value)} />
            </div>

            {(form.startDate || form.endDate) && (
              <div className="bg-indigo-50 rounded-lg border border-indigo-100 px-4 py-3 flex items-center gap-2 text-sm text-indigo-700">
                <CalendarIcon size={15} className="text-indigo-500 shrink-0" />
                {form.startDate && <span>از <strong>{formatJalali(new Date(form.startDate))}</strong></span>}
                {form.startDate && form.endDate && <span className="text-indigo-300 mx-1">تا</span>}
                {form.endDate && <span><strong>{formatJalali(new Date(form.endDate))}</strong></span>}
              </div>
            )}

            <Divider />

            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-slate-700">اطلاعات تماس <span className="text-xs font-normal text-slate-400">(نمایش عمومی)</span></p>
            </div>

            <Input label="شماره تماس" required value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="۰۲۱-۱۲۳۴۵۶۷۸"
              hint="اطلاعات تماس به صورت عمومی نمایش داده می‌شود"
              icon={<PhoneIcon size={15} />} />

            <Input label="ایمیل" type="email" value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="info@example.ir"
              icon={<MailIcon size={15} />} />

            <Input label="وب‌سایت" value={form.website}
              onChange={e => set('website', e.target.value)}
              placeholder="https://example.ir"
              icon={<GlobeIcon size={15} />} />

            <Textarea label="توضیحات رویداد" rows={4} value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="درباره رویداد، برنامه‌ها و اهداف آن توضیح دهید..."
              hint="این متن در صفحه عمومی رویداد نمایش داده می‌شود" />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-5 gap-3">
          <Button variant="secondary" onClick={() => step > 0 ? setStep(s => s - 1) : onBack()}
            iconLeft={<ChevronRightIcon size={16} />}>
            {step > 0 ? 'مرحله قبل' : 'انصراف'}
          </Button>
          {step < steps.length - 1 ? (
            <Button disabled={!canNext} onClick={() => setStep(s => s + 1)}
              icon={<ChevronLeftIcon size={16} />}>
              مرحله بعد
            </Button>
          ) : (
            <Button disabled={!canNext || submitting}
              onClick={async () => {
                setSubmitting(true)
                try {
                  let imageUrl = initialEvent?.imageUrl || undefined
                  if (imageFileRef.current) {
                    const up = await uploadAPI.image(imageFileRef.current)
                    imageUrl = up.url || up.secure_url || imageUrl
                  }
                  const payload = {
                    title:       form.title,
                    province:    form.province,
                    city:        form.province,
                    venue:       form.venue,
                    startDate:   form.startDate || undefined,
                    endDate:     form.endDate   || undefined,
                    phone:       form.phone     || undefined,
                    email:       form.email     || undefined,
                    website:     form.website   || undefined,
                    description: form.description || undefined,
                    category:    (() => {
                      const id = selectedCats[0] || 'cultural'
                      if (id.startsWith('custom_')) {
                        const custom = customCats.find(c => c.id === id)
                        return custom ? custom.label : 'cultural'
                      }
                      return id
                    })(),
                    imageUrl,
                  }
                  let saved
                  if (initialEvent) {
                    saved = await eventsAPI.update(initialEvent.id, payload)
                  } else {
                    saved = await eventsAPI.create(payload)
                  }
                  onSuccess(saved.event || saved)
                } catch (err) {
                  onError?.(err.message || 'خطا در ذخیره رویداد')
                } finally {
                  setSubmitting(false)
                }
              }}
              icon={submitting ? null : <CheckIcon size={16} strokeWidth={2.5} />} variant="success">
              {submitting ? 'در حال ذخیره...' : initialEvent ? 'ذخیره تغییرات' : 'ثبت نهایی رویداد'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Organizer Dashboard ───────────────────────────────────────
const DashboardPage = ({ onNavigate, user = {} }) => {
  const [activeTab, setActiveTab] = React.useState('overview')
  const [toast, setToast] = React.useState({ visible: false, message: '' })
  const [deleteModal, setDeleteModal] = React.useState(null)
  const [events, setEvents] = React.useState([])
  const [loadingEvents, setLoadingEvents] = React.useState(true)
  const [formError, setFormError] = React.useState('')
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [editingEvent, setEditingEvent] = React.useState(null)

  const displayName = user.name || 'برگزارکننده'
  const initials = displayName.charAt(0)

  // Load organizer's events on mount
  React.useEffect(() => {
    setLoadingEvents(true)
    eventsAPI.myEvents()
      .then(data => setEvents(Array.isArray(data) ? data : (data.events ?? [])))
      .catch(() => {})
      .finally(() => setLoadingEvents(false))
  }, [])

  const showToast = (message = 'رویداد با موفقیت ثبت شد!') => {
    setToast({ visible: true, message })
    setTimeout(() => setToast({ visible: false, message: '' }), 3000)
  }

  const deleteEvent = async (id) => {
    try {
      await eventsAPI.delete(id)
      setEvents(ev => ev.filter(e => e.id !== id))
      setDeleteModal(null)
      showToast('رویداد با موفقیت حذف شد')
    } catch (err) {
      showToast(err.message || 'خطا در حذف رویداد')
      setDeleteModal(null)
    }
  }

  const activeCount = events.filter(e => e.status === 'active').length
  const pendingCount = events.filter(e => e.status === 'pending').length
  const totalAttendees = events.reduce((s, e) => s + (e.attendees || 0), 0)

  const stats = [
    { label: 'رویدادهای فعال',     value: toPersianNum(activeCount),   icon: <CalendarIcon size={22} />, trend: `از ${toPersianNum(events.length)} رویداد کل`, color: 'blue'   },
    { label: 'کل شرکت‌کنندگان',   value: toPersianNum(totalAttendees), icon: <UsersIcon    size={22} />, trend: 'مجموع ظرفیت‌ها', color: 'green'  },
    { label: 'در انتظار برگزاری', value: toPersianNum(pendingCount),   icon: <ClockIcon    size={22} />, color: 'orange' },
    { label: 'کل رویدادها',        value: toPersianNum(events.length),  icon: <StarIcon     size={22} />, trend: 'از ۳۱ استان', color: 'purple' },
  ]

  const navItems = [
    { id: 'overview', icon: <HomeIcon size={17} />,    label: 'خلاصه'            },
    { id: 'events',   icon: <CalendarIcon size={17} />, label: 'رویدادهای من'     },
    { id: 'form',     icon: <PlusIcon size={17} />,     label: 'ثبت رویداد جدید' },
  ]

  const SidebarContent = ({ mobile }) => (
    <>
      <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,.07)' }}>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="absolute top-4 left-4 text-blue-300 hover:text-white">
            <XIcon size={20} />
          </button>
        )}
        <button onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity cursor-pointer text-right w-full">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4338CA,#1E2E6E)' }}>
            <CalendarIcon size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-white">رویدادیار</span>
        </button>
        <div className="flex items-center gap-3 rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,.07)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: 'rgba(67,56,202,.4)', color: '#A5B4FC' }}>{initials}</div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            <p className="text-xs truncate" style={{ color: 'rgba(165,180,252,.7)' }}>سازمان‌دهنده</p>
          </div>
        </div>
      </div>
      <nav className="p-3 flex flex-col gap-1 flex-1">
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-right
              ${activeTab === item.id ? 'sidebar-nav-active font-medium' : 'sidebar-nav-item'}`}>
            {item.icon}<span>{item.label}</span>
          </button>
        ))}
        <div className="mt-auto pt-3 flex flex-col gap-1" style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
          <button onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all w-full sidebar-nav-item">
            <HomeIcon size={17} /><span>صفحه اصلی</span>
          </button>
          <button onClick={() => onNavigate('logout')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all w-full sidebar-nav-item">
            <LogOutIcon size={17} /><span>خروج</span>
          </button>
        </div>
      </nav>
    </>
  )

  if (activeTab === 'form') {
    return (
      <>
        {formError && (
          <div className="fixed top-4 right-4 left-4 z-50 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 shadow-lg">
            {formError}
            <button onClick={() => setFormError('')} className="mr-3 text-red-400 hover:text-red-700">✕</button>
          </div>
        )}
        <EventForm
          initialEvent={editingEvent}
          onBack={() => { setEditingEvent(null); setActiveTab('overview'); setFormError('') }}
          onError={setFormError}
          onSuccess={(savedEvent) => {
            if (editingEvent) {
              setEvents(ev => ev.map(e => e.id === editingEvent.id ? savedEvent : e))
              showToast('رویداد با موفقیت ویرایش شد!')
            } else {
              setEvents(ev => [savedEvent, ...ev])
              showToast('رویداد با موفقیت ثبت شد!')
            }
            setEditingEvent(null)
            setActiveTab('overview')
            setFormError('')
          }}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Toast message={toast.message} type="success" visible={toast.visible} />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 w-60 flex flex-col"
            style={{ background: 'linear-gradient(180deg,#0A1840 0%,#07102E 100%)' }}>
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden" style={{ minHeight: '100vh' }}>
        {/* Desktop Sidebar */}
        <aside className="w-60 flex-col hidden md:flex shrink-0"
          style={{ background: 'linear-gradient(180deg,#0A1840 0%,#07102E 100%)' }}>
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Top bar */}
          <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-slate-800 transition-colors">
                <MenuIcon size={22} />
              </button>
              <h1 className="font-bold text-slate-900 text-base md:text-lg">
                {activeTab === 'overview' ? 'خلاصه داشبورد' : 'رویدادهای من'}
              </h1>
            </div>
            <button onClick={() => setActiveTab('form')}
              className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-white rounded-lg transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#4338CA,#1E2E6E)', boxShadow: '0 4px 12px rgba(30,46,110,.35)' }}>
              <PlusIcon size={15} /><span className="hidden sm:inline">رویداد جدید</span><span className="sm:hidden">جدید</span>
            </button>
          </div>

          <div className="p-4 md:p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((s, i) => <StatCard key={i} {...s} />)}
                </div>

                <SectionHeader title="رویدادهای اخیر" subtitle="آخرین رویدادهای ثبت‌شده شما"
                  action={
                    <button onClick={() => setActiveTab('events')} className="text-sm text-blue-700 font-medium flex items-center gap-1">
                      مشاهده همه <ArrowLeftIcon size={15} />
                    </button>
                  } />

                <div className="flex flex-col gap-3">
                  {loadingEvents && Array.from({length: 3}).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                  {!loadingEvents && events.slice(0, 5).map(ev => {
                    const cat = EVENT_CATEGORIES.find(c => c.id === ev.category)
                    const cc = cat ? CATEGORY_COLORS[cat.color] : CATEGORY_COLORS.slate
                    return (
                      <div key={ev.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <CalendarIcon size={18} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">{ev.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                            <MapPinIcon size={11} /><span>{ev.province}</span>
                            <span className="text-slate-300 hidden sm:inline">•</span>
                            <CalendarIcon size={11} className="hidden sm:inline" /><span className="hidden sm:inline">{formatJalali(ev.startDate)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-medium px-2 py-1 rounded-full hidden sm:inline" style={{ background: cc.bg, color: cc.text }}>{cat?.label}</span>
                          <StatusBadge status={ev.status} />
                          <div className="flex items-center gap-0.5">
                            <button title="مشاهده" onClick={() => onNavigate('event-detail', ev)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><EyeIcon size={15} /></button>
                            <button title="ویرایش" onClick={() => { setEditingEvent(ev); setActiveTab('form') }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"><EditIcon size={15} /></button>
                            <button title="حذف" onClick={() => setDeleteModal(ev)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><TrashIcon size={15} /></button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {!loadingEvents && events.length === 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                      <CalendarIcon size={36} className="text-slate-300 mx-auto mb-3" />
                      <p className="font-semibold text-slate-700">هنوز رویدادی ثبت نشده</p>
                      <button onClick={() => setActiveTab('form')} className="mt-4 text-sm text-blue-700 font-medium hover:underline">ثبت اولین رویداد</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-600"><strong className="text-slate-900">{toPersianNum(events.length)}</strong> رویداد ثبت‌شده</p>
                </div>
                {loadingEvents && (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({length: 4}).map((_, i) => (
                      <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
                        <div className="h-40 bg-slate-200" />
                        <div className="p-4 flex flex-col gap-3">
                          <div className="h-4 bg-slate-200 rounded w-3/4" />
                          <div className="h-3 bg-slate-100 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!loadingEvents && (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {events.map(ev => (
                    <EventCard key={ev.id} event={ev} onClick={() => onNavigate('event-detail', ev)} />
                  ))}
                  <button onClick={() => setActiveTab('form')}
                    className="bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 p-8 hover:border-blue-300 hover:bg-blue-50 transition-all min-h-[220px] cursor-pointer group">
                    <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-all">
                      <PlusIcon size={22} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-slate-500 group-hover:text-blue-700 transition-colors">افزودن رویداد جدید</span>
                  </button>
                </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="حذف رویداد">
        <div className="flex flex-col gap-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            آیا از حذف رویداد <strong className="text-slate-900">«{deleteModal?.title}»</strong> اطمینان دارید؟ این عمل قابل بازگشت نیست.
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>انصراف</Button>
            <Button variant="danger" onClick={() => deleteEvent(deleteModal.id)}>حذف رویداد</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DashboardPage
