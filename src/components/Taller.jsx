import { useState, useEffect } from 'react'
import { getProyectos, crearProyecto, archivarProyecto } from '../lib/proyectos'
import { getMisionesPorEdificio, crearMision, completarMision, eliminarMision } from '../lib/misiones'
import { ganarXP, actualizarRacha } from '../lib/xp'
import MisionItem from './MisionItem'
import ToastXP from './ToastXP'

export default function Taller({ userId, profile, onProfileUpdate }) {
  const [proyectos, setProyectos] = useState([])
  const [misiones, setMisiones] = useState([])
  const [showFormP, setShowFormP] = useState(false)
  const [showFormM, setShowFormM] = useState(null) // proyectoId o 'libre'
  const [formP, setFormP] = useState({ nombre: '', descripcion: '' })
  const [tituloM, setTituloM] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!userId) return
    Promise.all([
      getProyectos(userId),
      getMisionesPorEdificio(userId, 'taller'),
    ]).then(([p, m]) => {
      setProyectos(p)
      setMisiones(m)
    }).catch(() => {})
  }, [userId])

  async function handleCompletarMision(mision) {
    try {
      await completarMision(mision.id)
      setMisiones(prev => prev.map(m => m.id === mision.id ? { ...m, completada: true } : m))
      const nuevaRacha = await actualizarRacha(userId)
      const resultado = await ganarXP(userId, mision.xp_recompensa, 'taller', nuevaRacha > 0)
      onProfileUpdate?.(resultado.profile)
      setToast(resultado)
    } catch (e) {
      console.error('[Taller] Error completando misión:', e.message)
    }
  }

  async function handleCrearMision(e) {
    e.preventDefault()
    if (!tituloM.trim()) return
    try {
      const proyectoId = showFormM !== 'libre' ? showFormM : null
      const proyecto = proyectoId ? proyectos.find(p => p.id === proyectoId) : null
      const nueva = await crearMision(userId, {
        edificio: 'taller',
        titulo: tituloM.trim(),
        descripcion: proyecto ? `Proyecto: ${proyecto.nombre}` : '',
        xpRecompensa: 30,
      })
      setMisiones(prev => [...prev, nueva])
      setTituloM('')
      setShowFormM(null)
    } catch (e) {
      console.error('[Taller] Error creando misión:', e.message)
    }
  }

  async function handleCrearProyecto(e) {
    e.preventDefault()
    if (!formP.nombre.trim()) return
    try {
      const nuevo = await crearProyecto(userId, { nombre: formP.nombre.trim(), descripcion: formP.descripcion.trim() })
      setProyectos(prev => [nuevo, ...prev])
      setFormP({ nombre: '', descripcion: '' })
      setShowFormP(false)
    } catch (e) {
      console.error('[Taller] Error creando proyecto:', e.message)
    }
  }

  return (
    <div style={{ padding: '16px 16px 100px', maxWidth: 680, margin: '0 auto' }}>
      {toast && <ToastXP xpGanado={toast.xpGanado} bonus={toast.bonus} subioNivel={toast.subioNivel} nivelNuevo={toast.nuevoNivel} onDone={() => setToast(null)} />}

      {/* Header */}
      <div style={{ background: 'var(--taller-bg)', border: '1px solid var(--taller)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 40 }}>⚒️</span>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--taller-light)', fontSize: 22, marginBottom: 2 }}>Taller</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Ejecución · Proyectos · Hábitos</p>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--taller-light)', fontWeight: 700 }}>{profile?.stat_ejecucion || 0}</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.05em' }}>EJECUCIÓN</div>
        </div>
      </div>

      {/* Misiones del día */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--muted)', letterSpacing: '0.1em' }}>MISIONES DE HOY</h3>
        <button onClick={() => setShowFormM('libre')} style={{ background: 'var(--taller)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '6px 14px', fontSize: 13, fontWeight: 600 }}>+ Nueva</button>
      </div>

      {showFormM && (
        <form onSubmit={handleCrearMision} className="fade-in" style={{ background: 'var(--card)', border: '1px solid var(--taller)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 12, display: 'flex', gap: 8 }}>
          <input
            placeholder={showFormM !== 'libre' ? `Misión para ${proyectos.find(p => p.id === showFormM)?.nombre || 'proyecto'}` : 'Nombre de la misión'}
            value={tituloM}
            onChange={e => setTituloM(e.target.value)}
            autoFocus
            style={{ flex: 1 }}
          />
          <button type="submit" style={{ background: 'var(--taller)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '8px 14px', fontSize: 14, fontWeight: 600 }}>+</button>
          <button type="button" onClick={() => setShowFormM(null)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px', color: 'var(--muted)', fontSize: 14 }}>✕</button>
        </form>
      )}

      {misiones.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {misiones.map(m => <MisionItem key={m.id} mision={m} colorAccent="var(--taller)" onCompletar={handleCompletarMision} onEliminar={async m => { await eliminarMision(m.id).catch(() => {}); setMisiones(prev => prev.filter(x => x.id !== m.id)) }} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
          ⚒️ Las herramientas esperan. ¿Qué vas a construir hoy?
        </div>
      )}

      {/* Proyectos activos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--muted)', letterSpacing: '0.1em' }}>PROYECTOS ACTIVOS</h3>
        <button onClick={() => setShowFormP(v => !v)} style={{ background: 'none', border: '1px solid var(--taller)', borderRadius: 'var(--radius)', padding: '6px 14px', fontSize: 13, fontWeight: 600, color: 'var(--taller-light)' }}>+ Proyecto</button>
      </div>

      {showFormP && (
        <form onSubmit={handleCrearProyecto} className="fade-in" style={{ background: 'var(--card)', border: '1px solid var(--taller)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input placeholder="Nombre del proyecto" value={formP.nombre} onChange={e => setFormP(p => ({ ...p, nombre: e.target.value }))} autoFocus />
          <input placeholder="Descripción (opcional)" value={formP.descripcion} onChange={e => setFormP(p => ({ ...p, descripcion: e.target.value }))} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ flex: 1, background: 'var(--taller)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '8px', fontWeight: 600, fontSize: 14 }}>Crear</button>
            <button type="button" onClick={() => setShowFormP(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 14px', color: 'var(--muted)', fontSize: 14 }}>Cancelar</button>
          </div>
        </form>
      )}

      {proyectos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 14 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🏗️</div>
          Sin proyectos activos. ¡Crea el primero!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {proyectos.map(p => (
            <div key={p.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderLeft: '3px solid var(--taller)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: p.descripcion ? 4 : 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--fg)' }}>{p.nombre}</div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 8 }}>
                  <button onClick={() => setShowFormM(p.id)} style={{ background: 'var(--taller-bg)', border: '1px solid var(--taller)', borderRadius: 'var(--radius)', color: 'var(--taller-light)', fontSize: 12, fontWeight: 600, padding: '3px 10px' }}>+ Misión</button>
                  <button onClick={() => { archivarProyecto(p.id).catch(() => {}); setProyectos(prev => prev.filter(x => x.id !== p.id)) }} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 14, padding: '3px 6px' }} title="Archivar">×</button>
                </div>
              </div>
              {p.descripcion && <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{p.descripcion}</div>}
              {p.xp_acumulado > 0 && <div style={{ fontSize: 11, color: 'var(--xp-color)', marginTop: 6 }}>{p.xp_acumulado} XP acumulados</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
