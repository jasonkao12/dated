'use client'

import { useState, useTransition, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Copy, Check, Link2, Link2Off } from 'lucide-react'

type Partner = {
  username: string
  display_name: string | null
}

export function CoupleConnect({ userId }: { userId: string }) {
  const supabase = createClient()
  const [myCode, setMyCode] = useState<string | null>(null)
  const [codeExpiry, setCodeExpiry] = useState<string | null>(null)
  const [partnerCode, setPartnerCode] = useState('')
  const [partner, setPartner] = useState<Partner | null>(null)
  const [coupleId, setCoupleId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, startTransition] = useTransition()

  useEffect(() => {
    async function load() {
      const [{ data: codeRow }, { data: couple }] = await Promise.all([
        supabase
          .from('couple_invite_codes')
          .select('code, expires_at')
          .eq('user_id', userId)
          .gte('expires_at', new Date().toISOString())
          .maybeSingle(),
        supabase
          .from('couple_profiles')
          .select('id, user_a, user_b')
          .or(`user_a.eq.${userId},user_b.eq.${userId}`)
          .maybeSingle(),
      ])

      if (codeRow) {
        setMyCode(codeRow.code)
        setCodeExpiry(new Date(codeRow.expires_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
      }

      if (couple) {
        setCoupleId(couple.id)
        const partnerId = couple.user_a === userId ? couple.user_b : couple.user_a
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name')
          .eq('id', partnerId)
          .single()
        if (profile) setPartner(profile as Partner)
      }

      setLoading(false)
    }
    load()
  }, [userId])

  async function generateCode() {
    // Delete old code if exists
    await supabase.from('couple_invite_codes').delete().eq('user_id', userId)

    const code = Array.from({ length: 6 }, () =>
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('')

    const { error } = await supabase.from('couple_invite_codes').insert({ user_id: userId, code })
    if (error) { setError(error.message); return }

    setMyCode(code)
    const exp = new Date()
    exp.setHours(exp.getHours() + 24)
    setCodeExpiry(exp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
  }

  async function copyCode() {
    if (!myCode) return
    await navigator.clipboard.writeText(myCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleLink() {
    const code = partnerCode.trim().toUpperCase()
    if (code.length !== 6) { setError('Enter a 6-character code.'); return }
    setError(''); setSuccess('')

    startTransition(async () => {
      // Look up the code
      const { data: codeRow } = await supabase
        .from('couple_invite_codes')
        .select('user_id, expires_at')
        .eq('code', code)
        .maybeSingle()

      if (!codeRow) { setError('Code not found or expired.'); return }
      if (new Date(codeRow.expires_at) < new Date()) { setError('Code has expired.'); return }
      if (codeRow.user_id === userId) { setError("That's your own code!"); return }

      // Create couple link (ensure user_a < user_b for the unique constraint direction)
      const [user_a, user_b] = [userId, codeRow.user_id].sort()
      const { error: linkErr } = await supabase
        .from('couple_profiles')
        .insert({ user_a, user_b })

      if (linkErr) {
        if (linkErr.code === '23505') { setError('Already linked to this partner.'); return }
        setError(linkErr.message); return
      }

      // Delete both users' codes
      await Promise.all([
        supabase.from('couple_invite_codes').delete().eq('user_id', userId),
        supabase.from('couple_invite_codes').delete().eq('user_id', codeRow.user_id),
      ])

      // Fetch partner profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('id', codeRow.user_id)
        .single()

      setPartner(profile as Partner)
      setMyCode(null)
      setPartnerCode('')
      setSuccess('Linked! 💑')
    })
  }

  async function handleUnlink() {
    if (!coupleId) return
    await supabase.from('couple_profiles').delete().eq('id', coupleId)
    setPartner(null)
    setCoupleId(null)
    setSuccess('Unlinked.')
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>

  return (
    <div className="space-y-6">
      {/* Current partner */}
      {partner ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Link2 size={16} className="text-primary" />
            <p className="text-sm font-semibold text-foreground">
              Linked with <span className="text-primary">@{partner.username}</span>
              {partner.display_name ? ` (${partner.display_name})` : ''}
            </p>
          </div>
          <button
            onClick={handleUnlink}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Link2Off size={13} /> Unlink
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Your code */}
          <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your code</p>
            {myCode ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black tracking-widest text-primary font-mono">{myCode}</span>
                  <button onClick={copyCode} className="text-muted-foreground hover:text-foreground transition-colors">
                    {copied ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Expires at {codeExpiry}. Share with your partner.</p>
                <button
                  onClick={generateCode}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Regenerate
                </button>
              </>
            ) : (
              <button
                onClick={generateCode}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Generate code
              </button>
            )}
          </div>

          {/* Enter partner's code */}
          <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Enter partner's code</p>
            <input
              type="text"
              value={partnerCode}
              onChange={e => setPartnerCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="XXXXXX"
              maxLength={6}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-2xl font-black tracking-widest text-foreground font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={handleLink}
              disabled={saving || partnerCode.length !== 6}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Linking…' : 'Link accounts'}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-primary font-semibold">{success}</p>}
    </div>
  )
}
