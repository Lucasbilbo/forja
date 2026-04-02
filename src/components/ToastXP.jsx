import { useEffect, useState } from 'react'

export default function ToastXP({ xpGanado, bonus, subioNivel, nivelNuevo, onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone?.() }, 2800)
    return () => clearTimeout(t)
  }, [onDone])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      top: 70,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      pointerEvents: 'none',
    }}>
      <div className="xp-bounce" style={{
        background: 'var(--primary)',
        color: 'var(--primary-fg)',
        borderRadius: 99,
        padding: '8px 20px',
        fontFamily: 'var(--font-serif)',
        fontWeight: 700,
        fontSize: 18,
        boxShadow: '0 4px 20px rgba(200,130,10,0.5)',
      }}>
        +{xpGanado} XP {bonus > 0 && <span style={{ fontSize: 13 }}>(+{bonus} racha)</span>}
      </div>
      {subioNivel && (
        <div className="level-up" style={{
          background: 'var(--arena)',
          color: '#fff',
          borderRadius: 99,
          padding: '6px 16px',
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
          fontSize: 14,
          boxShadow: '0 4px 20px rgba(200,74,26,0.5)',
        }}>
          ⬆ NIVEL {nivelNuevo}
        </div>
      )}
    </div>
  )
}
