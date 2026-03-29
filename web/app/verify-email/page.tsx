import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="text-5xl">💌</div>
          <h1 className="text-2xl font-extrabold text-foreground">Check your inbox</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We sent a confirmation link to your email. Click it to activate your account.
          </p>
          <p className="text-xs text-muted-foreground">
            Didn&apos;t get it? Check your spam folder, or{' '}
            <Link href="/signup" className="text-primary hover:underline font-semibold">
              try again
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  )
}
