import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useThemeColors } from '@/hooks/useThemeColors'

type ReviewItem = {
  id: string
  slug: string
  title: string
  visited_on: string | null
  rating_overall: number | null
  is_public: boolean
  places: { name: string; city: string | null } | null
}

export default function MyDatesScreen() {
  const Colors = useThemeColors()
  const styles = makeStyles(Colors)
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchMyReviews() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('reviews')
      .select(`id, slug, title, visited_on, rating_overall, is_public, places ( name, city )`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setReviews((data ?? []) as unknown as ReviewItem[])
  }

  useFocusEffect(
    useCallback(() => {
      fetchMyReviews().finally(() => setLoading(false))
    }, [])
  )

  async function onRefresh() {
    setRefreshing(true)
    await fetchMyReviews()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Dates</Text>
        <TouchableOpacity
          style={styles.writeBtn}
          onPress={() => router.push('/(tabs)/write')}
        >
          <Text style={styles.writeBtnText}>+ Write</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
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
            <View style={styles.titleRow}>
              <Text style={[styles.title, { flex: 1 }]}>{item.title}</Text>
              <TouchableOpacity
                onPress={() => router.push(`/edit-review/${item.id}`)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="pencil-outline" size={16} color="#9e8fb0" />
              </TouchableOpacity>
            </View>
            <View style={styles.meta}>
              {item.visited_on && (
                <Text style={styles.date}>
                  {new Date(item.visited_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              )}
              <View style={styles.metaRight}>
                {!item.is_public && (
                  <View style={styles.privateBadge}>
                    <Text style={styles.privateBadgeText}>Private</Text>
                  </View>
                )}
                {item.rating_overall !== null && (
                  <Text style={styles.rating}>★ {item.rating_overall.toFixed(1)}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptySub}>Start documenting your dates!</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/write')}>
              <Text style={styles.emptyBtnText}>Write your first review</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  )
}

function makeStyles(Colors: any) { return StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: {
    paddingTop: 60, paddingBottom: 12, paddingHorizontal: 20,
    backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.foreground },
  writeBtn: {
    backgroundColor: Colors.primary, borderRadius: 100,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  writeBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  venue: { fontSize: 12, color: Colors.muted, fontWeight: '600', marginBottom: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 17, fontWeight: '800', color: Colors.foreground },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { fontSize: 12, color: Colors.muted },
  rating: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
  privateBadge: {
    backgroundColor: Colors.border, borderRadius: 100,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  privateBadgeText: { fontSize: 11, color: Colors.mutedFg, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.foreground, marginBottom: 8 },
  emptySub: { fontSize: 15, color: Colors.muted, marginBottom: 24, textAlign: 'center' },
  emptyBtn: {
    backgroundColor: Colors.primary, borderRadius: 100,
    paddingHorizontal: 24, paddingVertical: 14,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
}) }
