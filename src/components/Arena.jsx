import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getMisionesPorEdificio, crearMision, completarMision, eliminarMision } from '../lib/misiones'
import { ganarXP, actualizarRacha } from '../lib/xp'
import MisionItem from './MisionItem'
import ToastXP from './ToastXP'

const DIAS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function getLunesDeLaSemana() {
  const hoy = new Date()
  const dia = hoy.getDay()
  const diffLunes = (dia === 0 ? -6 : 1 - dia)
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() + diffLunes)
  return lunes.toISOString().split('T')[0]
}

export default function Arena({ userId, profile, onProfileUpdate }) {
  const [misiones, setMisiones] = useState([])
  const [titulo, setTitulo] = useState('')
  const [desc, setDesc] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState(null)
  const [sesionTricoach, setSesionTricoach] = useState(null)
  const [sesionXpDada, setSesionXpDada] = useState(false)
  const [forma, setForma] = useState(null)

  useEffect(() => {
    if (!userId) return
    getMisionesPorEdificio(userId, 'arena').then(setMisiones).catch(() => {})
    cargarSesionTricoach()
    cargarForma()
  }, [userId])

  async function cargarForma() {
    try {
      const res = await fetch(`/.netlify/functions/intervals?action=wellness&days=1`, {
        headers: { 'x-forja-secret': import.meta.env.VITE_FORJA_SECRET || '' },
      })
      if (!res.ok) return
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) return
      const ultimo = data[data.length - 1]
      const ctl = ultimo.ctl ?? null
      const atl = ultimo.atl ?? null
      const tsb = (ctl !== null && atl !== null) ? ctl - atl : (ultimo.tsb ?? null)
      if (tsb === null) return
      setForma({ ctl: Math.round(ctl ?? 0), atl: Math.round(atl ?? 0), tsb: Math.round(tsb) })
    } catch {
      // silencioso
    }
  }

  async function cargarSesionTricoach() {
    try {
      const lunes = getLunesDeLaSemana()
      const { data } = await supabase
        .from('plans')
        .select('sesiones')
        .eq('user_id', userId)
        .eq('semana', lunes)
        .single()
      if (!data?.sesiones) return
      const hoy = DIAS_ES[new Date().getDay()]
      const sesion = data.sesiones.find(s => s.dia === hoy)
      if (sesion) {
        setSesionTricoach(sesion)
        // Auto-completar XP si ya estaba completada en TriCoach
        if (sesion.completada && !sesionXpDada) {
          setSesionXpDada(true)
          const nuevaRacha = await actualizarRacha(userId)
          const resultado = await ganarXP(userId, 50, 'arena', nuevaRacha > 0)
          onProfileUpdate?.(resultado.profile)
          setToast({ ...resultado, xpGanado: 50 })
        }
      }
    } catch {
      // plans table puede no existir para este usuario — ignorar
    }
  }

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

      {/* Banner forma del día — Intervals.icu */}
      {forma && (() => {
        const { ctl, atl, tsb } = forma
        const config = tsb > 5
          ? { bg: 'rgba(22,101,52,0.25)', border: '#16a34a', emoji: '🟢', estado: 'Fresco — buen día para apretar' }
          : tsb >= -10
          ? { bg: 'rgba(113,63,18,0.25)', border: '#ca8a04', emoji: '🟡', estado: 'Neutro — entrena con cabeza' }
          : { bg: 'rgba(127,29,29,0.25)', border: '#dc2626', emoji: '🔴', estado: 'Fatigado — considera sesión suave' }
        return (
          <div style={{ background: config.bg, border: `1px solid ${config.border}`, borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'var(--fg2)' }}>
            Forma hoy: {config.emoji} {config.estado} · CTL {ctl} · ATL {atl} · TSB {tsb}
          </div>
        )
      })()}

      {/* Integración TriCoach */}
      {sesionTricoach ? (
        <div style={{
          background: sesionTricoach.completada ? 'rgba(34,197,94,0.08)' : 'rgba(200,74,26,0.10)',
          border: `2px solid ${sesionTricoach.completada ? '#22c55e' : 'var(--arena)'}`,
          borderRadius: 'var(--radius)',
          padding: '14px 16px',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>🏊🚴🏃</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--arena-light)', fontWeight: 700, letterSpacing: '0.05em' }}>
              SESIÓN TRICOACH HOY · 50 XP
            </span>
            {sesionTricoach.completada && (
              <span style={{ marginLeft: 'auto', fontSize: 11, background: '#22c55e', color: '#fff', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>✓ COMPLETADA</span>
            )}
          </div>
          <div style={{ fontSize: 14, color: 'var(--fg)', fontWeight: 600, marginBottom: 2 }}>
            {sesionTricoach.tipo?.toUpperCase()} — {sesionTricoach.descripcion}
          </div>
          {(sesionTricoach.distancia || sesionTricoach.duracion || sesionTricoach.duracion_min) && (
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {sesionTricoach.distancia && `${sesionTricoach.distancia} · `}
              {sesionTricoach.duracion || (sesionTricoach.duracion_min && `${sesionTricoach.duracion_min} min`)}
              {sesionTricoach.intensidad && ` · ${sesionTricoach.intensidad}`}
            </div>
          )}
          {!sesionTricoach.completada && (
            <button
              onClick={async () => {
                const nuevaRacha = await actualizarRacha(userId)
                const resultado = await ganarXP(userId, 50, 'arena', nuevaRacha > 0)
                onProfileUpdate?.(resultado.profile)
                setToast({ ...resultado, xpGanado: 50 })
                setSesionTricoach(prev => ({ ...prev, completada: true }))
              }}
              style={{ marginTop: 10, background: 'var(--arena)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              Marcar como completada (+50 XP)
            </button>
          )}
        </div>
      ) : (
        <div style={{
          background: 'rgba(200,74,26,0.04)',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius)',
          padding: '10px 14px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          color: 'var(--muted)',
        }}>
          <span>🔗</span>
          <span>Sin sesión TriCoach para hoy</span>
        </div>
      )}

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
          ⚔️ El campo de batalla te espera. ¿Cuál es el entrenamiento de hoy?
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
