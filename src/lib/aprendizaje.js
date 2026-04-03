import { supabase } from './supabase'

export async function getAprendizajes(userId) {
  const { data, error } = await supabase
    .from('forja_aprendizaje')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getSugerenciaActiva(userId) {
  const { data, error } = await supabase
    .from('forja_aprendizaje')
    .select('*')
    .eq('user_id', userId)
    .is('sugerido_por_ia', true)
    .is('completado', false)
    .order('fecha_sugerencia', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function añadirAprendizaje(userId, { titulo, tipo, fuente, sugeridoPorIa = false, fechaSugerencia = null }) {
  const { data, error } = await supabase
    .from('forja_aprendizaje')
    .insert({
      user_id: userId,
      titulo,
      tipo,
      fuente,
      sugerido_por_ia: sugeridoPorIa,
      fecha_sugerencia: fechaSugerencia,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function completarAprendizaje(aprendizajeId, notas = '') {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('forja_aprendizaje')
    .update({ completado: true, fecha_completado: today, notas })
    .eq('id', aprendizajeId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function descartarAprendizaje(aprendizajeId) {
  const { error } = await supabase
    .from('forja_aprendizaje')
    .delete()
    .eq('id', aprendizajeId)
  if (error) throw error
}
