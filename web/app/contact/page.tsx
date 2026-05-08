import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Mail, MessageCircle } from 'lucide-react'

export const metadata = {
  title: 'Contact — Dated',
  description: "Get in touch with the Dated team. We'd love to hear from you.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-2xl px-4 py-12 space-y-10">

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Contact us</h1>
          <p className="text-muted-foreground text-lg">
            Questions, feedback, or just want to say hi — we&apos;re a small team and we actually read every message.
          </p>
        </div>

        {/* Primary contact */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Mail size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">Email us</p>
              <p className="text-sm text-muted-foreground">We respond within 1–2 business days</p>
            </div>
          </div>
          <a
            href="mailto:support@getdated.app"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Mail size={15} />
            support@getdated.app
          </a>
        </div>

        {/* What to reach us about */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">What we can help with</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: '🐛', title: 'Bug reports', desc: 'Something broken? Tell us exactly what happened and we\'ll fix it.' },
              { emoji: '💡', title: 'Feature requests', desc: 'Have an idea that would make Dated better? We\'d love to hear it.' },
              { emoji: '🤝', title: 'Business enquiries', desc: 'Interested in partnering with Dated or featuring your venue?' },
              { emoji: '🔒', title: 'Account or privacy', desc: 'Issues with your account, data deletion requests, or privacy concerns.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-4 space-y-1">
                <p className="font-semibold text-foreground text-sm">{emoji} {title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Response expectations */}
        <div className="rounded-2xl bg-secondary/50 border border-border p-5 flex items-start gap-3">
          <MessageCircle size={18} className="text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Dated is an independent product built and maintained by a small team. We read and respond to every message personally — please allow 1–2 business days for a reply.
          </p>
        </div>

      </main>
      <SiteFooter />
    </div>
  )
}
