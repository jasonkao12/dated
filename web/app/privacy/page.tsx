import { SiteHeader } from '@/components/site-header'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | Dated',
  description: 'How Dated collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: April 23, 2026</p>
        </div>

        <div className="prose prose-sm max-w-none text-foreground space-y-6">

          <section className="space-y-2">
            <h2 className="text-xl font-bold">1. Who we are</h2>
            <p className="text-muted-foreground">Dated (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is a date review platform for couples, operated from Vancouver, BC, Canada. You can reach us at <a href="mailto:support@getdated.app" className="text-primary hover:underline">support@getdated.app</a>.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">2. What we collect</h2>
            <p className="text-muted-foreground">When you use Dated, we may collect:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Account information</strong> — email address, username, display name, and avatar when you sign up</li>
              <li><strong>Review content</strong> — venues, ratings, written reviews, photos, and tags you submit</li>
              <li><strong>Couple data</strong> — if you link a partner account, we store that relationship</li>
              <li><strong>Usage data</strong> — pages visited, features used, and interactions within the app</li>
              <li><strong>Device information</strong> — browser type, operating system, and IP address</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">3. How we use your information</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>To provide and improve the Dated platform</li>
              <li>To send transactional emails (account confirmation, password reset, notifications)</li>
              <li>To send optional marketing emails if you have opted in</li>
              <li>To display relevant advertising through Google AdSense</li>
              <li>To generate anonymised analytics about how the platform is used</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">4. Third-party services</h2>
            <p className="text-muted-foreground">We use the following third-party services, each with their own privacy policies:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Supabase</strong> — database and authentication hosting</li>
              <li><strong>Google Places API</strong> — venue search and location data</li>
              <li><strong>Google AdSense</strong> — advertising. Google may use cookies to serve ads based on your browsing history.</li>
              <li><strong>Resend</strong> — transactional and marketing email delivery</li>
              <li><strong>Vercel</strong> — application hosting and infrastructure</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">5. Cookies</h2>
            <p className="text-muted-foreground">We use cookies to keep you signed in and to enable advertising via Google AdSense. You can control cookies through your browser settings. Disabling cookies may affect some features of the platform.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">6. Your rights</h2>
            <p className="text-muted-foreground">You may request access to, correction of, or deletion of your personal data at any time by emailing <a href="mailto:support@getdated.app" className="text-primary hover:underline">support@getdated.app</a>. You can delete your account directly from your profile settings.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">7. Data retention</h2>
            <p className="text-muted-foreground">We retain your data for as long as your account is active. If you delete your account, your personal data is removed within 30 days. Review content may be anonymised and retained for platform integrity purposes.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">8. Children</h2>
            <p className="text-muted-foreground">Dated is not directed at children under 13. We do not knowingly collect personal information from children under 13.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">9. Changes to this policy</h2>
            <p className="text-muted-foreground">We may update this policy from time to time. We will notify registered users of material changes by email. Continued use of Dated after changes constitutes acceptance.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">10. Contact</h2>
            <p className="text-muted-foreground">Questions about this policy? Email us at <a href="mailto:support@getdated.app" className="text-primary hover:underline">support@getdated.app</a>.</p>
          </section>
        </div>

        <div className="pt-4 border-t border-border flex gap-4 text-sm">
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          <Link href="/" className="text-muted-foreground hover:text-foreground">← Back to Dated</Link>
        </div>
      </main>
    </div>
  )
}
