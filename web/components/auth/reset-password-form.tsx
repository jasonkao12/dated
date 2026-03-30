'use client'

import { useActionState } from 'react'
import { updatePassword, type AuthState } from '@/app/actions/auth'

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, {} as AuthState)

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-extrabold text-foreground">Set new password</h1>
        <p className="text-sm text-muted-foreground">Choose something strong and memorable</p>
      </div>

      {state.error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-semibold text-foreground">New password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required
            className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            placeholder="At least 8 characters" />
          {state.fieldErrors?.password && <p className="text-xs text-destructive">{state.fieldErrors.password}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm" className="block text-sm font-semibold text-foreground">Confirm password</label>
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" required
            className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            placeholder="Same password again" />
          {state.fieldErrors?.confirm && <p className="text-xs text-destructive">{state.fieldErrors.confirm}</p>}
        </div>

        <button type="submit" disabled={pending}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
          {pending ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
