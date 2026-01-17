import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

// Validation schema for POST
const createLinkSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
})

export async function GET(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: links, error } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'unread')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: links })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body;
  try {
    body = await request.json()
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const validation = createLinkSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.errors }, { status: 400 })
  }

  const { url, title } = validation.data

  const { data, error } = await supabase
    .from('links')
    .insert({
      url,
      title,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
