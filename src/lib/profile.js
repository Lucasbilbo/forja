import { supabase } from './supabase'

export async function getOrCreateProfile(userId) {
  const { data, error } = await supabase
    .from('forja_profile')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code === 'PGRST116') {
    // No profile exists — create one
    const { data: created, error: createErr } = await supabase
      .from('forja_profile')
      .insert({ user_id: userId, nombre: 'Lucas' })
      .select()
      .single()
    if (createErr) throw createErr

    // Auto-create initial projects
    await supabase.from('forja_proyectos').insert([
      { user_id: userId, nombre: 'TriCoach', descripcion: 'Entrenador IA para triatletas', activo: true, xp_acumulado: 0 },
      { user_id: userId, nombre: 'Forja', descripcion: 'OS personal gamificado', activo: true, xp_acumulado: 0 },
    ])

    return created
  }
  if (error) throw error
  return data
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
