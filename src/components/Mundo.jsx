import { useEffect, useState } from 'react'
import { getMisionesHoy } from '../lib/misiones'
import { progresoBarra } from '../lib/profile'

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

function getSaludo() {
  const h = new Date().getHours()
  if (h >= 6 && h < 12) return 'Buenos días, Lucas ⚔️'
  if (h >= 12 && h < 20) return 'Buenas tardes, Lucas 🛡️'
  return 'Buenas noches, Lucas 🌙'
}

export default function Mundo({ userId, profile, onNavegar }) {
  const [misionesHoy, setMisionesHoy] = useState([])

  useEffect(() => {
    if (!userId) return
    getMisionesHoy(userId).then(setMisionesHoy).catch(() => {})
  }, [userId])

  const misionesCompletadasHoy = misionesHoy.filter(m => m.completada).length
  const totalMisionesHoy = misionesHoy.length

  return (
    <div style={{ padding: '16px 16px 100px', maxWidth: 680, margin: '0 auto' }}>

      {/* Saludo */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 24,
          color: 'var(--primary-light)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          marginBottom: 6,
        }}>
          {getSaludo()}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          {totalMisionesHoy > 0 && ` · ${misionesCompletadasHoy}/${totalMisionesHoy} misiones completadas`}
        </p>
      </div>

      {/* Grid de edificios: Arena arriba full, Torre + Taller abajo */}
      <h3 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 12,
        color: 'var(--muted)',
        letterSpacing: '0.12em',
        marginBottom: 12,
      }}>
        TUS DOMINIOS
      </h3>

      {/* Arena — fila única */}
      {(() => {
        const edificio = EDIFICIOS[0]
        const statValue = profile?.[edificio.stat] || 0
        const nivelE = nivelEdificio(statValue)
        const nombreE = nombreEdificio(edificio, statValue)
        const misionesDom = misionesHoy.filter(m => m.edificio === edificio.id)
        const completadasDom = misionesDom.filter(m => m.completada).length
        const pct = statValue % 20 * 5

        return (
          <EdificioCard
            edificio={edificio}
            nivelE={nivelE}
            nombreE={nombreE}
            statValue={statValue}
            misionesDom={misionesDom}
            completadasDom={completadasDom}
            pct={pct}
            onNavegar={onNavegar}
            size="large"
          />
        )
      })()}

      {/* Torre + Taller — fila de dos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
        {EDIFICIOS.slice(1).map(edificio => {
          const statValue = profile?.[edificio.stat] || 0
          const nivelE = nivelEdificio(statValue)
          const nombreE = nombreEdificio(edificio, statValue)
          const misionesDom = misionesHoy.filter(m => m.edificio === edificio.id)
          const completadasDom = misionesDom.filter(m => m.completada).length
          const pct = statValue % 20 * 5

          return (
            <EdificioCard
              key={edificio.id}
              edificio={edificio}
              nivelE={nivelE}
              nombreE={nombreE}
              statValue={statValue}
              misionesDom={misionesDom}
              completadasDom={completadasDom}
              pct={pct}
              onNavegar={onNavegar}
              size="small"
            />
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
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 20 }}>💬</span>
        Consultar al Coach Forja
        <span style={{ marginLeft: 'auto', color: 'var(--muted)' }}>›</span>
      </button>
    </div>
  )
}

function EdificioCard({ edificio, nivelE, nombreE, statValue, misionesDom, completadasDom, pct, onNavegar, size }) {
  const [hover, setHover] = useState(false)
  const isLarge = size === 'large'

  return (
    <button
      onClick={() => onNavegar(edificio.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'var(--card2)' : 'var(--card)',
        border: `2px solid ${hover ? edificio.color : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: isLarge ? '24px 24px 0' : '20px 16px 0',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, background 0.2s',
        width: '100%',
      }}
    >
      {/* Badge misiones */}
      {misionesDom.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: completadasDom === misionesDom.length ? 'var(--success)' : edificio.colorBg,
          border: `1px solid ${completadasDom === misionesDom.length ? 'var(--success)' : edificio.color}`,
          borderRadius: 99,
          padding: '2px 8px',
          fontSize: 11,
          fontWeight: 700,
          color: completadasDom === misionesDom.length ? '#fff' : edificio.colorLight,
        }}>
          {completadasDom}/{misionesDom.length}
        </div>
      )}

      {/* Icono */}
      <div style={{
        fontSize: isLarge ? 60 : 48,
        marginBottom: isLarge ? 12 : 8,
        lineHeight: 1,
      }}>
        {edificio.icono}
      </div>

      {/* Nombre edificio */}
      <div style={{
        fontFamily: 'var(--font-serif)',
        fontSize: isLarge ? 17 : 13,
        color: edificio.colorLight,
        fontWeight: 700,
        letterSpacing: '0.04em',
        marginBottom: 4,
        lineHeight: 1.2,
      }}>
        {nombreE}
      </div>

      {/* NIV. X */}
      <div style={{
        fontSize: isLarge ? 13 : 11,
        color: 'var(--muted)',
        letterSpacing: '0.08em',
        marginBottom: isLarge ? 16 : 12,
      }}>
        NIV. <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{nivelE}</span>
      </div>

      {/* Barra de progreso XP — pegada al fondo */}
      <div style={{
        width: '100%',
        height: 4,
        background: 'var(--bg3)',
        marginTop: 'auto',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${edificio.color}, ${edificio.colorLight})`,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </button>
  )
}
