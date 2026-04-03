import { supabase } from './supabase'

export async function getOrCreateProfile(userId) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout al cargar perfil')), 8000)
  )

  const queryPromise = supabase
    .from('forja_profile')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  const { data, error } = await Promise.race([queryPromise, timeoutPromise])
    .catch(e => ({ data: null, error: e }))

  if (error) {
    console.error('[profile] Error en query:', error.message)
    throw error
  }

  if (!data) {
    // No existe — crear perfil nuevo
    const { data: created, error: createErr } = await supabase
      .from('forja_profile')
      .insert({ user_id: userId, nombre: 'Lucas' })
      .select()
      .single()
    if (createErr) throw createErr

    const today = new Date().toISOString().split('T')[0]
    seedInitialData(userId, today).catch(e =>
      console.error('[profile] Error seeding:', e.message)
    )
    return created
  }

  return data
}

async function seedInitialData(userId, today) {
  await supabase.from('forja_proyectos').insert([
    {
      user_id: userId,
      nombre: 'TriCoach AI',
      descripcion: 'Entrenador IA para triatletas hispanohablantes. App web con Stripe live, Strava, 56 tests. En fase de lanzamiento cerrado esperando aprobación Strava.',
      activo: true,
      xp_acumulado: 0,
    },
    {
      user_id: userId,
      nombre: 'Forja',
      descripcion: 'OS personal gamificado — RPG medieval que trackea entrenamiento, aprendizaje y proyectos. Uso personal exclusivo.',
      activo: true,
      xp_acumulado: 0,
    },
  ])

  await supabase.from('forja_aprendizaje').insert([
    {
      user_id: userId,
      titulo: 'Agentes IA y arquitectura MCP',
      tipo: 'concepto',
      fuente: 'Práctica con Claude Code + everything-claude-code',
      completado: false,
      sugerido_por_ia: false,
      notas: '27 agentes instalados. Usando @architect, @code-reviewer, @planner en proyectos reales.',
    },
    {
      user_id: userId,
      titulo: 'Desarrollo de productos SaaS con IA',
      tipo: 'práctica',
      fuente: 'Construcción de TriCoach AI y Forja',
      completado: false,
      sugerido_por_ia: false,
      notas: 'React + Vite, Supabase, Netlify Functions, Stripe, Strava API, Intervals.icu',
    },
    {
      user_id: userId,
      titulo: 'Prompting avanzado y optimización de tokens',
      tipo: 'concepto',
      fuente: 'Sesiones de desarrollo con Claude',
      completado: false,
      sugerido_por_ia: false,
    },
  ])

  await supabase.from('forja_misiones').insert([
    {
      user_id: userId,
      edificio: 'taller',
      titulo: 'Conseguir aprobación Strava Developer Program',
      descripcion: 'Proyecto: TriCoach AI',
      xp_recompensa: 50,
      tipo: 'especial',
      fecha: today,
    },
    {
      user_id: userId,
      edificio: 'taller',
      titulo: 'Lanzar TriCoach a primeros 25 usuarios',
      descripcion: 'Proyecto: TriCoach AI',
      xp_recompensa: 100,
      tipo: 'especial',
      fecha: today,
    },
    {
      user_id: userId,
      edificio: 'taller',
      titulo: 'Usar Forja durante 7 días consecutivos',
      descripcion: 'Proyecto: Forja',
      xp_recompensa: 50,
      tipo: 'especial',
      fecha: today,
    },
  ])
}

export async function updateProfile(userId, fields) {
  const { data, error } = await supabase
    .from('forja_profile')
    .update(fields)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export function calcularNivel(xpTotal) {
  return Math.floor(xpTotal / 200) + 1
}

export function xpParaSiguienteNivel(xpTotal) {
  const nivelActual = calcularNivel(xpTotal)
  return nivelActual * 200 - xpTotal
}

export function progresoBarra(xpTotal) {
  const xpEnNivelActual = xpTotal % 200
  return Math.round((xpEnNivelActual / 200) * 100)
}

export function getEsteticaNivel(nivel) {
  if (nivel <= 5) return 'medieval'
  if (nivel <= 10) return 'pueblo'
  if (nivel <= 20) return 'ciudad'
  return 'futuro'
}
