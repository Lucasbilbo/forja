import { useState, useEffect } from 'react'
import { getAprendizajes, getSugerenciaActiva, añadirAprendizaje, completarAprendizaje, descartarAprendizaje } from '../lib/aprendizaje'
import { getMisionesPorEdificio, crearMision, completarMision, eliminarMision } from '../lib/misiones'
import { ganarXP, actualizarRacha } from '../lib/xp'
import MisionItem from './MisionItem'
import ToastXP from './ToastXP'

const TIPOS = ['libro', 'curso', 'concepto', 'video', 'otro']

export default function Torre({ userId, profile, onProfileUpdate }) {
  const [aprendizajes, setAprendizajes] = useState([])
  const [sugerencia, setSugerencia] = useState(null)
  const [misiones, setMisiones] = useState([])
  const [showFormA, setShowFormA] = useState(false)
  const [showFormM, setShowFormM] = useState(false)
  const [formA, setFormA] = useState({ titulo: '', tipo: 'libro', fuente: '' })
  const [tituloM, setTituloM] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!userId) return
    Promise.all([
      getAprendizajes(userId),
      getSugerenciaActiva(userId),
      getMisionesPorEdificio(userId, 'torre'),
    ]).then(([a, s, m]) => {
      setAprendizajes(a)
      setSugerencia(s)
      setMisiones(m)
    }).catch(() => {})
  }, [userId])

  async function handleCompletarAprendizaje(ap) {
    try {
      const updated = await completarAprendizaje(ap.id)
      setAprendizajes(prev => prev.map(a => a.id === ap.id ? updated : a))
      if (ap.sugerido_por_ia) setSugerencia(null)
      const nuevaRacha = await actualizarRacha(userId)
      const resultado = await ganarXP(userId, 40, 'torre', nuevaRacha > 0)
      onProfileUpdate?.(resultado.profile)
      setToast(resultado)
    } catch (e) {
      console.error('[Torre] Error completando aprendizaje:', e.message)
    }
  }

  async function handleDescartarSugerencia() {
    if (!sugerencia) return
    try {
      await descartarAprendizaje(sugerencia.id)
      setSugerencia(null)
    } catch (e) {
      console.error('[Torre] Error descartando sugerencia:', e.message)
    }
  }

  async function handleCrearAprendizaje(e) {
    e.preventDefault()
    if (!formA.titulo.trim()) return
    try {
      const nuevo = await añadirAprendizaje(userId, {
        titulo: formA.titulo.trim(),
        tipo: formA.tipo,
        fuente: formA.fuente.trim(),
      })
      setAprendizajes(prev => [nuevo, ...prev])
      setFormA({ titulo: '', tipo: 'libro', fuente: '' })
      setShowFormA(false)
    } catch (e) {
      console.error('[Torre] Error creando aprendizaje:', e.message)
    }
  }

  async function handleCompletarMision(mision) {
    try {
      await completarMision(mision.id)
      setMisiones(prev => prev.map(m => m.id === mision.id ? { ...m, completada: true } : m))
      const nuevaRacha = await actualizarRacha(userId)
      const resultado = await ganarXP(userId, mision.xp_recompensa, 'torre', nuevaRacha > 0)
      onProfileUpdate?.(resultado.profile)
      setToast(resultado)
    } catch (e) {
      console.error('[Torre] Error completando misión:', e.message)
    }
  }

  async function handleCrearMision(e) {
    e.preventDefault()
    if (!tituloM.trim()) return
    try {
      const nueva = await crearMision(userId, { edificio: 'torre', titulo: tituloM.trim(), xpRecompensa: 20 })
      setMisiones(prev => [...prev, nueva])
      setTituloM('')
      setShowFormM(false)
    } catch (e) {
      console.error('[Torre] Error creando misión:', e.message)
    }
  }

  const enCurso = aprendizajes.filter(a => !a.completado)
  const completados = aprendizajes.filter(a => a.completado)

  return (
    <div style={{ padding: '16px 16px 100px', maxWidth: 680, margin: '0 auto' }}>
      {toast && <ToastXP xpGanado={toast.xpGanado} bonus={toast.bonus} subioNivel={toast.subioNivel} nivelNuevo={toast.nuevoNivel} onDone={() => setToast(null)} />}

      {/* Header */}
      <div style={{ background: 'var(--torre-bg)', border: '1px solid var(--torre)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 40 }}>🧙</span>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--torre-light)', fontSize: 22, marginBottom: 2 }}>Torre del Mago</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Mente · Conocimiento · Crecimiento</p>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--torre-light)', fontWeight: 700 }}>{profile?.stat_mente || 0}</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.05em' }}>MENTE</div>
        </div>
      </div>

      {/* Sugerencia del Mago */}
      {sugerencia && (
        <div style={{
          background: 'rgba(74,108,200,0.1)',
          border: '1px solid var(--torre)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>✨</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--torre-light)', letterSpacing: '0.05em' }}>EL MAGO SUGIERE</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)', marginBottom: 4 }}>{sugerencia.titulo}</div>
          {sugerencia.fuente && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>{sugerencia.tipo} · {sugerencia.fuente}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => handleCompletarAprendizaje(sugerencia)} style={{ flex: 1, background: 'var(--torre)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '8px', fontSize: 13, fontWeight: 600 }}>
              ✓ Completado (+40 XP)
            </button>
            <button onClick={handleDescartarSugerencia} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 14px', color: 'var(--muted)', fontSize: 13 }}>
              Descartar
            </button>
          </div>
        </div>
      )}

      {/* Misiones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--muted)', letterSpacing: '0.1em' }}>MISIONES DE HOY</h3>
        <button onClick={() => setShowFormM(v => !v)} style={{ background: 'var(--torre)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '6px 14px', fontSize: 13, fontWeight: 600 }}>+ Nueva</button>
      </div>
      {showFormM && (
        <form onSubmit={handleCrearMision} className="fade-in" style={{ background: 'var(--card)', border: '1px solid var(--torre)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 12, display: 'flex', gap: 8 }}>
          <input placeholder="Nombre de la misión" value={tituloM} onChange={e => setTituloM(e.target.value)} autoFocus style={{ flex: 1 }} />
          <button type="submit" style={{ background: 'var(--torre)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '8px 14px', fontSize: 14, fontWeight: 600 }}>+</button>
          <button type="button" onClick={() => setShowFormM(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px', color: 'var(--muted)', fontSize: 14 }}>✕</button>
        </form>
      )}
      {misiones.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {misiones.map(m => <MisionItem key={m.id} mision={m} colorAccent="var(--torre)" onCompletar={handleCompletarMision} onEliminar={async m => { await eliminarMision(m.id).catch(() => {}); setMisiones(prev => prev.filter(x => x.id !== m.id)) }} />)}
        </div>
      )}

      {/* Aprendizajes en curso */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--muted)', letterSpacing: '0.1em' }}>APRENDIENDO AHORA</h3>
        <button onClick={() => setShowFormA(v => !v)} style={{ background: 'none', border: '1px solid var(--torre)', borderRadius: 'var(--radius)', padding: '6px 14px', fontSize: 13, fontWeight: 600, color: 'var(--torre-light)' }}>+ Añadir</button>
      </div>

      {showFormA && (
        <form onSubmit={handleCrearAprendizaje} className="fade-in" style={{ background: 'var(--card)', border: '1px solid var(--torre)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input placeholder="Título (libro, curso, concepto…)" value={formA.titulo} onChange={e => setFormA(p => ({ ...p, titulo: e.target.value }))} autoFocus />
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={formA.tipo} onChange={e => setFormA(p => ({ ...p, tipo: e.target.value }))} style={{ flex: 1 }}>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="Fuente / autor / URL" value={formA.fuente} onChange={e => setFormA(p => ({ ...p, fuente: e.target.value }))} style={{ flex: 2 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ flex: 1, background: 'var(--torre)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '8px', fontWeight: 600, fontSize: 14 }}>Guardar</button>
            <button type="button" onClick={() => setShowFormA(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 14px', color: 'var(--muted)', fontSize: 14 }}>Cancelar</button>
          </div>
        </form>
      )}

      {enCurso.length === 0 && !sugerencia ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 14 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📚</div>
          Sin aprendizajes activos. ¡Pregunta al Coach qué estudiar!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {enCurso.map(ap => (
            <div key={ap.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{ap.tipo === 'libro' ? '📖' : ap.tipo === 'curso' ? '🎓' : ap.tipo === 'video' ? '▶️' : '💡'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>{ap.titulo}</div>
                {ap.fuente && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{ap.tipo} · {ap.fuente}</div>}
              </div>
              <button onClick={() => handleCompletarAprendizaje(ap)} style={{ flexShrink: 0, background: 'var(--torre)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '6px 12px', fontSize: 12, fontWeight: 600 }}>
                ✓ (+40 XP)
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Historial */}
      {completados.length > 0 && (
        <>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 12 }}>HISTORIAL</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {completados.slice(0, 10).map(ap => (
              <div key={ap.id} style={{ background: 'rgba(74,138,58,0.05)', border: '1px solid rgba(74,138,58,0.2)', borderRadius: 'var(--radius)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--success)', fontSize: 14 }}>✓</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--fg2)', textDecoration: 'line-through' }}>{ap.titulo}</div>
                  {ap.fecha_completado && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(ap.fecha_completado + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
