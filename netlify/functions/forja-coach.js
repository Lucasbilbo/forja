const https = require('https')

function supabaseGet(path) {
  const supabaseUrl = process.env.SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''
  if (!supabaseUrl || !supabaseKey) return Promise.resolve(null)
  const hostname = new URL(supabaseUrl).hostname
  return new Promise((resolve) => {
    https.get({
      hostname,
      path: `/rest/v1/${path}`,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch { resolve(null) }
      })
    }).on('error', () => resolve(null))
  })
}

async function getForjaCuentas(userId) {
  if (!userId) return null
  const cuentas = await supabaseGet(`forja_cuentas?user_id=eq.${userId}&estado=eq.activa&select=nombre,industria,proximos_pasos,ultima_reunion&order=ultima_reunion.desc&limit=10`)
  if (!Array.isArray(cuentas) || cuentas.length === 0) return null
  const hoy = new Date().toISOString().split('T')[0]
  const reuniones = await supabaseGet(`forja_reuniones?user_id=eq.${userId}&fecha=gte.${hoy}&select=cuenta_id,fecha,acuerdos&order=fecha.asc&limit=5`)
  return { cuentas, reuniones: Array.isArray(reuniones) ? reuniones : [] }
}

const INTERVALS_ATHLETE_ID = process.env.INTERVALS_ATHLETE_ID
const INTERVALS_KEY        = process.env.INTERVALS_API_KEY

function getIntervalsWellness() {
  if (!INTERVALS_ATHLETE_ID || !INTERVALS_KEY) return Promise.resolve(null)
  const auth    = Buffer.from(`API_KEY:${INTERVALS_KEY}`).toString('base64')
  const today   = new Date().toISOString().slice(0, 10)
  const path    = `/api/v1/athlete/${INTERVALS_ATHLETE_ID}/wellness?oldest=${today}&newest=${today}`
  return new Promise((resolve) => {
    https.get({ hostname: 'intervals.icu', path, headers: { Authorization: `Basic ${auth}` } }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const arr = JSON.parse(data)
          if (!Array.isArray(arr) || arr.length === 0) return resolve(null)
          const w = arr[arr.length - 1]
          const ctl = w.ctl ?? null
          const atl = w.atl ?? null
          const tsb = (ctl !== null && atl !== null) ? ctl - atl : (w.tsb ?? null)
          if (tsb === null) return resolve(null)
          const estado = tsb > 5 ? 'fresco' : tsb >= -10 ? 'neutro' : 'fatigado'
          resolve({ ctl: Math.round(ctl ?? 0), atl: Math.round(atl ?? 0), tsb: Math.round(tsb), estado })
        } catch { resolve(null) }
      })
    }).on('error', () => resolve(null))
  })
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-forja-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const FUNCTION_SECRET = process.env.FORJA_SECRET
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS_DEFAULT = 1000
const MAX_TOKENS_BRIEFING = 2000

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' }

  const secret = event.headers['x-forja-secret']
  if (FUNCTION_SECRET && secret !== FUNCTION_SECRET) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) }
  }

  let parsed
  try {
    parsed = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'JSON inválido' }) }
  }

  const { messages, system, userId } = parsed
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'messages requerido' }) }
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'API key no configurada' }) }
  }

  const ultimoMensaje = messages[messages.length - 1]?.content || ''
  const esBriefing = ultimoMensaje.toLowerCase().includes('briefing semanal')
  const maxTokens = esBriefing ? MAX_TOKENS_BRIEFING : MAX_TOKENS_DEFAULT

  const [wellness, forjaCuentasData] = await Promise.all([
    getIntervalsWellness(),
    getForjaCuentas(userId),
  ])
  let systemFinal = system || 'Eres el Coach Forja, un coach personal integrado.'
  if (wellness) {
    systemFinal += `\n\nESTADO DE FORMA HOY (Intervals.icu): CTL ${wellness.ctl}, ATL ${wellness.atl}, TSB ${wellness.tsb} — ${wellness.estado}`
  }
  if (forjaCuentasData && forjaCuentasData.cuentas.length > 0) {
    const cuentasTexto = forjaCuentasData.cuentas
      .map(c => `- ${c.nombre}${c.industria ? ` (${c.industria})` : ''}${c.proximos_pasos ? ` → ${c.proximos_pasos}` : ''}`)
      .join('\n')
    systemFinal += `\n\nCUENTAS ACTIVAS:\n${cuentasTexto}`
    if (forjaCuentasData.reuniones.length > 0) {
      const reunionesTexto = forjaCuentasData.reuniones
        .map(r => `- ${r.fecha}${r.acuerdos ? `: ${r.acuerdos}` : ''}`)
        .join('\n')
      systemFinal += `\n\nPróximas reuniones:\n${reunionesTexto}`
    }
  }

  const body = JSON.stringify({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system: systemFinal,
    messages: messages.slice(-12),
  })

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: { ...CORS, 'Content-Type': 'application/json' },
          body: data,
        })
      })
    })
    req.on('error', (e) => {
      resolve({ statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) })
    })
    req.write(body)
    req.end()
  })
}
