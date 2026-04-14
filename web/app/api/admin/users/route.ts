import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

// GET /api/admin/users?search=email@example.com
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const supabase = getSupabaseAdmin()
  const search = req.nextUrl.searchParams.get('search') ?? ''

  if (search) {
    // Search by email or username
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, display_name, is_admin, created_at')
      .or(`username.ilike.%${search}%,display_name.ilike.%${search}%`)
      .limit(20)

    // Also search by email via auth
    const { data: authList } = await supabase.auth.admin.listUsers({ perPage: 50 })
    const emailMatches = authList?.users
      ?.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()))
      .map(u => u.id) ?? []

    // Merge results
    const profileIds = new Set((profiles ?? []).map(p => p.id))
    let extraProfiles: typeof profiles = []
    if (emailMatches.length > 0) {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, is_admin, created_at')
        .in('id', emailMatches.filter(id => !profileIds.has(id)))
      extraProfiles = data ?? []
    }

    const allProfiles = [...(profiles ?? []), ...extraProfiles]

    // Attach emails
    const result = allProfiles.map(p => {
      const authUser = authList?.users?.find(u => u.id === p.id)
      return { ...p, email: authUser?.email ?? null }
    })

    return NextResponse.json({ users: result })
  }

  // Default: list recent users
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, display_name, is_admin, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: authList } = await supabase.auth.admin.listUsers({ perPage: 50 })

  const result = (profiles ?? []).map(p => {
    const authUser = authList?.users?.find(u => u.id === p.id)
    return { ...p, email: authUser?.email ?? null }
  })

  return NextResponse.json({ users: result })
}
