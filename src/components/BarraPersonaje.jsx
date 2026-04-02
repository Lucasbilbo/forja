import { progresoBarra } from '../lib/profile'

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
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 18,
            color: 'var(--primary-light)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            lineHeight: 1.1,
          }}>
            {(profile.nombre || 'Lucas').toUpperCase()}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.06em' }}>
            NIV. <span style={{ color: 'var(--primary-light)', fontWeight: 700, fontSize: 14 }}>{nivel}</span>
          </div>
        </div>

        {/* Barra XP */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em' }}>XP</span>
            <span style={{ fontSize: 10, color: 'var(--xp-color)', fontWeight: 600 }}>
              {xpTotal % 200} / 200
            </span>
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
          gap: 3,
          background: racha > 0 ? 'rgba(200, 130, 10, 0.18)' : 'var(--bg3)',
          border: `1px solid ${racha > 0 ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          padding: '5px 10px',
        }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>🔥</span>
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 18,
            color: racha > 0 ? 'var(--primary-light)' : 'var(--muted)',
            fontWeight: 700,
            lineHeight: 1,
          }}>
            {racha}
          </span>
        </div>

        {/* Stats */}
        <div style={{ flexShrink: 0, display: 'flex', gap: 10, fontSize: 12 }}>
          <span title="Cuerpo" style={{ color: 'var(--arena-light)', fontWeight: 600 }}>
            ⚔️ {profile.stat_cuerpo || 0}
          </span>
          <span title="Mente" style={{ color: 'var(--torre-light)', fontWeight: 600 }}>
            📚 {profile.stat_mente || 0}
          </span>
          <span title="Ejecución" style={{ color: 'var(--taller-light)', fontWeight: 600 }}>
            ⚒️ {profile.stat_ejecucion || 0}
          </span>
        </div>
      </div>
    </div>
  )
}
