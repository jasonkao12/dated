import { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView, TextInput, Image,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useThemeColors } from '@/hooks/useThemeColors'

type Profile = {
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
}

type ReviewItem = {
  id: string
  slug: string
  title: string
  rating_overall: number | null
  visited_on: string | null
  places: { name: string; city: string | null } | null
}

type BookmarkItem = {
  id: string
  review_id: string | null
  place_id: string | null
  reviews: { title: string; slug: string } | null
  places: { name: string; city: string | null } | null
}

type FavouriteItem = {
  id: string
  review_id: string | null
  place_id: string | null
  reviews: { title: string; slug: string } | null
  places: { name: string; city: string | null } | null
}

type PlaceItem = {
  id: string
  name: string
  city: string | null
}

export default function ProfileScreen() {
  const Colors = useThemeColors()
  const styles = makeStyles(Colors)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [places, setPlaces] = useState<PlaceItem[]>([])
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [favourites, setFavourites] = useState<FavouriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  async function fetchAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, reviewsRes, bookmarksRes, favouritesRes] = await Promise.all([
      supabase.from('profiles').select('username, display_name, bio, avatar_url').eq('id', user.id).single(),
      supabase.from('reviews')
        .select('id, slug, title, rating_overall, visited_on, places(name, city)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('bookmarks')
        .select('id, review_id, place_id, reviews(title, slug), places(name, city)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('favourites')
        .select('id, review_id, place_id, reviews(title, slug), places(name, city)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    if (profileRes.data) {
      setProfile(profileRes.data)
      setDisplayName(profileRes.data.display_name ?? '')
      setBio(profileRes.data.bio ?? '')
    }

    const reviewData = (reviewsRes.data ?? []) as unknown as ReviewItem[]
    setReviews(reviewData)
    setBookmarks((bookmarksRes.data ?? []) as unknown as BookmarkItem[])
    setFavourites((favouritesRes.data ?? []) as unknown as FavouriteItem[])

    const seen = new Set<string>()
    const uniquePlaces: PlaceItem[] = []
    for (const r of reviewData) {
      if (r.places && !seen.has(r.places.name)) {
        seen.add(r.places.name)
        uniquePlaces.push({ id: r.id, name: r.places.name, city: r.places.city })
      }
    }
    setPlaces(uniquePlaces)
  }

  useFocusEffect(
    useCallback(() => {
      fetchAll().finally(() => setLoading(false))
    }, [])
  )

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName || null, bio: bio || null })
      .eq('id', user.id)
    setSaving(false)
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      await fetchAll()
      setEditing(false)
    }
  }

  async function handlePickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow access to your photo library in Settings.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (result.canceled) return

    setUploadingPhoto(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploadingPhoto(false); return }

    const uri = result.assets[0].uri
    const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `${user.id}/avatar.${ext}`

    const response = await fetch(uri)
    const blob = await response.blob()

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, blob, { contentType: `image/${ext}`, upsert: true })

    if (uploadError) {
      Alert.alert('Upload failed', uploadError.message)
      setUploadingPhoto(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    // Bust cache by appending timestamp
    const bustUrl = `${publicUrl}?t=${Date.now()}`
    await supabase.from('profiles').update({ avatar_url: bustUrl }).eq('id', user.id)
    await fetchAll()
    setUploadingPhoto(false)
  }

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ])
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    )
  }

  const initials = (profile?.display_name ?? profile?.username ?? '?').charAt(0).toUpperCase()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={handlePickPhoto} disabled={uploadingPhoto} activeOpacity={0.8}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{initials}</Text>
            </View>
          )}
          <View style={styles.cameraBadge}>
            {uploadingPhoto
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="camera" size={14} color="#fff" />
            }
          </View>
        </TouchableOpacity>
        <Text style={styles.username}>@{profile?.username}</Text>
        {profile?.display_name && <Text style={styles.displayName}>{profile.display_name}</Text>}
        {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}
      </View>

      {/* Edit form or button */}
      {editing ? (
        <View style={styles.form}>
          <Text style={styles.label}>Display name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor={Colors.muted}
          />
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="A little about you"
            placeholderTextColor={Colors.muted}
            multiline
          />
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => setEditing(false)}>
              <Text style={styles.btnOutlineText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
          <Text style={styles.editBtnText}>Edit profile</Text>
        </TouchableOpacity>
      )}

      {/* My Dates */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>My Dates</Text>
          {reviews.length > 3 && (
            <TouchableOpacity onPress={() => router.push('/(tabs)/dates')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>
        {reviews.length === 0 ? (
          <Text style={styles.emptyText}>No reviews yet</Text>
        ) : (
          reviews.slice(0, 3).map(r => (
            <TouchableOpacity
              key={r.id}
              style={styles.reviewCard}
              onPress={() => router.push(`/review/${r.slug}`)}
              activeOpacity={0.7}
            >
              {r.places && (
                <Text style={styles.reviewVenue} numberOfLines={1}>
                  {r.places.name}{r.places.city ? ` · ${r.places.city}` : ''}
                </Text>
              )}
              <View style={styles.reviewRow}>
                <Text style={styles.reviewTitle} numberOfLines={1}>{r.title}</Text>
                {r.rating_overall !== null && (
                  <Text style={styles.reviewRating}>★ {r.rating_overall.toFixed(1)}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* My Places */}
      {places.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Places</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            <View style={styles.chipsRow}>
              {places.map((p, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipName}>{p.name}</Text>
                  {p.city && <Text style={styles.chipCity}>{p.city}</Text>}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Saved for Later */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved for Later</Text>
        {bookmarks.length === 0 ? (
          <Text style={styles.emptyText}>Nothing saved yet</Text>
        ) : (
          bookmarks.slice(0, 3).map(b => {
            const label = b.reviews?.title ?? b.places?.name ?? 'Saved item'
            const sub = b.places?.city ?? ''
            return (
              <TouchableOpacity
                key={b.id}
                style={[styles.reviewCard, { marginTop: 8 }]}
                onPress={() => b.reviews?.slug && router.push(`/review/${b.reviews.slug}`)}
                activeOpacity={0.7}
              >
                {sub ? <Text style={styles.reviewVenue}>{sub}</Text> : null}
                <Text style={styles.reviewTitle} numberOfLines={1}>{label}</Text>
              </TouchableOpacity>
            )
          })
        )}
      </View>

      {/* Favourites */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favourites</Text>
        {favourites.length === 0 ? (
          <Text style={styles.emptyText}>No favourites yet</Text>
        ) : (
          favourites.slice(0, 3).map(f => {
            const label = f.reviews?.title ?? f.places?.name ?? 'Favourite'
            const sub = f.places?.city ?? ''
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.reviewCard, { marginTop: 8 }]}
                onPress={() => f.reviews?.slug && router.push(`/review/${f.reviews.slug}`)}
                activeOpacity={0.7}
              >
                {sub ? <Text style={styles.reviewVenue}>{sub}</Text> : null}
                <Text style={styles.reviewTitle} numberOfLines={1}>{label}</Text>
              </TouchableOpacity>
            )
          })
        )}
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const AVATAR_SIZE = 88

function makeStyles(Colors: any) { return StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: {
    paddingTop: 60, paddingBottom: 12, paddingHorizontal: 20,
    backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.foreground },

  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  avatarPlaceholder: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 34, fontWeight: '800' },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.background,
  },
  username: { fontSize: 14, color: Colors.muted, fontWeight: '600', marginTop: 10, marginBottom: 3 },
  displayName: { fontSize: 20, fontWeight: '800', color: Colors.foreground, marginBottom: 5 },
  bio: { fontSize: 14, color: Colors.mutedFg, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },

  editBtn: {
    alignSelf: 'center',
    borderWidth: 1, borderColor: Colors.border, borderRadius: 100,
    paddingHorizontal: 20, paddingVertical: 9, marginTop: 4,
  },
  editBtnText: { color: Colors.foreground, fontWeight: '600', fontSize: 14 },

  form: { paddingHorizontal: 24, gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.foreground, marginTop: 8 },
  input: {
    backgroundColor: Colors.card, borderRadius: 12, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Colors.foreground,
  },
  bioInput: { height: 90, textAlignVertical: 'top' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  btn: { flex: 1, borderRadius: 100, paddingVertical: 13, alignItems: 'center' },
  btnPrimary: { backgroundColor: Colors.primary },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnOutline: { borderWidth: 1, borderColor: Colors.border },
  btnOutlineText: { color: Colors.foreground, fontWeight: '600', fontSize: 15 },

  section: { paddingHorizontal: 20, paddingTop: 28 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 1 },
  seeAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  emptyText: { fontSize: 14, color: Colors.muted, marginTop: 8 },

  reviewCard: {
    backgroundColor: Colors.card, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 8,
  },
  reviewVenue: { fontSize: 11, color: Colors.muted, fontWeight: '600', marginBottom: 4 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewTitle: { fontSize: 15, fontWeight: '700', color: Colors.foreground, flex: 1, marginRight: 8 },
  reviewRating: { fontSize: 13, color: Colors.primary, fontWeight: '700' },

  chipsRow: { flexDirection: 'row', gap: 8, paddingRight: 20 },
  chip: {
    backgroundColor: Colors.card, borderRadius: 100, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 8,
  },
  chipName: { fontSize: 13, fontWeight: '600', color: Colors.foreground },
  chipCity: { fontSize: 11, color: Colors.muted, marginTop: 1 },

  signOutBtn: { marginTop: 40, alignItems: 'center' },
  signOutText: { color: Colors.destructive, fontWeight: '600', fontSize: 15 },
}) }
