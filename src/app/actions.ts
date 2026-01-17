'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function addLink(formData: FormData) {
  const supabase = await createClient()

  const url = formData.get('url') as string
  if (!url) {
      return
  }

  const { error } = await supabase.from('links').insert({
    url,
    user_id: (await supabase.auth.getUser()).data.user?.id,
  })

  if (error) {
    console.error('Error adding link:', error)
    // In a real app we might return the error to the client
  }

  revalidatePath('/')
}

export async function deleteLink(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  if (!id) return

  const { error } = await supabase.from('links').delete().eq('id', id)
  
  if (error) {
      console.error('Error deleting link:', error)
  }

  revalidatePath('/')
}

export async function markAsRead(formData: FormData) {
    const supabase = await createClient()
    const id = formData.get('id') as string
  
    if (!id) return
  
    const { error } = await supabase.from('links').update({ status: 'read' }).eq('id', id)
    
    if (error) {
        console.error('Error marking link as read:', error)
    }
  
    revalidatePath('/')
}
