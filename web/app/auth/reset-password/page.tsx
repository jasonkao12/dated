import { SiteHeader } from '@/components/site-header'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <ResetPasswordForm />
      </main>
    </div>
  )
}
