import React from 'react'
import { CalendarIcon, ChevronRightIcon, CheckIcon, LayoutIcon, UsersIcon } from '../icons.jsx'

const AuthPage = ({ onNavigate, mode: initMode = 'login' }) => {
  const [mode, setMode] = React.useState(initMode)
  const [userType, setUserType] = React.useState('organizer')
  const [regStep, setRegStep] = React.useState(0)
  const [form, setForm] = React.useState({ name: '', phone: '', password: '' })
  const [errors, setErrors] = React.useState({})
  const [loading, setLoading] = React.useState(false)
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const validate = (fields) => {
    const errs = {}
    if (fields.includes('phone') && !form.phone.trim()) errs.phone = 'شماره موبایل یا ایمیل الزامی است'
    if (fields.includes('password') && form.password.length < 4) errs.password = 'رمز عبور حداقل ۴ کاراکتر باید باشد'
    if (fields.includes('name') && !form.name.trim()) errs.name = 'نام الزامی است'
    return errs
  }

  const handleLogin = () => {
    const errs = validate(['phone', 'password'])
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const dest = userType === 'organizer' ? 'dashboard' : 'attendee-dashboard'
      onNavigate(dest, { name: form.phone.includes('@') ? form.phone.split('@')[0] : form.phone, type: userType })
    }, 800)
  }

  const handleRegister = () => {
    const errs = validate(['name', 'phone', 'password'])
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const dest = userType === 'organizer' ? 'dashboard' : 'attendee-dashboard'
      onNavigate(dest, { name: form.name.trim(), type: userType })
    }, 900)
  }

  const GlassInput = ({ label, type = 'text', field, placeholder, autoFocus }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-blue-200">{label}</label>
      <input
        type={type}
        value={form[field]}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())}
        className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 transition-all"
        style={{
          background: errors[field] ? 'rgba(239,68,68,.12)' : 'rgba(255,255,255,.08)',
          border: `1px solid ${errors[field] ? 'rgba(239,68,68,.5)' : 'rgba(255,255,255,.12)'}`,
          boxShadow: errors[field] ? '0 0 0 3px rgba(239,68,68,.1)' : 'none'
        }} />
      {errors[field] && <p className="text-xs text-red-400">{errors[field]}</p>}
    </div>
  )

  const UserTypeToggle = () => (
    <div className="grid grid-cols-2 gap-2 mb-1">
      {[
        { id: 'organizer', label: 'برگزارکننده', icon: <LayoutIcon size={14} /> },
        { id: 'attendee',  label: 'شرکت‌کننده',  icon: <UsersIcon  size={14} /> },
      ].map(t => (
        <button key={t.id} onClick={() => setUserType(t.id)}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
          style={userType === t.id
            ? { background: t.id === 'organizer' ? 'rgba(67,56,202,.35)' : 'rgba(22,101,52,.35)', border: `1px solid ${t.id === 'organizer' ? 'rgba(99,102,241,.5)' : 'rgba(52,211,153,.4)'}`, color: '#fff' }
            : { background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#93C5FD' }}>
          {t.icon}{t.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen scene-bg flex flex-col relative overflow-hidden">
      <div className="orb w-96 h-96 opacity-20" style={{ background: '#1E2E6E', top: '-15%', right: '-10%' }} />
      <div className="orb w-72 h-72 opacity-15" style={{ background: '#162459', bottom: '10%', left: '-8%' }} />
      <div className="absolute inset-0 grid-overlay pointer-events-none" />

      <div className="relative z-10 p-5">
        <button onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors text-sm font-medium">
          <ChevronRightIcon size={16} /> بازگشت به صفحه اصلی
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-10 relative z-10">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#4338CA,#1E2E6E)', boxShadow: '0 8px 24px rgba(30,46,110,.5)' }}>
              <CalendarIcon size={26} className="text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-1">رویداد ایران</h1>
            <p className="text-blue-300 text-sm">پلتفرم رسمی مدیریت رویداد</p>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            {/* Mode Tabs */}
            <div className="flex border-b border-white/10">
              {[{ id: 'login', label: 'ورود' }, { id: 'register', label: 'ثبت‌نام' }].map(t => (
                <button key={t.id} onClick={() => { setMode(t.id); setRegStep(0); setErrors({}) }}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-all ${mode === t.id ? 'text-white border-b-2 border-indigo-400' : 'text-blue-300 hover:text-white'}`}
                  style={mode === t.id ? { background: 'rgba(255,255,255,.05)' } : {}}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-6">

              {/* ── LOGIN ── */}
              {mode === 'login' && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-semibold text-blue-200 mb-1">نوع حساب</p>
                    <UserTypeToggle />
                  </div>
                  <GlassInput label="شماره موبایل یا ایمیل" field="phone" placeholder="۰۹۱۲۳۴۵۶۷۸۹" autoFocus />
                  <GlassInput label="رمز عبور" type="password" field="password" placeholder="••••••••" />
                  <div className="flex justify-end">
                    <button className="text-xs text-blue-300 hover:text-white transition-colors">فراموشی رمز عبور</button>
                  </div>
                  <button onClick={handleLogin} disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 mt-1"
                    style={{ background: userType === 'organizer' ? 'linear-gradient(135deg,#4338CA,#1E2E6E)' : 'linear-gradient(135deg,#166534,#065F46)', boxShadow: '0 6px 20px rgba(30,46,110,.5)' }}>
                    {loading
                      ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />در حال ورود...</span>
                      : 'ورود به حساب'}
                  </button>
                  <p className="text-center text-xs text-blue-300">
                    حساب ندارید؟{' '}
                    <button onClick={() => { setMode('register'); setRegStep(0); setErrors({}) }} className="text-white font-semibold hover:underline">ثبت‌نام کنید</button>
                  </p>
                </div>
              )}

              {/* ── REGISTER Step 0 — Choose type ── */}
              {mode === 'register' && regStep === 0 && (
                <div className="flex flex-col gap-4">
                  <div className="text-center mb-2">
                    <p className="text-white font-bold text-base mb-1">چه نوع کاربری هستید؟</p>
                    <p className="text-blue-300 text-xs">نوع حساب کاربری را انتخاب کنید</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'organizer', label: 'برگزارکننده', sub: 'ثبت و مدیریت رویداد', icon: <LayoutIcon size={22} className="text-indigo-300" />, activeStyle: { background: 'rgba(67,56,202,.3)', border: '2px solid rgba(99,102,241,.6)', boxShadow: '0 4px 16px rgba(67,56,202,.3)' }, checkColor: 'bg-indigo-500' },
                      { id: 'attendee',  label: 'شرکت‌کننده',  sub: 'کشف و ثبت رویداد',    icon: <UsersIcon  size={22} className="text-emerald-300" />, activeStyle: { background: 'rgba(22,101,52,.3)',  border: '2px solid rgba(52,211,153,.5)',  boxShadow: '0 4px 16px rgba(16,185,129,.2)' }, checkColor: 'bg-emerald-500' },
                    ].map(t => (
                      <button key={t.id} onClick={() => setUserType(t.id)}
                        className="flex flex-col items-center gap-3 p-5 rounded-xl transition-all duration-200 relative"
                        style={userType === t.id ? t.activeStyle : { background: 'rgba(255,255,255,.06)', border: '2px solid rgba(255,255,255,.1)' }}>
                        {userType === t.id && (
                          <div className={`absolute top-2 left-2 w-5 h-5 rounded-full ${t.checkColor} flex items-center justify-center`}>
                            <CheckIcon size={11} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ background: userType === t.id ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.08)' }}>
                          {t.icon}
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold text-sm">{t.label}</p>
                          <p className="text-blue-300 text-xs mt-0.5 leading-relaxed">{t.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setRegStep(1)}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 mt-1"
                    style={{ background: 'linear-gradient(135deg,#4338CA,#1E2E6E)', boxShadow: '0 6px 20px rgba(30,46,110,.4)' }}>
                    ادامه
                  </button>
                  <p className="text-center text-xs text-blue-300">
                    حساب دارید؟{' '}
                    <button onClick={() => setMode('login')} className="text-white font-semibold hover:underline">وارد شوید</button>
                  </p>
                </div>
              )}

              {/* ── REGISTER Step 1 — Fill form ── */}
              {mode === 'register' && regStep === 1 && (
                <div className="flex flex-col gap-4">
                  <button onClick={() => setRegStep(0)} className="flex items-center gap-1 text-blue-300 hover:text-white text-xs font-medium transition-colors mb-1 w-fit">
                    <ChevronRightIcon size={13} />
                    {userType === 'organizer' ? 'برگزارکننده رویداد' : 'شرکت‌کننده'}
                  </button>
                  <GlassInput label="نام و نام خانوادگی" field="name" placeholder="علی محمدی" autoFocus />
                  <GlassInput label="شماره موبایل" field="phone" placeholder="۰۹۱۲۳۴۵۶۷۸۹" />
                  <GlassInput label="رمز عبور" type="password" field="password" placeholder="حداقل ۴ کاراکتر" />
                  <button onClick={handleRegister} disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 mt-1"
                    style={{
                      background: userType === 'organizer' ? 'linear-gradient(135deg,#4338CA,#1E2E6E)' : 'linear-gradient(135deg,#166534,#065F46)',
                      boxShadow: userType === 'organizer' ? '0 6px 20px rgba(30,46,110,.5)' : '0 6px 20px rgba(22,101,52,.4)'
                    }}>
                    {loading
                      ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />در حال ثبت‌نام...</span>
                      : 'ایجاد حساب کاربری'}
                  </button>
                </div>
              )}

            </div>
          </div>

          <p className="text-center text-xs text-blue-400 mt-5">
            با ثبت‌نام، <span className="text-blue-200 hover:underline cursor-pointer">شرایط استفاده</span> و <span className="text-blue-200 hover:underline cursor-pointer">حریم خصوصی</span> را می‌پذیرید
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
