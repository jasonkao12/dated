import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { Bell, Heart, Settings, ChevronRight } from 'lucide-react'

const SETTINGS_LINKS = [
  { label: 'Notifications', description: 'Email notification preferences', href: '/settings/notifications', icon: Bell },
  { label: 'Couple Profile', description: 'Link with your partner', href: '/settings/couple', icon: Heart },
]

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-12 space-y-6">
        <div className="flex items-center gap-2">
          <Settings size={20} className="text-muted-foreground" />
          <h1 className="text-2xl font-extrabold text-foreground">Settings</h1>
        </div>
        <div className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border">
          {SETTINGS_LINKS.map(({ label, description, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/50 transition-colors"
            >
              <Icon size={18} className="text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
