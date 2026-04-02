import { useEffect, useState } from 'react'

export default function ToastXP({ xpGanado, bonus, subioNivel, nivelNuevo, onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone?.() }, 2500)
    return () => clearTimeout(t)
  }, [onDone])

  if (!visible) return null

  return (
    <div
      className="toast-slide-up"
      style={{
        position: 'fixed',
        bottom: 100,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      {/* XP ganado */}
      <div style={{
        background: 'var(--primary)',
        color: 'var(--primary-fg)',
        borderRadius: 99,
        padding: '10px 28px',
        fontFamily: 'var(--font-serif)',
        fontWeight: 700,
        fontSize: 26,
        boxShadow: '0 6px 28px rgba(200,130,10,0.55)',
        whiteSpace: 'nowrap',
      }}>
        +{xpGanado} XP{bonus > 0 && <span style={{ fontSize: 15, opacity: 0.85 }}> (+{bonus} racha)</span>}
      </div>

      {/* Subida de nivel */}
      {subioNivel && (
        <div
          className="level-glow"
          style={{
            background: 'linear-gradient(135deg, #a07010, #d4a430, #f0c850, #d4a430, #a07010)',
            color: '#1a0e02',
            borderRadius: 99,
            padding: '8px 22px',
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
          }}
        >
          ⬆ NIVEL {nivelNuevo}
        </div>
      )}
    </div>
  )
}
