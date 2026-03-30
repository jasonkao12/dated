'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { requestPasswordReset, type AuthState } from '@/app/actions/auth'

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, {} as AuthState)
  const params = useSearchParams()
  const sent = params.get('sent') === '1'

  if (sent) {
    return (
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="text-5xl">📬</div>
        <h1 className="text-2xl font-extrabold text-foreground">Check your inbox</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If an account exists for that email, we&apos;ve sent a password reset link. It expires in 1 hour.
        </p>
        <p className="text-xs text-muted-foreground">
          Didn&apos;t get it? Check your spam folder or{' '}
          <Link href="/forgot-password" className="text-primary font-semibold hover:underline">try again</Link>.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-extrabold text-foreground">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">We&apos;ll send a reset link to your email</p>
      </div>

      {state.error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-semibold text-foreground">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required
            className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            placeholder="you@example.com" />
          {state.fieldErrors?.email && <p className="text-xs text-destructive">{state.fieldErrors.email}</p>}
        </div>

        <button type="submit" disabled={pending}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
          {pending ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link>
      </p>
    </div>
  )
}
