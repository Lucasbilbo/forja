import { supabase } from './supabase'

export async function getProyectos(userId) {
  const { data, error } = await supabase
    .from('forja_proyectos')
    .select('*')
    .eq('user_id', userId)
    .eq('activo', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function crearProyecto(userId, { nombre, descripcion }) {
  const { data, error } = await supabase
    .from('forja_proyectos')
    .insert({ user_id: userId, nombre, descripcion })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function archivarProyecto(proyectoId) {
  const { data, error } = await supabase
    .from('forja_proyectos')
    .update({ activo: false })
    .eq('id', proyectoId)
    .select()
    .single()
  if (error) throw error
  return data
}
