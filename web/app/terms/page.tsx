import { SiteHeader } from '@/components/site-header'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service | Dated',
  description: 'Terms and conditions for using the Dated platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: April 23, 2026</p>
        </div>

        <div className="prose prose-sm max-w-none text-foreground space-y-6">

          <section className="space-y-2">
            <h2 className="text-xl font-bold">1. Acceptance</h2>
            <p className="text-muted-foreground">By creating an account or using Dated (&ldquo;the Service&rdquo;), you agree to these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">2. The Service</h2>
            <p className="text-muted-foreground">Dated is a date review platform that lets couples post, rate, and share date experiences. We reserve the right to modify, suspend, or discontinue any part of the Service at any time.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">3. Your account</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>You must be at least 13 years old to create an account</li>
              <li>You are responsible for keeping your login credentials secure</li>
              <li>You may not create accounts for others without their consent</li>
              <li>One person, one account — duplicate accounts may be removed</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">4. Your content</h2>
            <p className="text-muted-foreground">You own the content you post on Dated. By posting, you grant us a non-exclusive, worldwide, royalty-free licence to display, distribute, and promote that content within the Service.</p>
            <p className="text-muted-foreground">You agree not to post content that:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Is false, defamatory, or misleading</li>
              <li>Infringes any third-party intellectual property rights</li>
              <li>Contains personal information about others without their consent</li>
              <li>Is obscene, harassing, or otherwise objectionable</li>
              <li>Violates any applicable law</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">5. Acceptable use</h2>
            <p className="text-muted-foreground">You agree not to:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Scrape, crawl, or extract data from the Service without permission</li>
              <li>Attempt to access other users&apos; accounts or data</li>
              <li>Use the Service to distribute spam or unsolicited messages</li>
              <li>Interfere with the operation or security of the Service</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">6. Advertising</h2>
            <p className="text-muted-foreground">Dated may display ads through Google AdSense and direct partnerships. Ads are clearly labelled. We are not responsible for the content of third-party advertisements.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">7. Termination</h2>
            <p className="text-muted-foreground">You may delete your account at any time from your settings. We may suspend or terminate accounts that violate these Terms, with or without notice.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">8. Disclaimer of warranties</h2>
            <p className="text-muted-foreground">The Service is provided &ldquo;as is&rdquo; without warranty of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or that venue information will be accurate or up to date.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">9. Limitation of liability</h2>
            <p className="text-muted-foreground">To the maximum extent permitted by law, Dated shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">10. Governing law</h2>
            <p className="text-muted-foreground">These Terms are governed by the laws of British Columbia, Canada. Any disputes shall be resolved in the courts of Vancouver, BC.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">11. Contact</h2>
            <p className="text-muted-foreground">Questions? Email us at <a href="mailto:support@getdated.app" className="text-primary hover:underline">support@getdated.app</a>.</p>
          </section>

        </div>

        <div className="pt-4 border-t border-border flex gap-4 text-sm">
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          <Link href="/" className="text-muted-foreground hover:text-foreground">← Back to Dated</Link>
        </div>
      </main>
    </div>
  )
}
