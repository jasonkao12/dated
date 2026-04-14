import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { NotificationPreferences } from '@/components/notification-preferences'

export default async function NotificationSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-12 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose which email notifications you'd like to receive.
          </p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-2">
          <NotificationPreferences userId={user.id} />
        </div>
      </main>
    </div>
  )
}
