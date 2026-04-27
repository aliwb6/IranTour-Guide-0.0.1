import React from 'react'
import {
  CalendarIcon, SparklesIcon, SearchIcon, MapPinIcon, UsersIcon,
  LayoutIcon, ArrowLeftIcon, MenuIcon, XIcon,
} from '../icons.jsx'
import { GlassEventCard } from '../components.jsx'
import { SAMPLE_EVENTS } from '../utils.js'

// ── Carousel Track (infinite auto-scroll) ────────────────────
const CarouselTrack = ({ events, onNavigate }) => {
  const trackRef = React.useRef(null)
  const [paused, setPaused] = React.useState(false)
  const items = [...events, ...events, ...events]

  React.useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let pos = 0
    let raf
    const speed = 0.5

    const animate = () => {
      if (!paused) {
        pos += speed
        const halfWidth = track.scrollWidth / 3
        if (pos >= halfWidth) pos = 0
        track.style.transform = `translateX(${pos}px)`
      }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [paused])

  return (
    <div className="overflow-hidden px-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      <div ref={trackRef} className="flex gap-4" style={{willChange:'transform'}}>
        {items.map((ev, idx) => (
          <div key={idx} style={{minWidth:'280px', maxWidth:'280px'}}>
            <GlassEventCard event={ev} idx={ev.id % 6} onClick={() => onNavigate('event-detail', ev)} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Landing Page ──────────────────────────────────────────────
const LandingPage = ({ onNavigate, isLoggedIn, user = {} }) => {
  const [hovered, setHovered] = React.useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [footerModal, setFooterModal] = React.useState(null)

  const stats = [
    { value: '۶۹',    label: 'رویداد ثبت‌شده' },
    { value: '۳۱',    label: 'استان فعال'    },
    { value: '۱۴۰۴–۱۴۰۵', label: 'پوشش سالانه' },
    { value: '۲۰+',  label: 'دسته‌بندی رویداد' },
  ]

  const features = [
    { icon: <CalendarIcon size={20} />, title: 'ثبت آسان رویداد',     desc: 'فرم هوشمند سه‌مرحله‌ای برای ثبت سریع', color: '#3B82F6' },
    { icon: <SearchIcon  size={20} />, title: 'کشف هوشمند',           desc: 'فیلتر پیشرفته استان، دسته‌بندی و تاریخ',  color: '#0EA5E9' },
    { icon: <SparklesIcon size={20} />, title: 'پیشنهاد هوش مصنوعی', desc: 'رویدادهای متناسب با علاقه‌مندی‌هایتان', color: '#8B5CF6' },
    { icon: <MapPinIcon  size={20} />, title: 'پوشش سراسری',          desc: 'رویدادها در تمام ۳۱ استان کشور',          color: '#10B981' },
  ]

  return (
    <div className="min-h-screen flex flex-col scene-bg relative overflow-x-hidden">

      {/* Decorative Orbs */}
      <div className="orb w-96 h-96 opacity-25" style={{background:'#1E2E6E', top:'-10%', right:'-8%'}} />
      <div className="orb w-80 h-80 opacity-18" style={{background:'#162459', top:'20%', left:'-5%'}} />
      <div className="orb w-64 h-64 opacity-15" style={{background:'#0284C7', bottom:'30%', right:'10%'}} />
      <div className="absolute inset-0 grid-overlay opacity-100 pointer-events-none" />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{background:'rgba(7,16,46,.97)', backdropFilter:'blur(12px)'}}>
          <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#4338CA,#1E2E6E)'}}>
                <CalendarIcon size={16} className="text-white" strokeWidth={2} />
              </div>
              <span className="font-bold text-white">رویداد ایران</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="text-blue-300 hover:text-white transition-colors">
              <XIcon size={24} />
            </button>
          </div>
          <nav className="flex flex-col gap-2 p-6 flex-1">
            {[
              { label: 'کشف رویدادها', page: 'discovery' },
              { label: 'مجله رویداد',  page: 'magazine'  },
            ].map(n => (
              <button key={n.page} onClick={() => { setMobileMenuOpen(false); onNavigate(n.page) }}
                className="text-right px-4 py-4 rounded-xl text-lg font-bold text-blue-200 hover:text-white hover:bg-white/10 transition-all">
                {n.label}
              </button>
            ))}
            <div className="border-t border-white/10 mt-4 pt-4 flex flex-col gap-2">
              {isLoggedIn ? (
                <button onClick={() => { setMobileMenuOpen(false); onNavigate(user.type === 'attendee' ? 'attendee-dashboard' : 'dashboard') }}
                  className="w-full py-3.5 rounded-xl text-base font-bold text-white"
                  style={{background:'linear-gradient(135deg,#4338CA,#1E2E6E)'}}>
                  حساب کاربری
                </button>
              ) : (
                <>
                  <button onClick={() => { setMobileMenuOpen(false); onNavigate('login') }}
                    className="w-full py-3 rounded-xl text-base font-semibold text-blue-200 border border-white/20 hover:text-white hover:bg-white/10 transition-all">
                    ورود
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); onNavigate('register') }}
                    className="w-full py-3.5 rounded-xl text-base font-bold text-white"
                    style={{background:'linear-gradient(135deg,#4338CA,#1E2E6E)'}}>
                    ثبت‌نام رایگان
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Footer Modal */}
      {footerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setFooterModal(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 text-lg">{footerModal.title}</h2>
              <button onClick={() => setFooterModal(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <XIcon size={20} />
              </button>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{footerModal.content}</div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="navbar-glass sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center glow-blue"
              style={{background:'linear-gradient(135deg,#4338CA,#1E2E6E)'}}>
              <CalendarIcon size={18} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <span className="font-bold text-white text-base">رویداد ایران</span>
              <span className="hidden sm:inline text-xs text-blue-300 mr-1.5 font-normal">Event-Iran</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {[
              { label: 'کشف رویدادها', page: 'discovery' },
              { label: 'مجله',         page: 'magazine'   },
            ].map(n => (
              <button key={n.page} onClick={() => onNavigate(n.page)}
                className="px-4 py-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-all font-medium">
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <button onClick={() => onNavigate(user.type === 'attendee' ? 'attendee-dashboard' : 'dashboard')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:-translate-y-0.5"
                style={{background:'linear-gradient(135deg,#4338CA,#1E2E6E)', boxShadow:'0 4px 14px rgba(30,46,110,.45)'}}>
                <UsersIcon size={15} /> {user.name ? user.name.split(' ')[0] : 'حساب کاربری'}
              </button>
            ) : (
              <>
                <button onClick={() => onNavigate('login')}
                  className="hidden sm:block px-4 py-2 text-sm text-blue-200 hover:text-white font-medium transition-colors">ورود</button>
                <button onClick={() => onNavigate('register')}
                  className="hidden sm:block px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:-translate-y-0.5"
                  style={{background:'linear-gradient(135deg,#4338CA,#1E2E6E)', boxShadow:'0 4px 14px rgba(30,46,110,.45)'}}>
                  ثبت‌نام
                </button>
              </>
            )}
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-blue-200 hover:text-white transition-colors p-1">
              <MenuIcon size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-5 py-24">
        <div className="inline-flex items-center gap-2 mb-7 px-4 py-2 rounded-full text-xs font-semibold crystal-badge">
          <SparklesIcon size={12} />
          پلتفرم رسمی مدیریت رویداد ایران
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6 max-w-3xl"
          style={{letterSpacing:'-.02em', textShadow:'0 2px 20px rgba(0,0,0,.3)'}}>
          رویدادهای ایران،<br />
          <span style={{background:'linear-gradient(90deg,#A5B4FC,#C7D2FE,#6366F1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>
            یک‌جا، آسان، حرفه‌ای
          </span>
        </h1>
        <p className="text-blue-200 text-lg max-w-lg mb-14 leading-relaxed">
          از جشنواره‌های فرهنگی تا همایش‌های تخصصی —<br className="hidden sm:block"/>
          رویداد خود را ثبت کنید یا بهترین رویدادها را کشف کنید.
        </p>

        {/* Dual Mode Cards */}
        <div className="grid md:grid-cols-2 gap-5 max-w-2xl w-full mx-auto">
          {/* Host */}
          <button
            onMouseEnter={() => setHovered('host')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onNavigate('register')}
            className="group text-right rounded-2xl p-7 transition-all duration-300 relative overflow-hidden cursor-pointer"
            style={hovered === 'host'
              ? { background:'linear-gradient(145deg,rgba(22,36,89,.65),rgba(30,46,110,.5))', boxShadow:'0 20px 60px rgba(22,36,89,.5), inset 0 1px 0 rgba(255,255,255,.2)', border:'1px solid rgba(99,102,241,.45)', transform:'translateY(-6px) scale(1.01)' }
              : { background:'rgba(255,255,255,.07)', boxShadow:'0 8px 32px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.12)' }}>
            <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full opacity-20 transition-all"
              style={{background:'radial-gradient(circle,#60A5FA,transparent)'}} />
            <div className="w-12 h-12 rounded-xl mb-5 flex items-center justify-center transition-all"
              style={hovered==='host' ? {background:'rgba(255,255,255,.2)'} : {background:'rgba(67,56,202,.25)', border:'1px solid rgba(99,102,241,.35)'}}>
              <LayoutIcon size={22} className="text-indigo-300" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">میزبان رویداد هستم</h3>
            <p className="text-sm leading-relaxed mb-5 text-blue-200">
              رویداد خود را ثبت کنید، مدیریت کنید و مخاطبان بیشتری جذب کنید.
            </p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-300 group-hover:text-blue-100 transition-colors">
              <span>شروع کنید</span><ArrowLeftIcon size={15} />
            </div>
          </button>

          {/* Attend */}
          <button
            onMouseEnter={() => setHovered('attend')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onNavigate('register')}
            className="group text-right rounded-2xl p-7 transition-all duration-300 relative overflow-hidden cursor-pointer"
            style={hovered === 'attend'
              ? { background:'linear-gradient(145deg,rgba(4,120,87,.55),rgba(5,150,105,.4))', boxShadow:'0 20px 60px rgba(16,185,129,.3), inset 0 1px 0 rgba(255,255,255,.25)', border:'1px solid rgba(52,211,153,.5)', transform:'translateY(-6px) scale(1.01)' }
              : { background:'rgba(255,255,255,.07)', boxShadow:'0 8px 32px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.12)' }}>
            <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full opacity-20 transition-all"
              style={{background:'radial-gradient(circle,#34D399,transparent)'}} />
            <div className="w-12 h-12 rounded-xl mb-5 flex items-center justify-center transition-all"
              style={hovered==='attend' ? {background:'rgba(255,255,255,.2)'} : {background:'rgba(16,185,129,.2)', border:'1px solid rgba(52,211,153,.3)'}}>
              <SearchIcon size={22} className="text-emerald-300" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">دنبال رویداد می‌گردم</h3>
            <p className="text-sm leading-relaxed mb-5 text-blue-200">
              رویدادهای سراسر ایران را کشف کنید و برای شرکت آماده شوید.
            </p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-300 group-hover:text-emerald-100 transition-colors">
              <span>جستجو کنید</span><ArrowLeftIcon size={15} />
            </div>
          </button>
        </div>
      </section>

      {/* Stats Glass Band */}
      <section className="glass border-y border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-4xl font-extrabold text-white stat-number mb-1" style={{letterSpacing:'-.02em'}}>{s.value}</div>
                <div className="text-blue-300 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">چرا رویداد ایران؟</h2>
          <p className="text-blue-300 text-sm">ساده، سریع، قابل اعتماد</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 hover:-translate-y-1 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{background:`${f.color}22`, border:`1px solid ${f.color}44`, color: f.color}}>
                {f.icon}
              </div>
              <h3 className="font-bold text-white text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-blue-300 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Events — Auto Carousel */}
      <section className="pb-12 overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">رویدادهای برگزیده</h2>
            <p className="text-blue-300 text-sm mt-0.5">محبوب‌ترین رویدادهای جاری کشور</p>
          </div>
          <button onClick={() => onNavigate('discovery')}
            className="text-sm text-blue-300 font-semibold flex items-center gap-1 hover:text-white transition-colors hover:gap-2">
            مشاهده همه <ArrowLeftIcon size={15} />
          </button>
        </div>
        <div className="relative">
          <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
            style={{background:'linear-gradient(to left, #07102E, transparent)'}} />
          <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
            style={{background:'linear-gradient(to right, #07102E, transparent)'}} />
          <CarouselTrack events={SAMPLE_EVENTS} onNavigate={onNavigate} />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-6xl mx-auto px-5 pb-16">
        <div className="glass-card rounded-2xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute left-0 top-0 w-64 h-full pointer-events-none"
            style={{background:'linear-gradient(to right, rgba(59,130,246,.12), transparent)'}} />
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-1">آماده‌اید رویداد خود را ثبت کنید؟</h3>
            <p className="text-blue-300 text-sm">ثبت رایگان — در کمتر از ۱۰ دقیقه</p>
          </div>
          <button onClick={() => onNavigate('register')}
            className="relative z-10 flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl shrink-0 transition-all hover:-translate-y-0.5"
            style={{background:'linear-gradient(135deg,#4338CA,#1E2E6E)', boxShadow:'0 8px 24px rgba(30,46,110,.55)'}}>
            ثبت رویداد جدید <ArrowLeftIcon size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-white/10 py-7">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-blue-300">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{background:'linear-gradient(135deg,#4338CA,#1E2E6E)'}}>
              <CalendarIcon size={13} className="text-white" />
            </div>
            <span className="text-white font-medium">رویداد ایران</span>
            <span className="text-white/20">|</span>
            <span>Event-Iran</span>
          </div>
          <span className="text-blue-400 text-xs">© ۱۴۰۴ تمامی حقوق محفوظ است</span>
          <div className="flex items-center gap-5 text-xs">
            {[
              { label: 'حریم خصوصی', title: 'حریم خصوصی', content: 'رویداد ایران اطلاعات شخصی کاربران را با احترام کامل نگهداری می‌کند.\n\n• اطلاعات شما بدون رضایت شما به اشخاص ثالث منتقل نخواهد شد.\n• داده‌های رویداد تنها برای اهداف پلتفرم استفاده می‌شود.\n• کاربران در هر زمان می‌توانند درخواست حذف اطلاعات خود را بدهند.\n\nبرای اطلاعات بیشتر با ما در تماس باشید.' },
              { label: 'تماس با ما', title: 'تماس با ما', content: 'برای ارتباط با تیم رویداد ایران:\n\n📧 info@event-iran.ir\n📞 ۰۲۱-۱۲۳۴۵۶۷۸\n\nساعات پاسخگویی:\nشنبه تا چهارشنبه — ۹ صبح تا ۶ عصر\n\nآدرس:\nتهران، خیابان ولیعصر، ساختمان رویداد ایران' },
              { label: 'راهنما', title: 'راهنمای استفاده', content: 'شروع با رویداد ایران:\n\n۱. ثبت‌نام رایگان با شماره موبایل\n۲. انتخاب نوع حساب: برگزارکننده یا شرکت‌کننده\n۳. کشف رویدادهای سراسر کشور\n۴. فیلتر بر اساس استان، دسته‌بندی و تاریخ\n\nبرای ثبت رویداد:\n• وارد داشبورد سازمان‌دهنده شوید\n• فرم سه‌مرحله‌ای را تکمیل کنید\n• رویداد خود را منتشر کنید' },
            ].map(l => (
              <button key={l.label} onClick={() => setFooterModal(l)}
                className="link-ul hover:text-white transition-colors">{l.label}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
