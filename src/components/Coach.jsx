import { useState, useEffect, useRef } from 'react'
import { getMensajes, guardarMensaje } from '../lib/mensajes'

function renderMarkdown(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/((?:^|\n)- .+)+/g, block => {
      const items = block.trim().split('\n').map(l => `<li>${l.replace(/^- /, '')}</li>`).join('')
      return `<ul style="margin:6px 0;padding-left:18px">${items}</ul>`
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

export default function Coach({ userId, profile }) {
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!userId) return
    getMensajes(userId).then(setMensajes).catch(() => {})
  }, [userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function enviar() {
    if (!input.trim() || cargando) return
    const texto = input.trim()
    setInput('')
    setCargando(true)

    const nuevosMensajes = [...mensajes, { role: 'user', content: texto }]
    setMensajes(nuevosMensajes)

    try {
      await guardarMensaje(userId, 'user', texto)

      const systemPrompt = buildSystemPromptForja(profile)

      const response = await fetch('/.netlify/functions/forja-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forja-secret': import.meta.env.VITE_FORJA_SECRET || '',
        },
        body: JSON.stringify({
          userId,
          system: systemPrompt,
          messages: nuevosMensajes.slice(-12).map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await response.json()
      const respuesta = data.content?.[0]?.text || 'Error al conectar con el Coach'

      await guardarMensaje(userId, 'assistant', respuesta)
      setMensajes(prev => [...prev, { role: 'assistant', content: respuesta }])
    } catch (e) {
      console.error('[Coach] Error:', e.message)
      setMensajes(prev => [...prev, { role: 'assistant', content: 'Error al conectar. Inténtalo de nuevo.' }])
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>

      {/* Header */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '14px 16px', flexShrink: 0 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>⚗️</span>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--primary-light)', fontWeight: 700 }}>Coach Forja</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Cuerpo · Mente · Ejecución</div>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {mensajes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚗️</div>
              <p style={{ fontSize: 15, color: 'var(--fg2)', marginBottom: 8 }}>El Coach Forja te conoce en las tres dimensiones</p>
              <p style={{ fontSize: 13 }}>Pregunta sobre entrenamiento, aprendizaje, proyectos, o pide el briefing semanal</p>
            </div>
          )}
          {mensajes.map((msg, i) => (
            <div key={i} className="fade-in" style={{ marginBottom: 12, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'assistant' ? (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3, marginLeft: 4 }}>Coach Forja</div>
                  <span
                    style={{ background: 'var(--card2)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: '16px 16px 16px 4px', display: 'inline-block', fontSize: 14, lineHeight: 1.6, color: 'var(--fg)', maxWidth: '85%' }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                </div>
              ) : (
                <span style={{ background: 'var(--primary-dark)', color: 'var(--fg)', border: 'none', padding: '10px 14px', borderRadius: '16px 16px 4px 16px', display: 'inline-block', fontSize: 14, lineHeight: 1.5, maxWidth: '85%', whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </span>
              )}
            </div>
          ))}
          {cargando && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
              <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: 4 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted)', animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '12px 16px', paddingBottom: 'calc(80px + 12px)', flexShrink: 0 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: 8 }}>
          <input
            style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 24, color: 'var(--fg)', padding: '10px 16px', fontSize: 14, outline: 'none' }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !cargando && enviar()}
            placeholder="Pregunta al Coach Forja..."
            disabled={cargando}
          />
          <button
            onClick={enviar}
            disabled={cargando || !input.trim()}
            style={{ background: cargando ? 'var(--muted2)' : 'var(--primary)', color: 'var(--primary-fg)', border: 'none', borderRadius: 24, padding: '10px 20px', fontSize: 14, fontWeight: 700, flexShrink: 0 }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}

function buildSystemPromptForja(profile) {
  const nivel = profile?.nivel || 1
  const racha = profile?.racha || 0
  const xp = profile?.xp_total || 0

  return `Eres el Coach Forja, un coach personal que ayuda a Lucas a gestionar las tres dimensiones de su vida como sistema integrado.

CONTEXTO DE LUCAS:
- Nivel: ${nivel} (${xp} XP total)
- Racha actual: ${racha} días
- Cuerpo (stat): ${profile?.stat_cuerpo || 0} — triatleta, runner
- Mente (stat): ${profile?.stat_mente || 0} — emprendedor, estudia IA
- Ejecución (stat): ${profile?.stat_ejecucion || 0} — proyectos activos: TriCoach, Forja

TU ROL:
- Conoces las tres dimensiones juntas y ves las conexiones entre ellas
- Cuando te pidan el "briefing semanal", genera:
  1. Reflexión sobre la semana pasada (basada en lo que sabes del estado actual)
  2. 1 sugerencia concreta de aprendizaje para esta semana (libro específico, curso real, concepto concreto — relevante para triatleta + emprendedor IA hispanohablante)
  3. Foco de la semana: qué dimensión necesita más atención y por qué

ESTILO: directo, concreto, sin rodeos. Máximo 3-4 párrafos por respuesta salvo que te pidan más. Sin motivación vacía — solo análisis real y acciones concretas.`
}
