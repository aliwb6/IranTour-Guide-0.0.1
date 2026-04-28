import React from 'react'
import { CalendarIcon, ChevronRightIcon, CheckIcon, LayoutIcon, UsersIcon } from '../icons.jsx'
import { authAPI } from '../services/api.js'

// ── All sub-components defined OUTSIDE AuthPage so React never remounts them ──

const GlassInput = ({ label, type = 'text', value, onChange, placeholder, autoFocus, inputRef, onEnter, error }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-blue-200">{label}</label>
    <input
      ref={inputRef}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onKeyDown={e => { if (e.key === 'Enter' && onEnter) onEnter() }}
      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 transition-all"
      style={{
        background: error ? 'rgba(239,68,68,.12)' : 'rgba(255,255,255,.08)',
        border: `1px solid ${error ? 'rgba(239,68,68,.5)' : 'rgba(255,255,255,.12)'}`,
        boxShadow: error ? '0 0 0 3px rgba(239,68,68,.1)' : 'none',
      }}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
)

const UserTypeToggle = ({ userType, setUserType }) => (
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

const ApiErrorBanner = ({ error }) => error ? (
  <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 text-xs text-red-300 text-center">
    {error}
  </div>
) : null

const Spinner = ({ isLogin }) => (
  <span className="flex items-center justify-center gap-2">
    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
    {isLogin ? 'در حال ورود...' : 'در حال ثبت‌نام...'}
  </span>
)

// ── Main component ────────────────────────────────────────────

const AuthPage = ({ onNavigate, mode: initMode = 'login' }) => {
  const [mode, setMode]         = React.useState(initMode)
  const [userType, setUserType] = React.useState('organizer')
  const [regStep, setRegStep]   = React.useState(0)
  const [form, setForm]         = React.useState({ name: '', email: '', phone: '', password: '' })
  const [errors, setErrors]     = React.useState({})
  const [apiError, setApiError] = React.useState('')
  const [loading, setLoading]   = React.useState(false)

  const emailRef    = React.useRef(null)
  const phoneRef    = React.useRef(null)
  const passwordRef = React.useRef(null)
  const loginPassRef = React.useRef(null)

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
    setApiError('')
  }

  const validate = (fields) => {
    const errs = {}
    if (fields.includes('email')    && !/\S+@\S+\.\S+/.test(form.email))    errs.email    = 'ایمیل معتبر وارد کنید'
    if (fields.includes('password') && form.password.length < 6)            errs.password = 'رمز عبور حداقل ۶ کاراکتر باید باشد'
    if (fields.includes('name')     && !form.name.trim())                   errs.name     = 'نام الزامی است'
    return errs
  }

  const handleLogin = async () => {
    const errs = validate(['email', 'password'])
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setApiError('')
    try {
      const { token, user } = await authAPI.login({ email: form.email, password: form.password })
      onNavigate('landing', { token, id: user.id, name: user.name, type: user.type, email: user.email })
    } catch (err) {
      setApiError(err.message || 'ورود ناموفق بود')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    const errs = validate(['name', 'email', 'password'])
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setApiError('')
    try {
      const { token, user } = await authAPI.register({
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password,
        phone:    form.phone.trim() || undefined,
        type:     userType,
      })
      onNavigate('landing', { token, id: user.id, name: user.name, type: user.type, email: user.email })
    } catch (err) {
      setApiError(err.message || 'ثبت‌نام ناموفق بود')
    } finally {
      setLoading(false)
    }
  }

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
            <h1 className="text-2xl font-extrabold text-white mb-1">رویدادیار</h1>
            <p className="text-blue-300 text-sm">پلتفرم رسمی مدیریت رویداد</p>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            {/* Mode Tabs */}
            <div className="flex border-b border-white/10">
              {[{ id: 'login', label: 'ورود' }, { id: 'register', label: 'ثبت‌نام' }].map(t => (
                <button key={t.id} onClick={() => { setMode(t.id); setRegStep(0); setErrors({}); setApiError('') }}
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
                    <UserTypeToggle userType={userType} setUserType={setUserType} />
                  </div>
                  <GlassInput
                    label="ایمیل" type="email" placeholder="example@email.com" autoFocus
                    value={form.email} onChange={e => set('email', e.target.value)}
                    error={errors.email} onEnter={() => loginPassRef.current?.focus()}
                  />
                  <GlassInput
                    label="رمز عبور" type="password" placeholder="••••••••"
                    inputRef={loginPassRef}
                    value={form.password} onChange={e => set('password', e.target.value)}
                    error={errors.password} onEnter={handleLogin}
                  />
                  <ApiErrorBanner error={apiError} />
                  <div className="flex justify-end -mt-2">
                    <button className="text-xs text-blue-300 hover:text-white transition-colors">فراموشی رمز عبور</button>
                  </div>
                  <button onClick={handleLogin} disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 mt-1"
                    style={{ background: userType === 'organizer' ? 'linear-gradient(135deg,#4338CA,#1E2E6E)' : 'linear-gradient(135deg,#166534,#065F46)', boxShadow: '0 6px 20px rgba(30,46,110,.5)' }}>
                    {loading ? <Spinner isLogin /> : 'ورود به حساب'}
                  </button>
                  <p className="text-center text-xs text-blue-300">
                    حساب ندارید؟{' '}
                    <button onClick={() => { setMode('register'); setRegStep(0); setErrors({}); setApiError('') }} className="text-white font-semibold hover:underline">ثبت‌نام کنید</button>
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
                  <GlassInput
                    label="نام و نام خانوادگی" placeholder="علی محمدی" autoFocus
                    value={form.name} onChange={e => set('name', e.target.value)}
                    error={errors.name} onEnter={() => emailRef.current?.focus()}
                  />
                  <GlassInput
                    label="ایمیل" type="email" placeholder="example@email.com"
                    inputRef={emailRef}
                    value={form.email} onChange={e => set('email', e.target.value)}
                    error={errors.email} onEnter={() => phoneRef.current?.focus()}
                  />
                  <GlassInput
                    label="شماره موبایل (اختیاری)" placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    inputRef={phoneRef}
                    value={form.phone} onChange={e => set('phone', e.target.value)}
                    error={errors.phone} onEnter={() => passwordRef.current?.focus()}
                  />
                  <GlassInput
                    label="رمز عبور" type="password" placeholder="حداقل ۶ کاراکتر"
                    inputRef={passwordRef}
                    value={form.password} onChange={e => set('password', e.target.value)}
                    error={errors.password} onEnter={handleRegister}
                  />
                  <ApiErrorBanner error={apiError} />
                  <button onClick={handleRegister} disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 mt-1"
                    style={{
                      background: userType === 'organizer' ? 'linear-gradient(135deg,#4338CA,#1E2E6E)' : 'linear-gradient(135deg,#166534,#065F46)',
                      boxShadow:  userType === 'organizer' ? '0 6px 20px rgba(30,46,110,.5)' : '0 6px 20px rgba(22,101,52,.4)',
                    }}>
                    {loading ? <Spinner /> : 'ایجاد حساب کاربری'}
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
