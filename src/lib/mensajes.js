import { supabase } from './supabase'

export async function getMensajes(userId) {
  const { data, error } = await supabase
    .from('forja_mensajes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function guardarMensaje(userId, role, content) {
  const { data, error } = await supabase
    .from('forja_mensajes')
    .insert({ user_id: userId, role, content })
    .select()
    .single()
  if (error) throw error
  return data
}
