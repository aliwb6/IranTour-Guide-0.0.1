import React from 'react'
import LandingPage from './pages/Landing.jsx'
import AuthPage from './pages/Auth.jsx'
import DashboardPage from './pages/Dashboard.jsx'
import AttendeeDashboard from './pages/AttendeeDashboard.jsx'
import DiscoveryPage from './pages/Discovery.jsx'
import EventDetail from './pages/EventDetail.jsx'

const App = () => {
  const [page, setPage] = React.useState('landing')
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [authMode, setAuthMode] = React.useState('login')
  const [selectedEvent, setSelectedEvent] = React.useState(null)
  const [prevPage, setPrevPage] = React.useState('landing')
  const [user, setUser] = React.useState({ name: '', type: null })
  const [savedEvents, setSavedEvents] = React.useState([])
  const toggleSave = (ev) => setSavedEvents(s => s.some(e => e.id === ev.id) ? s.filter(e => e.id !== ev.id) : [...s, ev])

  const navigate = (p, payload) => {
    if (p === 'register') { setAuthMode('register'); setPage('auth'); return }
    if (p === 'login')    { setAuthMode('login');    setPage('auth'); return }
    if (p === 'dashboard' || p === 'attendee-dashboard') {
      setIsLoggedIn(true)
      if (payload && payload.name) setUser(payload)
    }
    if (p === 'event-detail') {
      if (payload && payload.id) setSelectedEvent(payload)
      setPrevPage(page)
    }
    if (p === 'logout') {
      setIsLoggedIn(false)
      setUser({ name: '', type: null })
      setPage('landing')
      return
    }
    setPage(p)
  }

  const pages = {
    landing:              <LandingPage        onNavigate={navigate} isLoggedIn={isLoggedIn} user={user} />,
    auth:                 <AuthPage           onNavigate={navigate} mode={authMode} />,
    dashboard:            <DashboardPage      onNavigate={navigate} user={user} />,
    'attendee-dashboard': <AttendeeDashboard  onNavigate={navigate} user={user} savedEvents={savedEvents} onToggleSave={toggleSave} />,
    discovery:            <DiscoveryPage      onNavigate={navigate} />,
    magazine:             <DiscoveryPage      onNavigate={navigate} defaultSection="magazine" />,
    'event-form':         <DashboardPage      onNavigate={navigate} user={user} />,
    'event-detail':       <EventDetail        event={selectedEvent} onBack={() => setPage(prevPage)} onNavigate={navigate} isSaved={savedEvents.some(e => e.id === selectedEvent?.id)} onToggleSave={toggleSave} />,
  }

  return (
    <div className="page-enter" key={page}>
      {pages[page] || pages.landing}
    </div>
  )
}

export default App
