import { useState, useEffect } from 'react'
import { getMisionesPorEdificio, crearMision, completarMision, eliminarMision } from '../lib/misiones'
import { ganarXP, actualizarRacha } from '../lib/xp'
import MisionItem from './MisionItem'
import ToastXP from './ToastXP'

export default function Arena({ userId, profile, onProfileUpdate }) {
  const [misiones, setMisiones] = useState([])
  const [titulo, setTitulo] = useState('')
  const [desc, setDesc] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!userId) return
    getMisionesPorEdificio(userId, 'arena').then(setMisiones).catch(() => {})
  }, [userId])

  async function handleCompletar(mision) {
    try {
      await completarMision(mision.id)
      setMisiones(prev => prev.map(m => m.id === mision.id ? { ...m, completada: true } : m))
      const nuevaRacha = await actualizarRacha(userId)
      const resultado = await ganarXP(userId, mision.xp_recompensa, 'arena', nuevaRacha > 0)
      onProfileUpdate?.(resultado.profile)
      setToast(resultado)
    } catch (e) {
      console.error('[Arena] Error completando misión:', e.message)
    }
  }

  async function handleCrear(e) {
    e.preventDefault()
    if (!titulo.trim()) return
    try {
      const nueva = await crearMision(userId, {
        edificio: 'arena',
        titulo: titulo.trim(),
        descripcion: desc.trim(),
        xpRecompensa: 25,
      })
      setMisiones(prev => [...prev, nueva])
      setTitulo('')
      setDesc('')
      setShowForm(false)
    } catch (e) {
      console.error('[Arena] Error creando misión:', e.message)
    }
  }

  async function handleEliminar(mision) {
    try {
      await eliminarMision(mision.id)
      setMisiones(prev => prev.filter(m => m.id !== mision.id))
    } catch (e) {
      console.error('[Arena] Error eliminando misión:', e.message)
    }
  }

  const completadas = misiones.filter(m => m.completada).length

  return (
    <div style={{ padding: '16px 16px 100px', maxWidth: 680, margin: '0 auto' }}>
      {toast && (
        <ToastXP
          xpGanado={toast.xpGanado}
          bonus={toast.bonus}
          subioNivel={toast.subioNivel}
          nivelNuevo={toast.nuevoNivel}
          onDone={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div style={{
        background: 'var(--arena-bg)',
        border: '1px solid var(--arena)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <span style={{ fontSize: 40 }}>🏟️</span>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--arena-light)', fontSize: 22, marginBottom: 2 }}>
            Arena
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>
            Cuerpo · Resistencia · Fuerza · Velocidad
          </p>
          <p style={{ color: 'var(--fg2)', fontSize: 12, marginTop: 4 }}>
            {completadas}/{misiones.length} misiones completadas hoy
          </p>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--arena-light)', fontWeight: 700 }}>
            {profile?.stat_cuerpo || 0}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.05em' }}>CUERPO</div>
        </div>
      </div>

      {/* Integración TriCoach */}
      <div style={{
        background: 'rgba(200,74,26,0.06)',
        border: '1px dashed var(--arena)',
        borderRadius: 'var(--radius)',
        padding: '12px 16px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 13,
        color: 'var(--muted)',
      }}>
        <span>🔗</span>
        <span>Integración con TriCoach — próximamente las sesiones completadas en Strava añadirán XP automáticamente</span>
      </div>

      {/* Misiones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--muted)', letterSpacing: '0.1em' }}>
          MISIONES DE HOY
        </h3>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            background: 'var(--arena)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius)',
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          + Nueva
        </button>
      </div>

      {/* Formulario nueva misión */}
      {showForm && (
        <form onSubmit={handleCrear} className="fade-in" style={{
          background: 'var(--card)',
          border: '1px solid var(--arena)',
          borderRadius: 'var(--radius)',
          padding: 14,
          marginBottom: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <input
            placeholder="Nombre de la misión"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            autoFocus
          />
          <input
            placeholder="Descripción (opcional)"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ flex: 1, background: 'var(--arena)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '8px', fontWeight: 600, fontSize: 14 }}>
              Crear (+25 XP)
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: 'var(--bg3)', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 14px', fontSize: 14 }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {misiones.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚔️</div>
          Sin misiones hoy. ¡Crea la primera!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {misiones.map(m => (
            <MisionItem
              key={m.id}
              mision={m}
              colorAccent="var(--arena)"
              onCompletar={handleCompletar}
              onEliminar={handleEliminar}
            />
          ))}
        </div>
      )}
    </div>
  )
}
