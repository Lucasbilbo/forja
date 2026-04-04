import { useEffect, useRef, useState } from 'react'
import { getMisionesHoy } from '../lib/misiones'

function nivelEdificio(statValue) {
  return Math.floor((statValue || 0) / 20) + 1
}

function getSaludo() {
  const h = new Date().getHours()
  if (h >= 6 && h < 12) return 'Buenos días, Lucas'
  if (h >= 12 && h < 20) return 'Buenas tardes, Lucas'
  return 'Buenas noches, Lucas'
}

// ── Shared sub-pieces ─────────────────────────────────────────────────────────

function Flag({ color, size = 1 }) {
  const h = Math.round(18 * size)
  const pw = Math.round(10 * size)
  const ph = Math.round(5 * size)
  return (
    <div style={{ width: 2, height: h, background: '#7a6840', position: 'relative', flexShrink: 0 }}>
      <div style={{
        position: 'absolute', left: 2, top: 3,
        width: 0, height: 0,
        borderTop: `${ph}px solid transparent`,
        borderBottom: `${ph}px solid transparent`,
        borderLeft: `${pw}px solid ${color}`,
      }} />
    </div>
  )
}

function BuildingLabel({ nombre, nivel, misiones, color }) {
  const total = misiones.length
  const completadas = misiones.filter(m => m.completada).length
  const allDone = total > 0 && completadas === total
  const hasPending = total > 0 && completadas < total
  const borderColor = allDone ? 'rgba(74,200,100,0.5)' : hasPending ? color : 'rgba(90,60,20,0.4)'

  return (
    <div style={{
      marginTop: 10,
      background: 'rgba(0,0,0,0.75)',
      border: `1px solid ${borderColor}`,
      borderRadius: 8,
      padding: '8px 12px',
      textAlign: 'center',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      minWidth: 110,
    }}>
      <div style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 11,
        color: hasPending ? color : allDone ? '#4ac864' : 'var(--fg2)',
        letterSpacing: '0.08em',
        fontWeight: 700,
        whiteSpace: 'nowrap',
        marginBottom: 5,
      }}>
        {nombre}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
        <span style={{
          fontSize: 10,
          color: 'var(--primary-light)',
          fontWeight: 600,
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
        }}>
          ⭐ NIV. {nivel}
        </span>
        {total > 0 && (
          <span style={{
            fontSize: 10,
            color: allDone ? '#4ac864' : hasPending ? color : 'var(--muted)',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}>
            📋 {completadas}/{total}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Star particles for Torre ──────────────────────────────────────────────────

function StarParticle({ delay, drift, top, left }) {
  return (
    <div style={{
      position: 'absolute',
      top,
      left,
      fontSize: 9,
      color: 'rgba(160,190,255,0.9)',
      animation: `starFloat 2.2s ease-out ${delay}s infinite`,
      '--drift': `${drift}px`,
      pointerEvents: 'none',
      zIndex: 15,
      textShadow: '0 0 6px rgba(160,190,255,0.8)',
    }}>
      ✦
    </div>
  )
}

// ── Torre del Mago ─────────────────────────────────────────────────────────────

function TorreEdificio({ nivel, misiones, onNavegar }) {
  const hasPending = misiones.some(m => !m.completada)
  const allDone = misiones.length > 0 && misiones.every(m => m.completada)
  const glowColor = allDone ? 'rgba(74,200,100,0.5)' : hasPending ? 'rgba(74,108,200,0.65)' : 'none'

  return (
    <div
      onClick={() => onNavegar('torre')}
      style={{
        position: 'absolute',
        top: '3%',
        left: '50%',
        transform: 'translateX(-50%)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10,
        userSelect: 'none',
        animation: hasPending ? 'missionGlow 2.5s ease-in-out infinite' : 'none',
        '--glow-color': glowColor,
      }}
    >
      {/* Star particles when pending */}
      {hasPending && (
        <>
          <StarParticle delay={0}    drift={-14} top="28%" left="8%"  />
          <StarParticle delay={0.5}  drift={12}  top="22%" left="80%" />
          <StarParticle delay={1.1}  drift={-8}  top="40%" left="2%"  />
          <StarParticle delay={1.7}  drift={10}  top="35%" left="88%" />
          <StarParticle delay={0.8}  drift={-5}  top="18%" left="45%" />
          <StarParticle delay={1.4}  drift={7}   top="50%" left="60%" />
        </>
      )}

      {/* Flag */}
      <div style={{ marginBottom: -2 }}>
        <Flag color="var(--torre)" />
      </div>

      {/* Cone roof */}
      <div style={{
        width: 0, height: 0,
        borderLeft: '34px solid transparent',
        borderRight: '34px solid transparent',
        borderBottom: '56px solid #1e1540',
        filter: 'drop-shadow(0 -2px 4px rgba(74,108,200,0.3))',
      }} />

      {/* Battlements */}
      <div style={{ display: 'flex', gap: 3, marginBottom: -1 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 11, height: 10, background: '#2a1e48', border: '1px solid #4a3a6a' }} />
        ))}
      </div>

      {/* Tower body */}
      <div style={{
        width: 68,
        height: 94,
        background: 'linear-gradient(180deg, #2e2250 0%, #231848 50%, #1a1238 100%)',
        border: '2px solid #4a3a70',
        borderRadius: '2px 2px 0 0',
        position: 'relative',
        boxShadow: glowColor !== 'none' ? `0 0 24px ${glowColor}, 0 0 48px ${glowColor}` : '0 4px 20px rgba(0,0,0,0.7)',
      }}>
        {/* Top window (arched, glowing) */}
        <div style={{
          position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
          width: 14, height: 18,
          background: 'rgba(160,190,255,0.95)',
          borderRadius: '50% 50% 20% 20%',
          boxShadow: '0 0 14px rgba(160,190,255,0.9), 0 0 28px rgba(100,140,255,0.4)',
          animation: 'windowFlicker 4s ease-in-out infinite',
        }} />
        {/* Middle window */}
        <div style={{
          position: 'absolute', top: 46, left: '50%', transform: 'translateX(-50%)',
          width: 12, height: 15,
          background: 'rgba(120,160,240,0.8)',
          borderRadius: '50% 50% 20% 20%',
          boxShadow: '0 0 10px rgba(120,160,240,0.7)',
          animation: 'windowFlicker 4s ease-in-out 2s infinite',
        }} />
        {/* Door */}
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 22, height: 30,
          background: '#0a0818',
          borderRadius: '50% 50% 0 0',
          border: '1px solid #3a2a58',
          borderBottom: 'none',
        }} />
        {/* Stone line texture */}
        {[18, 36, 54, 72].map(y => (
          <div key={y} style={{ position: 'absolute', top: y, left: 0, right: 0, height: 1, background: 'rgba(80,60,120,0.3)' }} />
        ))}
      </div>

      {/* Base */}
      <div style={{
        width: 84, height: 10,
        background: 'linear-gradient(180deg, #2a1e48, #1a1238)',
        border: '2px solid #4a3a70', borderTop: 'none',
        borderRadius: '0 0 4px 4px',
      }} />

      <BuildingLabel nombre="Torre del Mago" nivel={nivel} misiones={misiones} color="var(--torre-light)" />
    </div>
  )
}

// ── Arena ──────────────────────────────────────────────────────────────────────

function ArenaEdificio({ nivel, misiones, onNavegar }) {
  const hasPending = misiones.some(m => !m.completada)
  const allDone = misiones.length > 0 && misiones.every(m => m.completada)
  const glowColor = allDone ? 'rgba(74,180,100,0.5)' : hasPending ? 'rgba(200,74,26,0.65)' : 'none'
  // Intense flame effect when sessions are pending (TriCoach sessions)
  const flameActive = hasPending

  return (
    <div
      onClick={() => onNavegar('arena')}
      style={{
        position: 'absolute',
        bottom: '14%',
        left: '3%',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10,
        userSelect: 'none',
        animation: flameActive ? 'arenaFlame 1.8s ease-in-out infinite' : allDone ? 'missionGlow 2.5s ease-in-out infinite' : 'none',
        '--glow-color': glowColor,
      }}
    >
      {/* Flags on top */}
      <div style={{ display: 'flex', gap: 76, marginBottom: 4, alignItems: 'flex-end' }}>
        <Flag color="var(--arena)" size={0.85} />
        <Flag color="var(--arena)" size={0.85} />
      </div>

      {/* Outer coliseum ring */}
      <div style={{
        width: 148,
        height: 78,
        background: 'linear-gradient(180deg, #583020 0%, #3a1e0e 60%, #2a1408 100%)',
        border: '3px solid #8a4a28',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: glowColor !== 'none' ? `0 0 24px ${glowColor}, 0 0 48px ${glowColor}` : '0 6px 24px rgba(0,0,0,0.7)',
      }}>
        {/* Arch details on the ring */}
        {[0,1,2,3,4].map(i => {
          const angle = (i / 5) * Math.PI
          const x = 50 + 42 * Math.cos(angle)
          const y = 50 - 30 * Math.sin(angle)
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${x}%`, top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              width: 8, height: 12,
              background: '#2a1408',
              borderRadius: '50% 50% 0 0',
              border: '1px solid #6a3a18',
            }} />
          )
        })}

        {/* Inner sand floor */}
        <div style={{
          width: 96,
          height: 48,
          background: 'radial-gradient(ellipse, #2e1a08 0%, #1e1006 100%)',
          borderRadius: '50%',
          border: '2px solid #5a3018',
          position: 'relative',
        }}>
          {/* Cross lines on sand */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '70%', height: 1, background: 'rgba(100,60,20,0.35)', position: 'absolute' }} />
            <div style={{ width: 1, height: '70%', background: 'rgba(100,60,20,0.35)', position: 'absolute' }} />
          </div>
        </div>
      </div>

      {/* Shadow base */}
      <div style={{
        width: 162, height: 8,
        background: 'linear-gradient(180deg, #3a1e0e, #1a0a04)',
        borderRadius: '0 0 50% 50%',
        marginTop: -2,
        opacity: 0.8,
      }} />

      <BuildingLabel nombre="Arena" nivel={nivel} misiones={misiones} color="var(--arena-light)" />
    </div>
  )
}

// ── Taller ─────────────────────────────────────────────────────────────────────

function TallerEdificio({ nivel, misiones, onNavegar }) {
  const hasPending = misiones.some(m => !m.completada)
  const allDone = misiones.length > 0 && misiones.every(m => m.completada)
  const glowColor = allDone ? 'rgba(74,200,100,0.5)' : hasPending ? 'rgba(58,168,84,0.65)' : 'none'

  return (
    <div
      onClick={() => onNavegar('taller')}
      style={{
        position: 'absolute',
        bottom: '14%',
        right: '3%',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10,
        userSelect: 'none',
        animation: hasPending ? 'missionGlow 2.5s ease-in-out infinite' : 'none',
        '--glow-color': glowColor,
      }}
    >
      {/* Chimney with smoke */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', paddingRight: 22, marginBottom: -2, position: 'relative', height: 46 }}>
        {/* Smoke particles */}
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute',
            bottom: 28,
            right: 26,
            width: 10 + i * 5,
            height: 10 + i * 5,
            borderRadius: '50%',
            background: `rgba(90,90,70,${0.45 - i * 0.12})`,
            animation: `smokeRise 2.8s ease-out ${i * 0.9}s infinite`,
          }} />
        ))}
        {/* Chimney shaft */}
        <div style={{
          width: 18, height: 30,
          background: 'linear-gradient(90deg, #3a3828, #2a2818)',
          border: '1px solid #5a5840',
          alignSelf: 'flex-end',
        }}>
          {/* Chimney cap */}
          <div style={{ width: 24, height: 5, background: '#4a4830', border: '1px solid #6a6848', marginLeft: -3, marginTop: -5 }} />
        </div>
      </div>

      {/* Roof overhang */}
      <div style={{
        width: 132, height: 14,
        background: 'linear-gradient(180deg, #3a4a28, #2a3a18)',
        border: '2px solid #4a6030',
        borderRadius: '4px 4px 0 0',
        marginBottom: -1,
        boxShadow: '0 3px 8px rgba(0,0,0,0.5)',
      }} />

      {/* Main building */}
      <div style={{
        width: 122,
        height: 72,
        background: 'linear-gradient(180deg, #283820 0%, #1e2c18 50%, #162010 100%)',
        border: '2px solid #3a5828',
        position: 'relative',
        boxShadow: glowColor !== 'none' ? `0 0 24px ${glowColor}, 0 0 48px ${glowColor}` : '0 6px 24px rgba(0,0,0,0.7)',
      }}>
        {/* Left window */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          width: 22, height: 22,
          background: '#1a4820',
          border: '2px solid #4a7838',
          boxShadow: 'inset 0 0 8px rgba(60,180,80,0.25)',
        }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: '#4a7838' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#4a7838' }} />
        </div>
        {/* Right window */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 22, height: 22,
          background: '#1a4820',
          border: '2px solid #4a7838',
          boxShadow: 'inset 0 0 8px rgba(60,180,80,0.25)',
        }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: '#4a7838' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#4a7838' }} />
        </div>
        {/* Door */}
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 28, height: 38,
          background: '#0e1a0a',
          border: '2px solid #3a5828',
          borderBottom: 'none',
          borderRadius: '4px 4px 0 0',
        }} />
        {/* Brick texture lines */}
        {[18, 36, 54].map(y => (
          <div key={y} style={{ position: 'absolute', top: y, left: 0, right: 0, height: 1, background: 'rgba(60,88,40,0.35)' }} />
        ))}
        {[24, 60].map(x => (
          <div key={x} style={{ position: 'absolute', top: 0, bottom: 0, left: x, width: 1, background: 'rgba(60,88,40,0.2)' }} />
        ))}
      </div>

      {/* Base / foundation */}
      <div style={{
        width: 132, height: 10,
        background: 'linear-gradient(180deg, #2a3818, #1a2810)',
        border: '2px solid #3a5828', borderTop: 'none',
      }} />

      <BuildingLabel nombre="Taller" nivel={nivel} misiones={misiones} color="var(--taller-light)" />
    </div>
  )
}

// ── Decorative tree ────────────────────────────────────────────────────────────

function Tree({ style, sway = '3s' }) {
  return (
    <div style={{ ...style, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
      <div style={{
        width: 0, height: 0,
        borderLeft: '16px solid transparent',
        borderRight: '16px solid transparent',
        borderBottom: '22px solid #1c3616',
        animation: `windSway ${sway} ease-in-out infinite`,
        transformOrigin: 'bottom center',
      }} />
      <div style={{
        width: 0, height: 0,
        borderLeft: '22px solid transparent',
        borderRight: '22px solid transparent',
        borderBottom: '24px solid #182e14',
        marginTop: -10,
        animation: `windSway ${sway} ease-in-out 0.3s infinite`,
        transformOrigin: 'bottom center',
      }} />
      <div style={{
        width: 0, height: 0,
        borderLeft: '26px solid transparent',
        borderRight: '26px solid transparent',
        borderBottom: '20px solid #142810',
        marginTop: -10,
        animation: `windSway ${sway} ease-in-out 0.6s infinite`,
        transformOrigin: 'bottom center',
      }} />
      <div style={{ width: 8, height: 14, background: '#2a1a0a', marginTop: -2 }} />
    </div>
  )
}

// ── Dirt paths (SVG) ───────────────────────────────────────────────────────────

function Paths() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}
    >
      <defs>
        <filter id="pathBlur">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
      </defs>
      <path d="M 50 28 Q 18 52 16 72" stroke="#3a2810" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.55" filter="url(#pathBlur)" />
      <path d="M 50 28 Q 82 52 84 72" stroke="#3a2810" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.55" filter="url(#pathBlur)" />
      <path d="M 22 80 Q 50 93 78 80" stroke="#3a2810" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.4" filter="url(#pathBlur)" />
      <path d="M 50 28 Q 18 52 16 72" stroke="#5a3e18" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.25" />
      <path d="M 50 28 Q 82 52 84 72" stroke="#5a3e18" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.25" />
    </svg>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Mundo({ userId, profile, onNavegar }) {
  const [misionesHoy, setMisionesHoy] = useState([])
  const [showFloatXP, setShowFloatXP] = useState(false)
  const isFirstLoadRef = useRef(true)
  const prevCompletadasRef = useRef(0)

  useEffect(() => {
    if (!userId) return
    getMisionesHoy(userId).then(misiones => {
      const completadas = misiones.filter(m => m.completada).length
      if (!isFirstLoadRef.current && completadas > prevCompletadasRef.current) {
        setShowFloatXP(true)
        setTimeout(() => setShowFloatXP(false), 2200)
      }
      isFirstLoadRef.current = false
      prevCompletadasRef.current = completadas
      setMisionesHoy(misiones)
    }).catch(() => {})
  }, [userId])

  const misionesArena = misionesHoy.filter(m => m.edificio === 'arena')
  const misionesTorre = misionesHoy.filter(m => m.edificio === 'torre')
  const misionesTaller = misionesHoy.filter(m => m.edificio === 'taller')

  const completadas = misionesHoy.filter(m => m.completada).length
  const total = misionesHoy.length
  const racha = profile?.racha || 0

  return (
    <div style={{
      position: 'relative',
      height: 'calc(100vh - 144px)',
      minHeight: 420,
      overflow: 'hidden',
    }}>

      {/* Sky background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 20%, #0e1a24 0%, #080e14 40%, #060a0a 100%)',
        zIndex: 0,
      }} />

      {/* Stars */}
      {[[15,8],[35,5],[62,12],[80,6],[90,14],[25,18],[70,4],[48,20],[8,25],[55,3]].map(([l, t], i) => (
        <div key={i} style={{
          position: 'absolute', left: `${l}%`, top: `${t}%`,
          width: i % 3 === 0 ? 2 : 1, height: i % 3 === 0 ? 2 : 1,
          borderRadius: '50%',
          background: 'rgba(200,190,160,0.6)',
          zIndex: 1,
          animation: `pulse ${2 + (i % 3)}s ease-in-out ${i * 0.4}s infinite`,
        }} />
      ))}

      {/* Ground */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '42%',
        background: 'linear-gradient(180deg, #12160a 0%, #0e1208 50%, #0a0e06 100%)',
        zIndex: 0,
      }} />

      {/* Ground edge highlight */}
      <div style={{
        position: 'absolute',
        bottom: '42%', left: 0, right: 0,
        height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(60,48,20,0.4) 20%, rgba(80,60,24,0.3) 50%, rgba(60,48,20,0.4) 80%, transparent)',
        zIndex: 1,
      }} />

      {/* Dirt paths */}
      <Paths />

      {/* Buildings */}
      <TorreEdificio
        nivel={nivelEdificio(profile?.stat_mente || 0)}
        misiones={misionesTorre}
        onNavegar={onNavegar}
      />
      <ArenaEdificio
        nivel={nivelEdificio(profile?.stat_cuerpo || 0)}
        misiones={misionesArena}
        onNavegar={onNavegar}
      />
      <TallerEdificio
        nivel={nivelEdificio(profile?.stat_ejecucion || 0)}
        misiones={misionesTaller}
        onNavegar={onNavegar}
      />

      {/* Trees */}
      <Tree style={{ position: 'absolute', bottom: '40%', left: '1%', zIndex: 5 }} sway="3.5s" />
      <Tree style={{ position: 'absolute', bottom: '40%', right: '1%', zIndex: 5 }} sway="4s" />
      <Tree style={{ position: 'absolute', bottom: '37%', left: '36%', zIndex: 3, transform: 'scale(0.65)' }} sway="3s" />
      <Tree style={{ position: 'absolute', bottom: '37%', right: '36%', zIndex: 3, transform: 'scale(0.7)' }} sway="3.2s" />

      {/* Racha del día */}
      {racha > 0 && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          color: '#e8a83a',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textShadow: '0 0 12px rgba(200,130,10,0.7), 0 2px 8px rgba(0,0,0,0.9)',
          whiteSpace: 'nowrap',
        }}>
          🔥 Día {racha} de racha — ¡sigue así!
        </div>
      )}

      {/* Greeting overlay */}
      <div style={{
        position: 'absolute',
        top: racha > 0 ? 32 : 14,
        left: 16,
        zIndex: 20,
      }}>
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 15,
          color: 'var(--primary-light)',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textShadow: '0 2px 10px rgba(0,0,0,0.9)',
        }}>
          {getSaludo()}
        </div>
        {total > 0 && (
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
            {completadas === total ? '✅' : '⚔️'} {completadas}/{total} misiones
          </div>
        )}
      </div>

      {/* Date top right */}
      <div style={{
        position: 'absolute',
        top: 14,
        right: 16,
        zIndex: 20,
        fontSize: 11,
        color: 'var(--muted)',
        textShadow: '0 1px 6px rgba(0,0,0,0.9)',
        textAlign: 'right',
        letterSpacing: '0.04em',
      }}>
        {new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
      </div>

      {/* Floating XP animation on mission completion */}
      {showFloatXP && (
        <div style={{
          position: 'absolute',
          bottom: '30%',
          left: '50%',
          zIndex: 50,
          fontFamily: 'var(--font-serif)',
          fontSize: 22,
          fontWeight: 700,
          color: '#e8a83a',
          textShadow: '0 0 16px rgba(200,130,10,0.8), 0 2px 8px rgba(0,0,0,0.9)',
          letterSpacing: '0.06em',
          pointerEvents: 'none',
          animation: 'xpFloat 2.2s ease-out forwards',
          whiteSpace: 'nowrap',
        }}>
          +20 XP
        </div>
      )}
    </div>
  )
}
