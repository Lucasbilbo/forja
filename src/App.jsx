import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { getOrCreateProfile } from './lib/profile'
import Login from './components/Login'
import BarraPersonaje from './components/BarraPersonaje'
import NavBar from './components/NavBar'
import Mundo from './components/Mundo'
import Arena from './components/Arena'
import Torre from './components/Torre'
import Taller from './components/Taller'
import Coach from './components/Coach'

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [pantalla, setPantalla] = useState('mundo')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) {
        const p = await getOrCreateProfile(session.user.id).catch(() => null)
        setProfile(p)
      }
      setCargando(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) {
        const p = await getOrCreateProfile(session.user.id).catch(() => null)
        setProfile(p)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  function handleNavegar(pantalla) {
    window.scrollTo(0, 0)
    setPantalla(pantalla)
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚒️</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--fg2)', letterSpacing: '0.1em' }}>
          FORJANDO...
        </div>
      </div>
    </div>
  )

  if (!session) return <Login />

  const userId = session.user.id

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <BarraPersonaje profile={profile} onNavegar={handleNavegar} />

      <div style={{ paddingTop: 0 }}>
        {pantalla === 'mundo' && (
          <Mundo userId={userId} profile={profile} onNavegar={handleNavegar} />
        )}
        {pantalla === 'arena' && (
          <Arena userId={userId} profile={profile} onProfileUpdate={setProfile} />
        )}
        {pantalla === 'torre' && (
          <Torre userId={userId} profile={profile} onProfileUpdate={setProfile} />
        )}
        {pantalla === 'taller' && (
          <Taller userId={userId} profile={profile} onProfileUpdate={setProfile} />
        )}
        {pantalla === 'coach' && (
          <Coach userId={userId} profile={profile} />
        )}
      </div>

      <NavBar pantalla={pantalla} onNavegar={handleNavegar} />
    </div>
  )
}

export default App
