export default function MisionItem({ mision, onCompletar, onEliminar, colorAccent }) {
  return (
    <div className="fade-in" style={{
      background: mision.completada ? 'rgba(74,138,58,0.08)' : 'var(--card)',
      border: `1px solid ${mision.completada ? 'rgba(74,138,58,0.3)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
    }}>
      {/* Checkbox / estado */}
      <button
        onClick={() => !mision.completada && onCompletar?.(mision)}
        disabled={mision.completada}
        style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          borderRadius: 6,
          border: `2px solid ${mision.completada ? 'var(--success)' : (colorAccent || 'var(--border)')}`,
          background: mision.completada ? 'var(--success)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: mision.completada ? 'default' : 'pointer',
          marginTop: 1,
        }}
      >
        {mision.completada && <span style={{ color: '#fff', fontSize: 14, lineHeight: 1 }}>✓</span>}
      </button>

      {/* Contenido */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15,
          fontWeight: 600,
          color: mision.completada ? 'var(--muted)' : 'var(--fg)',
          textDecoration: mision.completada ? 'line-through' : 'none',
          marginBottom: mision.descripcion ? 3 : 0,
        }}>
          {mision.titulo}
        </div>
        {mision.descripcion && (
          <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
            {mision.descripcion}
          </div>
        )}
      </div>

      {/* XP badge */}
      <div style={{
        flexShrink: 0,
        fontSize: 12,
        fontWeight: 700,
        color: mision.completada ? 'var(--muted)' : 'var(--xp-color)',
        fontFamily: 'var(--font-serif)',
      }}>
        +{mision.xp_recompensa}
      </div>

      {/* Eliminar */}
      {!mision.completada && onEliminar && (
        <button
          onClick={() => onEliminar(mision)}
          style={{
            flexShrink: 0,
            background: 'none',
            border: 'none',
            color: 'var(--muted)',
            fontSize: 16,
            padding: '0 2px',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
