'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { logIn, type AuthState } from '@/app/actions/auth'
import { SiteHeader } from '@/components/site-header'

const initial: AuthState = {}

export default function LoginPage() {
  const [state, action, pending] = useActionState(logIn, initial)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">

          <div className="text-center space-y-1">
            <h1 className="text-3xl font-extrabold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Log in to your Dated account</p>
          </div>

          {state.error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                placeholder="you@example.com"
              />
              {state.fieldErrors?.email && (
                <p className="text-xs text-destructive">{state.fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                placeholder="••••••••"
              />
              {state.fieldErrors?.password && (
                <p className="text-xs text-destructive">{state.fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {pending ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>

        </div>
      </main>
    </div>
  )
}
