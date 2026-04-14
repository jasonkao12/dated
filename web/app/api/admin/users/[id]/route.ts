import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

type Ctx = { params: Promise<{ id: string }> }

// GET /api/admin/users/[id] — get user details
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await ctx.params
  const supabase = getSupabaseAdmin()

  const [{ data: profile }, { data: authData }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.auth.admin.getUserById(id),
  ])

  if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({
    ...profile,
    email: authData?.user?.email ?? null,
    email_confirmed: authData?.user?.email_confirmed_at ? true : false,
    last_sign_in: authData?.user?.last_sign_in_at ?? null,
    created_at_auth: authData?.user?.created_at ?? null,
  })
}

// PATCH /api/admin/users/[id] — update user (password, email, admin status)
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await ctx.params
  const body = await req.json()
  const supabase = getSupabaseAdmin()

  const updates: Record<string, unknown> = {}

  // Auth updates (password, email)
  if (body.password) {
    const { error: authErr } = await supabase.auth.admin.updateUserById(id, {
      password: body.password,
    })
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 })
  }

  if (body.email) {
    const { error: authErr } = await supabase.auth.admin.updateUserById(id, {
      email: body.email,
      email_confirm: true,
    })
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 })
  }

  // Profile updates
  if (body.is_admin !== undefined) updates.is_admin = body.is_admin
  if (body.display_name !== undefined) updates.display_name = body.display_name
  if (body.username !== undefined) updates.username = body.username
  if (body.bio !== undefined) updates.bio = body.bio

  if (Object.keys(updates).length > 0) {
    const { error: profileErr } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, updated: { ...updates, password: body.password ? '***' : undefined, email: body.email } })
}

// DELETE /api/admin/users/[id] — delete user entirely
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await ctx.params
  const supabase = getSupabaseAdmin()

  const { error: delErr } = await supabase.auth.admin.deleteUser(id)
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 })

  return NextResponse.json({ ok: true, deleted: id })
}
