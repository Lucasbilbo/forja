import { supabase } from './supabase'
import { calcularNivel } from './profile'

const XP_POR_EDIFICIO = {
  arena: 'stat_cuerpo',
  torre: 'stat_mente',
  taller: 'stat_ejecucion',
}

export async function ganarXP(userId, xpBase, edificio, rachaActiva) {
  const bonus = rachaActiva ? Math.round(xpBase * 0.1) : 0
  const xpTotal = xpBase + bonus

  const { data: profile, error: fetchErr } = await supabase
    .from('forja_profile')
    .select('xp_total, xp_actual, nivel, racha, stat_cuerpo, stat_mente, stat_ejecucion')
    .eq('user_id', userId)
    .single()
  if (fetchErr) throw fetchErr

  const nuevoXpTotal = (profile.xp_total || 0) + xpTotal
  const nuevoNivel = calcularNivel(nuevoXpTotal)
  const subioNivel = nuevoNivel > (profile.nivel || 1)

  const statField = XP_POR_EDIFICIO[edificio]
  const updates = {
    xp_total: nuevoXpTotal,
    xp_actual: nuevoXpTotal,
    nivel: nuevoNivel,
    ultima_actividad: new Date().toISOString().split('T')[0],
  }
  if (statField) {
    updates[statField] = (profile[statField] || 0) + Math.round(xpBase / 10)
  }

  const { data, error } = await supabase
    .from('forja_profile')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error

  return { profile: data, xpGanado: xpTotal, bonus, subioNivel, nuevoNivel }
}

export async function actualizarRacha(userId) {
  const { data: profile, error } = await supabase
    .from('forja_profile')
    .select('racha, ultima_actividad')
    .eq('user_id', userId)
    .single()
  if (error) throw error

  const today = new Date().toISOString().split('T')[0]
  const ayer = new Date()
  ayer.setDate(ayer.getDate() - 1)
  const ayerStr = ayer.toISOString().split('T')[0]

  const ultimaActividad = profile.ultima_actividad
  let nuevaRacha = profile.racha || 0

  if (ultimaActividad === today) {
    // Ya se contó hoy, no hacer nada
    return profile.racha
  } else if (ultimaActividad === ayerStr) {
    // Día consecutivo — aumentar racha
    nuevaRacha = nuevaRacha + 1
  } else {
    // Se rompió la racha
    nuevaRacha = 1
  }

  await supabase
    .from('forja_profile')
    .update({ racha: nuevaRacha })
    .eq('user_id', userId)

  return nuevaRacha
}
