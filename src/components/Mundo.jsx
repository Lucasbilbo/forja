import { useEffect, useState } from 'react'
import { getMisionesHoy } from '../lib/misiones'

const EDIFICIOS = [
  {
    id: 'arena',
    nombre: 'Arena',
    subtitulo: 'Cuerpo',
    icono: '🏟️',
    evolucion: ['Estadio de Madera', 'Anfiteatro', 'Coliseo', 'Arena Estelar'],
    color: 'var(--arena)',
    colorLight: 'var(--arena-light)',
    colorBg: 'var(--arena-bg)',
    stat: 'stat_cuerpo',
  },
  {
    id: 'torre',
    nombre: 'Torre del Mago',
    subtitulo: 'Mente',
    icono: '🧙',
    evolucion: ['Torre del Mago', 'Observatorio', 'Biblioteca', 'Núcleo IA'],
    color: 'var(--torre)',
    colorLight: 'var(--torre-light)',
    colorBg: 'var(--torre-bg)',
    stat: 'stat_mente',
  },
  {
    id: 'taller',
    nombre: 'Taller',
    subtitulo: 'Ejecución',
    icono: '⚒️',
    evolucion: ['Taller Artesano', 'Forja', 'Fábrica', 'Hub de Innovación'],
    color: 'var(--taller)',
    colorLight: 'var(--taller-light)',
    colorBg: 'var(--taller-bg)',
    stat: 'stat_ejecucion',
  },
]

function nivelEdificio(statValue) {
  return Math.floor((statValue || 0) / 20) + 1
}

function nombreEdificio(edificio, stat) {
  const nivel = nivelEdificio(stat)
  const idx = Math.min(Math.floor((nivel - 1) / 5), edificio.evolucion.length - 1)
  return edificio.evolucion[idx]
}

export default function Mundo({ userId, profile, onNavegar }) {
  const [misionesHoy, setMisionesHoy] = useState([])

  useEffect(() => {
    if (!userId) return
    getMisionesHoy(userId).then(setMisionesHoy).catch(() => {})
  }, [userId])

  const misioesCompletadasHoy = misionesHoy.filter(m => m.completada).length
  const totalMisionesHoy = misionesHoy.length

  return (
    <div style={{ padding: '16px 16px 100px', maxWidth: 680, margin: '0 auto' }}>

      {/* Resumen del día */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h2 style={{ fontSize: 18, color: 'var(--fg)', marginBottom: 2 }}>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>
            {totalMisionesHoy > 0
              ? `${misioesCompletadasHoy}/${totalMisionesHoy} misiones completadas`
              : 'Sin misiones activas hoy'}
          </p>
        </div>
        {totalMisionesHoy > 0 && (
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: `conic-gradient(var(--primary) ${(misioesCompletadasHoy / totalMisionesHoy) * 360}deg, var(--bg3) 0)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--fg2)',
          }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
              {Math.round((misioesCompletadasHoy / totalMisionesHoy) * 100)}%
            </div>
          </div>
        )}
      </div>

      {/* Edificios */}
      <h3 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 13,
        color: 'var(--muted)',
        letterSpacing: '0.1em',
        marginBottom: 12,
      }}>
        TUS DOMINIOS
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {EDIFICIOS.map(edificio => {
          const statValue = profile?.[edificio.stat] || 0
          const nivelE = nivelEdificio(statValue)
          const nombreE = nombreEdificio(edificio, statValue)
          const misionesDom = misionesHoy.filter(m => m.edificio === edificio.id)
          const completadasDom = misionesDom.filter(m => m.completada).length

          return (
            <button
              key={edificio.id}
              onClick={() => onNavegar(edificio.id)}
              style={{
                background: 'var(--card)',
                border: `1px solid var(--border)`,
                borderLeft: `4px solid ${edificio.color}`,
                borderRadius: 'var(--radius-lg)',
                padding: '18px 20px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                transition: 'border-color 0.2s, background 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--card2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--card)' }}
            >
              {/* Icono */}
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--radius)',
                background: edificio.colorBg,
                border: `1px solid ${edificio.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                flexShrink: 0,
              }}>
                {edificio.icono}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: edificio.colorLight, fontWeight: 700 }}>
                    {nombreE}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.05em', flexShrink: 0, marginLeft: 8 }}>
                    NIV. {nivelE}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                  {edificio.subtitulo} · {statValue} puntos
                </div>
                {/* Barra de progreso del edificio */}
                <div className="xp-bar">
                  <div className="xp-bar-fill" style={{
                    width: `${(statValue % 20) * 5}%`,
                    background: `linear-gradient(90deg, ${edificio.color}, ${edificio.colorLight})`,
                  }} />
                </div>
              </div>

              {/* Badge misiones */}
              {misionesDom.length > 0 && (
                <div style={{
                  flexShrink: 0,
                  background: completadasDom === misionesDom.length ? 'var(--success)' : edificio.colorBg,
                  border: `1px solid ${completadasDom === misionesDom.length ? 'var(--success)' : edificio.color}`,
                  borderRadius: 99,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: completadasDom === misionesDom.length ? '#fff' : edificio.colorLight,
                }}>
                  {completadasDom}/{misionesDom.length}
                </div>
              )}

              <span style={{ color: 'var(--muted)', fontSize: 18, flexShrink: 0 }}>›</span>
            </button>
          )
        })}
      </div>

      {/* Acceso rápido al coach */}
      <button
        onClick={() => onNavegar('coach')}
        style={{
          width: '100%',
          marginTop: 20,
          background: 'none',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: 'var(--fg2)',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        <span style={{ fontSize: 20 }}>💬</span>
        Consultar al Coach Forja
        <span style={{ marginLeft: 'auto', color: 'var(--muted)' }}>›</span>
      </button>
    </div>
  )
}
