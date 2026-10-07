import { supabase } from './supabaseClient'

export async function getNotes() {
  const { data, error } = await supabase.from('notes').select('*')
  if (error) throw error
  return data
}

export async function addNote(userId: string, content: string) {
  const { error } = await supabase.from('notes').insert({
    user_id: userId,
    content,
  })
  if (error) throw error
}

export async function deleteNote(id: string) {
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw error
}

export async function updateNote(id: string, content: string) {
  const { error } = await supabase.from('notes').update({ content, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}