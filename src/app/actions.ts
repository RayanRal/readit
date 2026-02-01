'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../utils/supabase/server'
import { fetchTitle } from '../utils/fetchTitle'

export async function getCategoryColors() {
  return [
    '#ef4444', // Red 500
    '#f97316', // Orange 500
    '#f59e0b', // Amber 500
    '#10b981', // Emerald 500
    '#06b6d4', // Cyan 500
    '#3b82f6', // Blue 500
    '#6366f1', // Indigo 500
    '#8b5cf6', // Violet 500
    '#d946ef', // Fuchsia 500
    '#f43f5e', // Rose 500
  ]
}

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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
      return
  }

  const { data: existingLink } = await supabase
      .from('links')
      .select('id')
      .eq('url', url)
      .eq('user_id', user.id)
      .single()

  if (existingLink) {
      return redirect('/?error=Such article already saved')
  }

  const title = await fetchTitle(url);

  const { error } = await supabase.from('links').insert({
    url,
    title,
    user_id: user.id,
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

export async function addCategory(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string

  if (!name) return

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
      return
  }

  const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('name', name)
      .eq('user_id', user.id)
      .single()

  if (existingCategory) {
      return redirect('/?error=Such category already exists')
  }

  const colors = await getCategoryColors()
  const color = colors[Math.floor(Math.random() * colors.length)]

  const { error } = await supabase.from('categories').insert({
    name,
    color,
    user_id: user.id,
  })

  if (error) {
    console.error('Error adding category:', error)
  }

  revalidatePath('/')
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  if (!id) return

  const { error } = await supabase.from('categories').delete().eq('id', id)

  if (error) {
    console.error('Error deleting category:', error)
  }

  revalidatePath('/')
}

export async function updateLinkCategory(formData: FormData) {
  const supabase = await createClient()
  const linkId = formData.get('linkId') as string
  const categoryId = formData.get('categoryId') as string
  
  // If categoryId is empty string, we might want to set it to null (remove category)
  const catId = categoryId === '' ? null : categoryId;

  if (!linkId) return

  const { error } = await supabase.from('links').update({ category_id: catId }).eq('id', linkId)

  if (error) {
    console.error('Error updating link category:', error)
  }

  revalidatePath('/')
}
