import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NavLinks } from '@/components/nav-links'

export async function SiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-primary">
          Dated
        </Link>

        {/* Desktop nav */}
        <NavLinks user={user} profile={profile} />

        {/* Desktop auth */}
        {!user ? (
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign up
            </Link>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/write"
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground hover:bg-accent/80 transition-colors"
            >
              + Write a review
            </Link>
            <Link
              href={profile ? `/u/${profile.username}` : '/profile'}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {(profile?.display_name ?? profile?.username ?? user.email ?? 'U').charAt(0).toUpperCase()}
            </Link>
          </div>
        )}

        {/* Mobile: write button or login */}
        {!user ? (
          <Link
            href="/signup"
            className="md:hidden rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
          >
            Sign up
          </Link>
        ) : (
          <Link
            href="/write"
            className="md:hidden rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground"
          >
            + Review
          </Link>
        )}
      </div>
    </header>
  )
}
