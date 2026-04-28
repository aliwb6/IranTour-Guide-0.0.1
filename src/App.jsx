import React from 'react'
import LandingPage      from './pages/Landing.jsx'
import AuthPage         from './pages/Auth.jsx'
import DashboardPage    from './pages/Dashboard.jsx'
import AttendeeDashboard from './pages/AttendeeDashboard.jsx'
import DiscoveryPage    from './pages/Discovery.jsx'
import EventDetail      from './pages/EventDetail.jsx'
import { authAPI, usersAPI, getToken, saveToken, removeToken } from './services/api.js'

const App = () => {
  const [page, setPage]               = React.useState('landing')
  const [isLoggedIn, setIsLoggedIn]   = React.useState(false)
  const [authMode, setAuthMode]       = React.useState('login')
  const [selectedEvent, setSelectedEvent] = React.useState(null)
  const [prevPage, setPrevPage]       = React.useState('landing')
  const [user, setUser]               = React.useState({ name: '', type: null })
  const [savedEvents, setSavedEvents] = React.useState([])
  const [sessionChecked, setSessionChecked] = React.useState(false)

  // ── Restore session from localStorage on first load ──────────
  React.useEffect(() => {
    const token = getToken()
    if (!token) { setSessionChecked(true); return }

    authAPI.me()
      .then(({ user: u }) => {
        setIsLoggedIn(true)
        setUser({ id: u.id, name: u.name, type: u.type, email: u.email })
        if (u.type === 'attendee') {
          usersAPI.savedEvents()
            .then(({ savedEvents }) => setSavedEvents(savedEvents))
            .catch(() => {})
        }
      })
      .catch(() => removeToken())
      .finally(() => setSessionChecked(true))
  }, [])

  // ── Save/unsave — optimistic with API sync ────────────────────
  const toggleSave = async (ev) => {
    const isSaved = savedEvents.some(e => e.id === ev.id)
    // Optimistic update immediately
    setSavedEvents(s => isSaved ? s.filter(e => e.id !== ev.id) : [...s, ev])

    if (!isLoggedIn) return // guests: local-only

    try {
      if (isSaved) await usersAPI.unsaveEvent(ev.id)
      else         await usersAPI.saveEvent(ev.id)
    } catch {
      // Revert on API failure
      setSavedEvents(s => isSaved ? [...s, ev] : s.filter(e => e.id !== ev.id))
    }
  }

  // ── Navigation ────────────────────────────────────────────────
  const navigate = (p, payload) => {
    if (p === 'register') { setAuthMode('register'); setPage('auth'); return }
    if (p === 'login')    { setAuthMode('login');    setPage('auth'); return }

    // Accept auth payload (token + user) from any destination (e.g. landing after login)
    if (payload?.token) {
      saveToken(payload.token)
      setIsLoggedIn(true)
      setUser({ id: payload.id, name: payload.name, type: payload.type, email: payload.email })
      if (payload.type === 'attendee') {
        usersAPI.savedEvents()
          .then(({ savedEvents }) => setSavedEvents(savedEvents))
          .catch(() => {})
      }
    }

    if (p === 'dashboard' || p === 'attendee-dashboard') {
      setIsLoggedIn(true)
      if (payload && !payload.token) {
        // payload without token (e.g. internal navigation with user fields only)
        setUser({ id: payload.id, name: payload.name, type: payload.type, email: payload.email })
      }
      if (p === 'attendee-dashboard' && !payload?.token) {
        usersAPI.savedEvents()
          .then(({ savedEvents }) => setSavedEvents(savedEvents))
          .catch(() => {})
      }
    }

    if (p === 'event-detail') {
      if (payload?.id) setSelectedEvent(payload)
      setPrevPage(page)
    }

    if (p === 'logout') {
      setIsLoggedIn(false)
      setUser({ name: '', type: null })
      setSavedEvents([])
      removeToken()
      setPage('landing')
      return
    }

    setPage(p)
  }

  if (!sessionChecked) {
    // Brief invisible wait while we check localStorage token
    return null
  }

  const pages = {
    landing:              <LandingPage       onNavigate={navigate} isLoggedIn={isLoggedIn} user={user} />,
    auth:                 <AuthPage          onNavigate={navigate} mode={authMode} />,
    dashboard:            <DashboardPage     onNavigate={navigate} user={user} />,
    'attendee-dashboard': <AttendeeDashboard onNavigate={navigate} user={user} savedEvents={savedEvents} onToggleSave={toggleSave} />,
    discovery:            <DiscoveryPage     onNavigate={navigate} />,
    magazine:             <DiscoveryPage     onNavigate={navigate} defaultSection="magazine" />,
    'event-form':         <DashboardPage     onNavigate={navigate} user={user} />,
    'event-detail':       <EventDetail       event={selectedEvent} onBack={() => setPage(prevPage)} onNavigate={navigate}
                            isSaved={savedEvents.some(e => e.id === selectedEvent?.id)} onToggleSave={toggleSave} />,
  }

  return (
    <div className="page-enter" key={page}>
      {pages[page] || pages.landing}
    </div>
  )
}

export default App
