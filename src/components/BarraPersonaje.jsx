import { progresoBarra, calcularNivel } from '../lib/profile'

export default function BarraPersonaje({ profile, onNavegar }) {
  if (!profile) return null

  const nivel = profile.nivel || 1
  const xpTotal = profile.xp_total || 0
  const pct = progresoBarra(xpTotal)
  const racha = profile.racha || 0

  return (
    <div style={{
      background: 'var(--bg2)',
      borderBottom: '2px solid var(--border)',
      padding: '10px 16px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Nombre + nivel */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--primary-light)', fontWeight: 700 }}>
            {profile.nombre || 'Lucas'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.05em' }}>
            NIV. {nivel}
          </div>
        </div>

        {/* Barra XP */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>XP</span>
            <span style={{ fontSize: 11, color: 'var(--xp-color)' }}>{xpTotal % 200}/{200}</span>
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Racha */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: racha > 0 ? 'rgba(200, 130, 10, 0.15)' : 'var(--bg3)',
          border: `1px solid ${racha > 0 ? 'var(--primary-dark)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          padding: '4px 10px',
        }}>
          <span style={{ fontSize: 16 }}>🔥</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: racha > 0 ? 'var(--primary-light)' : 'var(--muted)', fontWeight: 700 }}>
            {racha}
          </span>
        </div>

        {/* Stats rápidos */}
        <div style={{ flexShrink: 0, display: 'flex', gap: 8, fontSize: 11 }}>
          <span title="Cuerpo" style={{ color: 'var(--arena-light)' }}>⚔️{profile.stat_cuerpo || 0}</span>
          <span title="Mente" style={{ color: 'var(--torre-light)' }}>✨{profile.stat_mente || 0}</span>
          <span title="Ejecución" style={{ color: 'var(--taller-light)' }}>🔨{profile.stat_ejecucion || 0}</span>
        </div>
      </div>
    </div>
  )
}
