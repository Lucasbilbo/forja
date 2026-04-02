import { supabase } from './supabase'

export async function getMisionesHoy(userId) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('forja_misiones')
    .select('*')
    .eq('user_id', userId)
    .eq('fecha', today)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getMisionesPorEdificio(userId, edificio) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('forja_misiones')
    .select('*')
    .eq('user_id', userId)
    .eq('edificio', edificio)
    .eq('fecha', today)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function crearMision(userId, { edificio, titulo, descripcion, xpRecompensa = 20, tipo = 'diaria' }) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('forja_misiones')
    .insert({
      user_id: userId,
      edificio,
      titulo,
      descripcion,
      xp_recompensa: xpRecompensa,
      tipo,
      fecha: today,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function completarMision(misionId) {
  const { data, error } = await supabase
    .from('forja_misiones')
    .update({ completada: true })
    .eq('id', misionId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function eliminarMision(misionId) {
  const { error } = await supabase
    .from('forja_misiones')
    .delete()
    .eq('id', misionId)
  if (error) throw error
}
