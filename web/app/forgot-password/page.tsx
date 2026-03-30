import { Suspense } from 'react'
import { SiteHeader } from '@/components/site-header'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <Suspense>
          <ForgotPasswordForm />
        </Suspense>
      </main>
    </div>
  )
}
