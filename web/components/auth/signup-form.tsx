'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUp, type AuthState } from '@/app/actions/auth'

export function SignupForm() {
  const [state, action, pending] = useActionState(signUp, {} as AuthState)

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-extrabold text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground">Start sharing your date stories</p>
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
            className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            placeholder="you@example.com" />
          {state.fieldErrors?.email && <p className="text-xs text-destructive">{state.fieldErrors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="username" className="block text-sm font-semibold text-foreground">Username</label>
          <input id="username" name="username" type="text" autoComplete="username" required
            className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            placeholder="yourname" />
          {state.fieldErrors?.username
            ? <p className="text-xs text-destructive">{state.fieldErrors.username}</p>
            : <p className="text-xs text-muted-foreground">Letters, numbers, and underscores only</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-semibold text-foreground">Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required
            className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            placeholder="At least 8 characters" />
          {state.fieldErrors?.password && <p className="text-xs text-destructive">{state.fieldErrors.password}</p>}
        </div>

        {/* Legal — required */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Required</p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" name="tos" className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary" />
            <span className="text-sm text-foreground leading-snug">
              I agree to the{' '}
              <Link href="/terms" className="font-semibold text-primary hover:underline" target="_blank">Terms & Conditions</Link>
            </span>
          </label>
          {state.fieldErrors?.tos && <p className="text-xs text-destructive pl-7">{state.fieldErrors.tos}</p>}

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" name="privacy" className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary" />
            <span className="text-sm text-foreground leading-snug">
              I have read and accept the{' '}
              <Link href="/privacy" className="font-semibold text-primary hover:underline" target="_blank">Privacy Policy</Link>
            </span>
          </label>
          {state.fieldErrors?.privacy && <p className="text-xs text-destructive pl-7">{state.fieldErrors.privacy}</p>}
        </div>

        {/* Marketing — optional, off by default */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" name="marketing" className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary" />
          <span className="text-sm text-muted-foreground leading-snug">
            Send me date ideas, new features, and occasional updates{' '}
            <span className="text-xs">(optional)</span>
          </span>
        </label>

        <button type="submit" disabled={pending}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
          {pending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link>
      </p>
    </div>
  )
}
