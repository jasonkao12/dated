import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useThemeColors } from '@/hooks/useThemeColors'

type ReviewItem = {
  id: string
  slug: string
  title: string
  body: string | null
  visited_on: string | null
  rating_overall: number | null
  profiles: { username: string; display_name: string | null }
  places: { name: string; city: string | null } | null
}

type Category = { id: string; name: string; emoji: string }

function CategorySection({
  categories,
  selectedId,
  onSelect,
}: {
  categories: Category[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const Colors = useThemeColors()
  const catStyles = makeCatStyles(Colors)
  return (
    <View>
      {/* Featured: Choose a date for me */}
      <View style={catStyles.featuredWrap}>
        <TouchableOpacity style={catStyles.featured} activeOpacity={0.85}
          onPress={() => router.push('/date-builder' as never)}>
          <Text style={catStyles.featuredEmoji}>🎲</Text>
          <View style={catStyles.featuredText}>
            <Text style={catStyles.featuredTitle}>Choose a date for me</Text>
            <Text style={catStyles.featuredSub}>Let us pick something perfect nearby</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      {/* Category chips */}
      <Text style={catStyles.sectionLabel}>EXPLORE</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={catStyles.chipScroll}
      >
        {/* All chip */}
        <TouchableOpacity
          key="all"
          style={[catStyles.chip, selectedId === null && catStyles.chipSelected]}
          activeOpacity={0.75}
          onPress={() => onSelect(null)}
        >
          <Text style={catStyles.chipEmoji}>✨</Text>
          <Text style={[catStyles.chipLabel, selectedId === null && catStyles.chipLabelSelected]}>All</Text>
        </TouchableOpacity>

        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[catStyles.chip, selectedId === cat.id && catStyles.chipSelected]}
            activeOpacity={0.75}
            onPress={() => onSelect(selectedId === cat.id ? null : cat.id)}
          >
            <Text style={catStyles.chipEmoji}>{cat.emoji}</Text>
            <Text style={[catStyles.chipLabel, selectedId === cat.id && catStyles.chipLabelSelected]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={catStyles.sectionLabel}>RECENT REVIEWS</Text>
    </View>
  )
}

function makeCatStyles(Colors: any) { return StyleSheet.create({
  featuredWrap: { paddingHorizontal: 16, paddingTop: 16 },
  featured: {
    backgroundColor: Colors.primary, borderRadius: 18,
    padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  featuredEmoji: { fontSize: 32 },
  featuredText: { flex: 1 },
  featuredTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 3 },
  featuredSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.muted,
    letterSpacing: 1, textTransform: 'uppercase',
    paddingHorizontal: 16, marginTop: 24, marginBottom: 10,
  },
  chipScroll: { paddingHorizontal: 16, gap: 8 },
  chip: {
    backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 10,
    alignItems: 'center', gap: 6, minWidth: 90,
  },
  chipSelected: {
    backgroundColor: Colors.primary + '18',
    borderColor: Colors.primary,
  },
  chipEmoji: { fontSize: 22 },
  chipLabel: { fontSize: 12, fontWeight: '600', color: Colors.foreground, textAlign: 'center' },
  chipLabelSelected: { color: Colors.primary },
}) }

export default function FeedScreen() {
  const Colors = useThemeColors()
  const styles = makeStyles(Colors)
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    supabase.from('categories').select('id, name, emoji').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  async function fetchReviews(categoryId: string | null = null) {
    let query = supabase
      .from('reviews')
      .select(`
        id, slug, title, body, visited_on, rating_overall,
        profiles ( username, display_name ),
        places ( name, city )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(30)

    if (categoryId) {
      // Fetch review IDs that belong to this category
      const { data: catLinks } = await supabase
        .from('review_categories')
        .select('review_id')
        .eq('category_id', categoryId)

      const ids = (catLinks ?? []).map((r: { review_id: string }) => r.review_id)
      if (ids.length === 0) {
        setReviews([])
        return
      }
      query = query.in('id', ids)
    }

    const { data } = await query
    setReviews((data ?? []) as unknown as ReviewItem[])
  }

  useEffect(() => {
    fetchReviews(null).finally(() => setLoading(false))
  }, [])

  async function handleSelectCategory(id: string | null) {
    setSelectedCategoryId(id)
    setLoading(true)
    await fetchReviews(id)
    setLoading(false)
  }

  async function onRefresh() {
    setRefreshing(true)
    await fetchReviews(selectedCategoryId)
    setRefreshing(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>dated</Text>
      </View>
      <FlatList
        data={reviews}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <CategorySection
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={handleSelectCategory}
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/review/${item.slug}`)}
            activeOpacity={0.7}
          >
            {item.places && (
              <Text style={styles.venue}>
                {item.places.name}{item.places.city ? ` · ${item.places.city}` : ''}
              </Text>
            )}
            <Text style={styles.title}>{item.title}</Text>
            {item.body && (
              <Text style={styles.body} numberOfLines={3}>{item.body}</Text>
            )}
            <View style={styles.meta}>
              <Text style={styles.author}>
                {item.profiles.display_name ?? item.profiles.username}
              </Text>
              {item.rating_overall !== null && (
                <Text style={styles.rating}>★ {item.rating_overall.toFixed(1)}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading
            ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
            : <Text style={styles.empty}>
                {selectedCategoryId ? 'No reviews in this category yet.' : 'No reviews yet. Be the first!'}
              </Text>
        }
      />
    </View>
  )
}

function makeStyles(Colors: any) { return StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 60, paddingBottom: 12, paddingHorizontal: 20,
    backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  logo: { fontSize: 24, fontWeight: '900', color: Colors.primary, letterSpacing: -0.5 },
  list: { paddingBottom: 24, gap: 0 },
  card: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border, marginHorizontal: 16, marginTop: 12,
  },
  venue: { fontSize: 12, color: Colors.muted, fontWeight: '600', marginBottom: 4 },
  title: { fontSize: 17, fontWeight: '800', color: Colors.foreground, marginBottom: 6 },
  body: { fontSize: 14, color: Colors.mutedFg, lineHeight: 20, marginBottom: 10 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  author: { fontSize: 13, color: Colors.muted, fontWeight: '600' },
  rating: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
  empty: { textAlign: 'center', color: Colors.muted, marginTop: 40, fontSize: 15, paddingHorizontal: 16 },
}) }
