import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { getOrCreateProfile } from './lib/profile'
import { getMisionesHoy, crearMision } from './lib/misiones'
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
  const [errorCarga, setErrorCarga] = useState(false)
  const [pantalla, setPantalla] = useState('mundo')

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCargando(prev => {
        if (prev) {
          console.error('[App] Timeout: la carga tardó más de 15 segundos')
          setErrorCarga(true)
          return false
        }
        return prev
      })
    }, 15000)

    console.log('[App] Iniciando carga')

    // Escuchar cambios de auth PRIMERO — se dispara automáticamente si hay sesión en localStorage
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[App] onAuthStateChange event:', event, 'session:', !!session)
        clearTimeout(timeout)
        setSession(session)
        if (session) {
          const p = await getOrCreateProfile(session.user.id).catch(e => {
            console.error('[App] Error cargando perfil:', e.message)
            return null
          })
          setProfile(p)
          if (p) await crearMisionesDelDiaSeNeeded(session.user.id).catch(() => {})
        } else {
          setProfile(null)
        }
        console.log('[App] setCargando false')
        setCargando(false)
      }
    )

    // Luego verificar sesión existente — si no hay sesión, desbloquear la carga
    supabase.auth.getSession()
      .then(({ data }) => {
        console.log('[App] getSession result:', !!data?.session)
        if (!data?.session) {
          console.log('[App] setCargando false')
          setCargando(false)
        }
      })
      .catch(() => setCargando(false))

    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

  async function crearMisionesDelDiaSeNeeded(userId) {
    try {
      const hoy = await getMisionesHoy(userId)
      if (hoy.length > 0) return
      await Promise.all([
        crearMision(userId, { edificio: 'arena', titulo: 'Entrenamiento del día', descripcion: 'Completa tu sesión de entrenamiento', xpRecompensa: 20 }),
        crearMision(userId, { edificio: 'torre', titulo: 'Dedicar 20 min a aprender algo', descripcion: 'Libro, curso, concepto o video', xpRecompensa: 20 }),
        crearMision(userId, { edificio: 'taller', titulo: 'Avanzar en un proyecto activo', descripcion: 'Al menos una tarea concreta en TriCoach o Forja', xpRecompensa: 20 }),
      ])
    } catch (e) {
      console.error('[App] Error creando misiones diarias:', e.message)
    }
  }

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

  if (errorCarga) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '0 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--fg2)', marginBottom: 8 }}>
          Error al conectar
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
          No se pudo cargar la app. Revisa tu conexión e inténtalo de nuevo.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ background: 'var(--primary)', color: 'var(--primary-fg)', border: 'none', borderRadius: 'var(--radius)', padding: '10px 24px', fontSize: 15, fontWeight: 700 }}
        >
          Reintentar
        </button>
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
