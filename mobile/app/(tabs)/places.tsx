import { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, TextInput,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useThemeColors } from '@/hooks/useThemeColors'

// Set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY in your .env to enable live search
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? ''

type PlaceItem = {
  id: string
  name: string
  city: string | null
  place_type: string | null
  price_level: number | null
  reviewCount: number
  avgRating: number | null
}

const PRICE = ['', '$', '$$', '$$$', '$$$$']

export default function PlacesScreen() {
  const Colors = useThemeColors()
  const styles = makeStyles(Colors)
  const [places, setPlaces] = useState<PlaceItem[]>([])
  const [filtered, setFiltered] = useState<PlaceItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchPlaces() {
    const { data } = await supabase
      .from('places')
      .select(`
        id, name, city, place_type, price_level,
        reviews ( rating_overall, is_public )
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (!data) return

    const items: PlaceItem[] = data.map((p: any) => {
      const publicReviews = (p.reviews ?? []).filter((r: any) => r.is_public)
      const ratings = publicReviews.map((r: any) => r.rating_overall).filter((v: any) => v !== null)
      return {
        id: p.id,
        name: p.name,
        city: p.city,
        place_type: p.place_type,
        price_level: p.price_level,
        reviewCount: publicReviews.length,
        avgRating: ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : null,
      }
    }).filter(p => p.reviewCount > 0)

    setPlaces(items)
    setFiltered(items)
  }

  useFocusEffect(
    useCallback(() => {
      fetchPlaces().finally(() => setLoading(false))
    }, [])
  )

  async function onRefresh() {
    setRefreshing(true)
    await fetchPlaces()
    setRefreshing(false)
  }

  function handleSearch(text: string) {
    setSearch(text)
    if (!text.trim()) {
      setFiltered(places)
      return
    }
    const q = text.toLowerCase()
    setFiltered(places.filter(p =>
      p.name.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q)
    ))
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
        <Text style={styles.headerTitle}>Places</Text>
        <TouchableOpacity
          style={styles.myBtn}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="person-outline" size={14} color={Colors.primary} />
          <Text style={styles.myBtnText}>My Places</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={Colors.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={GOOGLE_API_KEY ? 'Search places…' : 'Search visited places…'}
          placeholderTextColor={Colors.muted}
          value={search}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={16} color={Colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {!GOOGLE_API_KEY && (
        <View style={styles.apiNotice}>
          <Text style={styles.apiNoticeText}>
            Add EXPO_PUBLIC_GOOGLE_PLACES_API_KEY to enable live place search
          </Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.75}>
            <View style={styles.cardTop}>
              <View style={styles.cardLeft}>
                <Text style={styles.placeName}>{item.name}</Text>
                {item.city && <Text style={styles.placeCity}>{item.city}</Text>}
                <View style={styles.chips}>
                  {item.place_type && (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{item.place_type}</Text>
                    </View>
                  )}
                  {item.price_level && (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{PRICE[item.price_level]}</Text>
                    </View>
                  )}
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>
                      {item.reviewCount} {item.reviewCount === 1 ? 'review' : 'reviews'}
                    </Text>
                  </View>
                </View>
              </View>
              {item.avgRating !== null && (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingBadgeText}>{item.avgRating.toFixed(1)}</Text>
                  <Text style={styles.ratingBadgeStar}>★</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No places yet</Text>
            <Text style={styles.emptySub}>
              {search ? 'No places match your search.' : 'Review a date spot to add it here.'}
            </Text>
            {!search && (
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/write')}>
                <Text style={styles.emptyBtnText}>Review a place</Text>
              </TouchableOpacity>
            )}
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
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
  },
  searchIcon: {},
  searchInput: { flex: 1, fontSize: 15, color: Colors.foreground },
  apiNotice: {
    backgroundColor: Colors.border, paddingHorizontal: 16, paddingVertical: 6,
  },
  apiNoticeText: { fontSize: 11, color: Colors.mutedFg, textAlign: 'center' },
  list: { padding: 16, gap: 10 },
  card: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLeft: { flex: 1, marginRight: 12 },
  placeName: { fontSize: 16, fontWeight: '800', color: Colors.foreground, marginBottom: 2 },
  placeCity: { fontSize: 13, color: Colors.muted, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: Colors.background, borderRadius: 100,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  chipText: { fontSize: 11, color: Colors.mutedFg, fontWeight: '600', textTransform: 'capitalize' },
  ratingBadge: {
    backgroundColor: Colors.primary + '15', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
    flexDirection: 'row', alignItems: 'baseline', gap: 2,
  },
  ratingBadgeText: { fontSize: 16, fontWeight: '900', color: Colors.primary },
  ratingBadgeStar: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.foreground, marginBottom: 8 },
  emptySub: { fontSize: 15, color: Colors.muted, marginBottom: 24, textAlign: 'center' },
  emptyBtn: { backgroundColor: Colors.primary, borderRadius: 100, paddingHorizontal: 24, paddingVertical: 14 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
}) }
