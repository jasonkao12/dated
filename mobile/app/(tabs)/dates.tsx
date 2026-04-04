import { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useThemeColors } from '@/hooks/useThemeColors'

type DateItem = {
  id: string
  slug: string
  title: string
  body: string | null
  visited_on: string | null
  rating_overall: number | null
  is_public: boolean
  profiles: { username: string; display_name: string | null }
  places: { name: string; city: string | null } | null
}

export default function DatesScreen() {
  const Colors = useThemeColors()
  const styles = makeStyles(Colors)
  const [dates, setDates] = useState<DateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchDates() {
    const { data } = await supabase
      .from('reviews')
      .select(`
        id, slug, title, body, visited_on, rating_overall, is_public,
        profiles ( username, display_name ),
        places ( name, city )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50)

    setDates((data ?? []) as unknown as DateItem[])
  }

  useFocusEffect(
    useCallback(() => {
      fetchDates().finally(() => setLoading(false))
    }, [])
  )

  async function onRefresh() {
    setRefreshing(true)
    await fetchDates()
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
        <Text style={styles.headerTitle}>Dates</Text>
        <TouchableOpacity
          style={styles.myBtn}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="person-outline" size={14} color={Colors.primary} />
          <Text style={styles.myBtnText}>My Dates</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dates}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
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
              <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
            )}
            <View style={styles.meta}>
              <Text style={styles.author}>
                {item.profiles.display_name ?? item.profiles.username}
              </Text>
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
            <Text style={styles.emptyTitle}>No dates yet</Text>
            <Text style={styles.emptySub}>Be the first to log a date!</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/write')}>
              <Text style={styles.emptyBtnText}>Write a review</Text>
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
  myBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: Colors.primary, borderRadius: 100,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  myBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  venue: { fontSize: 12, color: Colors.muted, fontWeight: '600', marginBottom: 4 },
  title: { fontSize: 17, fontWeight: '800', color: Colors.foreground, marginBottom: 6 },
  body: { fontSize: 14, color: Colors.mutedFg, lineHeight: 20, marginBottom: 8 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  author: { fontSize: 13, color: Colors.muted, fontWeight: '600' },
  rating: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
  privateBadge: { backgroundColor: Colors.border, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 },
  privateBadgeText: { fontSize: 11, color: Colors.mutedFg, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.foreground, marginBottom: 8 },
  emptySub: { fontSize: 15, color: Colors.muted, marginBottom: 24, textAlign: 'center' },
  emptyBtn: { backgroundColor: Colors.primary, borderRadius: 100, paddingHorizontal: 24, paddingVertical: 14 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
}) }
