import { SiteHeader } from '@/components/site-header'
import { IdeasContent } from '@/components/ideas-content'

export default function IdeasPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <IdeasContent />
    </div>
  )
}
