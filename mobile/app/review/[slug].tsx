import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Share,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useThemeColors } from '@/hooks/useThemeColors'

const RATING_LABELS = [
  { key: 'rating_ambiance', label: 'Ambiance'  },
  { key: 'rating_food',     label: 'Food'      },
  { key: 'rating_service',  label: 'Service'   },
  { key: 'rating_value',    label: 'Value'     },
  { key: 'rating_vibe',     label: 'Date Vibe' },
]

const REACTIONS = [
  { key: 'heart',      emoji: '❤️',  label: 'Love' },
  { key: 'fire',       emoji: '🔥',  label: 'Fire' },
  { key: 'want_to_go', emoji: '📍',  label: 'Want to go' },
  { key: 'been_here',  emoji: '✅',  label: 'Been here' },
]

type ReviewDetail = {
  id: string
  slug: string
  title: string
  body: string | null
  visited_on: string | null
  is_public: boolean
  rating_overall: number | null
  rating_ambiance: number | null
  rating_food: number | null
  rating_service: number | null
  rating_value: number | null
  rating_vibe: number | null
  profiles: { id: string; username: string; display_name: string | null }
  places: { name: string; city: string | null; place_type: string | null } | null
}

type ReactionCounts = Record<string, number>
type UserReactions = Record<string, boolean>

export default function ReviewScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const Colors = useThemeColors()
  const styles = makeStyles(Colors)

  const [review, setReview] = useState<ReviewDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>({})
  const [userReactions, setUserReactions] = useState<UserReactions>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [{ data: { user } }, { data }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from('reviews')
          .select(`
            id, slug, title, body, visited_on, is_public,
            rating_overall, rating_ambiance, rating_food, rating_service, rating_value, rating_vibe,
            profiles ( id, username, display_name ),
            places ( name, city, place_type )
          `)
          .eq('slug', slug)
          .single(),
      ])

      setCurrentUserId(user?.id ?? null)

      if (!data) { setLoading(false); return }
      setReview(data as unknown as ReviewDetail)

      // Fetch reactions
      const { data: reactions } = await supabase
        .from('reactions')
        .select('reaction_type, user_id')
        .eq('review_id', data.id)

      const counts: ReactionCounts = {}
      const mine: UserReactions = {}
      reactions?.forEach(r => {
        counts[r.reaction_type] = (counts[r.reaction_type] ?? 0) + 1
        if (r.user_id === user?.id) mine[r.reaction_type] = true
      })
      setReactionCounts(counts)
      setUserReactions(mine)

      setLoading(false)
    }
    load()
  }, [slug])

  async function toggleReaction(type: string) {
    if (!currentUserId || !review) return
    const isActive = userReactions[type]

    setUserReactions(prev => ({ ...prev, [type]: !isActive }))
    setReactionCounts(prev => ({
      ...prev,
      [type]: (prev[type] ?? 0) + (isActive ? -1 : 1),
    }))

    if (isActive) {
      await supabase.from('reactions')
        .delete()
        .eq('review_id', review.id)
        .eq('user_id', currentUserId)
        .eq('reaction_type', type)
    } else {
      await supabase.from('reactions').upsert({
        review_id: review.id,
        user_id: currentUserId,
        reaction_type: type,
      })
    }
  }

  async function handleShare() {
    if (!review) return
    await Share.share({
      message: `Check out "${review.title}" on Dated — https://getdated.app/r/${review.slug}`,
      url: `https://getdated.app/r/${review.slug}`,
    })
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    )
  }

  if (!review) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Review not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnCenter}>
          <Text style={styles.backBtnCenterText}>Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const reviewer = review.profiles
  const venue = review.places
  const visitedDate = review.visited_on
    ? new Date(review.visited_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null
  const hasSubRatings = RATING_LABELS.some(({ key }) => (review as any)[key] !== null)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Ionicons name="share-outline" size={20} color={Colors.foreground} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* Venue */}
        {venue && (
          <Text style={styles.venue}>
            {venue.name}{venue.city ? ` · ${venue.city}` : ''}
            {venue.place_type ? ` · ${venue.place_type}` : ''}
          </Text>
        )}

        {/* Title */}
        <Text style={styles.title}>{review.title}</Text>

        {/* Reviewer row */}
        <View style={styles.reviewerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(reviewer.display_name ?? reviewer.username).charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.reviewerName}>
              {reviewer.display_name ?? reviewer.username}
            </Text>
            {visitedDate && (
              <Text style={styles.visitedDate}>Visited {visitedDate}</Text>
            )}
          </View>
        </View>

        {/* Overall rating */}
        {review.rating_overall !== null && (
          <View style={styles.overallCard}>
            <Text style={styles.overallScore}>{review.rating_overall.toFixed(1)}</Text>
            <View>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(n => (
                  <Text key={n} style={[styles.star, n <= review.rating_overall! && styles.starFilled]}>★</Text>
                ))}
              </View>
              <Text style={styles.overallLabel}>Overall rating</Text>
            </View>
          </View>
        )}

        {/* Body */}
        {review.body && (
          <View style={styles.bodyCard}>
            <Text style={styles.bodyText}>{review.body}</Text>
          </View>
        )}

        {/* Sub-ratings */}
        {hasSubRatings && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>BREAKDOWN</Text>
            {RATING_LABELS.map(({ key, label }) => {
              const val = (review as any)[key] as number | null
              if (val === null) return null
              return (
                <View key={key} style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>{label}</Text>
                  <View style={styles.ratingBar}>
                    <View style={[styles.ratingFill, { width: `${(val / 5) * 100}%` as any }]} />
                  </View>
                  <Text style={styles.ratingVal}>{val}</Text>
                </View>
              )
            })}
          </View>
        )}

        {/* Reactions */}
        <View style={styles.reactionsWrap}>
          <Text style={styles.sectionLabel}>REACT</Text>
          <View style={styles.reactionsRow}>
            {REACTIONS.map(({ key, emoji, label }) => (
              <TouchableOpacity
                key={key}
                style={[styles.reactionBtn, userReactions[key] && styles.reactionBtnActive]}
                onPress={() => toggleReaction(key)}
                activeOpacity={0.7}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
                {(reactionCounts[key] ?? 0) > 0 && (
                  <Text style={[styles.reactionCount, userReactions[key] && styles.reactionCountActive]}>
                    {reactionCounts[key]}
                  </Text>
                )}
                <Text style={[styles.reactionLabel, userReactions[key] && styles.reactionCountActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Owner actions */}
        {currentUserId && currentUserId === reviewer.id && (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/edit-review/${review.id}`)}
          >
            <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
            <Text style={styles.editBtnText}>Edit review</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}

function makeStyles(Colors: any) { return StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, padding: 24 },
  notFound: { fontSize: 17, color: Colors.muted, marginBottom: 16 },
  backBtnCenter: { paddingHorizontal: 20, paddingVertical: 10 },
  backBtnCenterText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },

  header: {
    paddingTop: 60, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  backBtn: { padding: 4 },
  shareBtn: { padding: 4 },

  body: { padding: 20, gap: 16 },

  venue: { fontSize: 13, color: Colors.muted, fontWeight: '600', textTransform: 'capitalize' },
  title: { fontSize: 26, fontWeight: '900', color: Colors.foreground, lineHeight: 32 },

  reviewerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  reviewerName: { fontSize: 14, fontWeight: '700', color: Colors.foreground },
  visitedDate: { fontSize: 12, color: Colors.muted, marginTop: 1 },

  overallCard: {
    backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1,
    borderColor: Colors.border, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  overallScore: { fontSize: 48, fontWeight: '900', color: Colors.primary, lineHeight: 52 },
  starsRow: { flexDirection: 'row', gap: 2, marginBottom: 4 },
  star: { fontSize: 20, color: Colors.border },
  starFilled: { color: Colors.primary },
  overallLabel: { fontSize: 12, color: Colors.muted },

  bodyCard: {
    backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1,
    borderColor: Colors.border, padding: 16,
  },
  bodyText: { fontSize: 15, color: Colors.foreground, lineHeight: 24 },

  card: {
    backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1,
    borderColor: Colors.border, padding: 16,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.muted,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  ratingLabel: { width: 72, fontSize: 13, color: Colors.muted },
  ratingBar: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: Colors.border, overflow: 'hidden',
  },
  ratingFill: { height: '100%', borderRadius: 3, backgroundColor: Colors.primary },
  ratingVal: { width: 16, fontSize: 13, fontWeight: '700', color: Colors.foreground, textAlign: 'right' },

  reactionsWrap: { gap: 12 },
  reactionsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  reactionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.card, borderRadius: 100,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  reactionBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '18' },
  reactionEmoji: { fontSize: 16 },
  reactionCount: { fontSize: 13, fontWeight: '700', color: Colors.foreground },
  reactionCountActive: { color: Colors.primary },
  reactionLabel: { fontSize: 12, fontWeight: '600', color: Colors.muted },

  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 100,
    paddingVertical: 12, marginTop: 8,
  },
  editBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
}) }
