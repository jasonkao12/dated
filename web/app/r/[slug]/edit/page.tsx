import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { EditReviewForm } from '@/components/edit-review-form'

type Props = { params: Promise<{ slug: string }> }

export default async function EditReviewPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: review } = await supabase
    .from('reviews')
    .select(`
      id, slug, title, body, visited_on, is_public,
      rating_overall, rating_ambiance, rating_food, rating_service, rating_value, rating_vibe,
      user_id,
      places ( name, city, place_type ),
      review_tags ( date_tags ( label ) )
    `)
    .eq('slug', slug)
    .single()

  if (!review) notFound()
  if (review.user_id !== user.id) redirect(`/r/${slug}`)

  const place = review.places as unknown as { name: string; city: string | null; place_type: string | null } | null
  const tags  = (review.review_tags as unknown as { date_tags: { label: string } }[]).map(rt => rt.date_tags.label)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="py-10 px-4">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Edit Review</h1>
            <p className="mt-1 text-muted-foreground">Update your date experience.</p>
          </div>
          <EditReviewForm
            reviewId={review.id}
            defaultValues={{
              title:          review.title,
              body:           review.body ?? '',
              visited_on:     review.visited_on ?? '',
              is_public:      review.is_public,
              venue_name:     place?.name ?? '',
              venue_city:     place?.city ?? '',
              venue_type:     place?.place_type ?? '',
              rating_overall:  review.rating_overall,
              rating_ambiance: review.rating_ambiance,
              rating_food:     review.rating_food,
              rating_service:  review.rating_service,
              rating_value:    review.rating_value,
              rating_vibe:     review.rating_vibe,
              tags,
            }}
          />
        </div>
      </main>
    </div>
  )
}
