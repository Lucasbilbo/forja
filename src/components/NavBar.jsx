const TABS = [
  { id: 'mundo', label: 'Mundo', icon: '🗺️' },
  { id: 'arena', label: 'Arena', icon: '🏟️' },
  { id: 'torre', label: 'Torre', icon: '🧙' },
  { id: 'taller', label: 'Taller', icon: '⚒️' },
  { id: 'coach', label: 'Coach', icon: '💬' },
]

export default function NavBar({ pantalla, onNavegar }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--bg2)',
      borderTop: '2px solid var(--border)',
      display: 'flex',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {TABS.map(tab => {
        const activa = pantalla === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onNavegar(tab.id)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              padding: '10px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              color: activa ? 'var(--primary-light)' : 'var(--muted)',
              borderTop: activa ? '2px solid var(--primary)' : '2px solid transparent',
              marginTop: -2,
              transition: 'color 0.2s',
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{
              fontSize: 10,
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.05em',
              fontWeight: activa ? 700 : 400,
            }}>
              {tab.label.toUpperCase()}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
