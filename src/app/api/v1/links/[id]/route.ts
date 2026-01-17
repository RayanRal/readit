import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const updateLinkSchema = z.object({
  status: z.enum(['unread', 'read']).optional(),
  title: z.string().optional(),
  url: z.string().url().optional(),
})

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // Ensure ownership

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  const validation = updateLinkSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.errors }, { status: 400 })
  }

  const { error } = await supabase
    .from('links')
    .update(validation.data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
