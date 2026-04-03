import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Switch, Image,
} from 'react-native'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { Colors } from '@/constants/Colors'

const RATINGS = [
  { key: 'rating_overall', label: 'Overall', category: 'overall', required: true },
  { key: 'rating_ambiance', label: 'Ambiance', category: 'ambiance' },
  { key: 'rating_food', label: 'Food', category: 'food' },
  { key: 'rating_service', label: 'Service', category: 'service' },
  { key: 'rating_value', label: 'Value', category: 'value' },
  { key: 'rating_vibe', label: 'Date Vibe', category: 'vibe' },
]

type RatingWithPhotosProps = {
  label: string
  required?: boolean
  value: number | null
  onChange: (v: number | null) => void
  photos: string[]
  onAddPhotos: () => void
  onRemovePhoto: (index: number) => void
}

function RatingWithPhotos({ label, required, value, onChange, photos, onAddPhotos, onRemovePhoto }: RatingWithPhotosProps) {
  return (
    <View style={rStyles.wrap}>
      <Text style={rStyles.label}>
        {label}
        {!required && <Text style={rStyles.optional}> (optional)</Text>}
      </Text>
      <View style={rStyles.stars}>
        {[1, 2, 3, 4, 5].map(n => (
          <TouchableOpacity key={n} onPress={() => onChange(n === value ? null : n)}>
            <Text style={[rStyles.star, n <= (value ?? 0) && rStyles.starFilled]}>★</Text>
          </TouchableOpacity>
        ))}
        {value !== null && <Text style={rStyles.val}>{value}/5</Text>}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={rStyles.photosRow}>
        <TouchableOpacity style={rStyles.addPhotoBtn} onPress={onAddPhotos}>
          <Ionicons name="camera-outline" size={18} color={Colors.muted} />
          <Text style={rStyles.addPhotoText}>Add photo</Text>
        </TouchableOpacity>
        {photos.map((uri, i) => (
          <View key={i} style={rStyles.thumbWrap}>
            <Image source={{ uri }} style={rStyles.thumb} />
            <TouchableOpacity style={rStyles.removeBtn} onPress={() => onRemovePhoto(i)}>
              <Ionicons name="close-circle" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const rStyles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.foreground, marginBottom: 6 },
  optional: { fontSize: 12, fontWeight: '400', color: Colors.muted },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  star: { fontSize: 28, color: Colors.border },
  starFilled: { color: Colors.primary },
  val: { marginLeft: 8, fontSize: 13, color: Colors.muted },
  photosRow: { flexDirection: 'row' },
  addPhotoBtn: {
    width: 72, height: 72, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', gap: 4, marginRight: 8,
  },
  addPhotoText: { fontSize: 10, color: Colors.muted, fontWeight: '600' },
  thumbWrap: { position: 'relative', marginRight: 8 },
  thumb: { width: 72, height: 72, borderRadius: 10 },
  removeBtn: { position: 'absolute', top: -6, right: -6 },
})

export default function WriteScreen() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [venueName, setVenueName] = useState('')
  const [venueCity, setVenueCity] = useState('')
  const [visitedOn, setVisitedOn] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [ratings, setRatings] = useState<Record<string, number | null>>({
    rating_overall: null,
    rating_ambiance: null,
    rating_food: null,
    rating_service: null,
    rating_value: null,
    rating_vibe: null,
  })
  const [ratingPhotos, setRatingPhotos] = useState<Record<string, string[]>>({
    overall: [], ambiance: [], food: [], service: [], value: [], vibe: [],
  })
  const [loading, setLoading] = useState(false)

  function setRating(key: string, val: number | null) {
    setRatings(r => ({ ...r, [key]: val }))
  }

  async function handleAddPhotos(category: string) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow access to your photo library in Settings.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    })
    if (result.canceled) return
    const uris = result.assets.map(a => a.uri)
    setRatingPhotos(p => ({ ...p, [category]: [...p[category], ...uris] }))
  }

  function removePhoto(category: string, index: number) {
    setRatingPhotos(p => ({ ...p, [category]: p[category].filter((_, i) => i !== index) }))
  }

  async function uploadReviewPhotos(userId: string, reviewId: string) {
    const inserts: { review_id: string; storage_path: string; category: string; sort_order: number }[] = []

    for (const [category, uris] of Object.entries(ratingPhotos)) {
      if (uris.length === 0) continue
      for (let i = 0; i < uris.length; i++) {
        const uri = uris[i]
        const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg'
        const path = `${userId}/${reviewId}/${category}-${i}.${ext}`
        const response = await fetch(uri)
        const blob = await response.blob()
        const { error } = await supabase.storage
          .from('review-photos')
          .upload(path, blob, { contentType: `image/${ext}` })
        if (!error) {
          inserts.push({ review_id: reviewId, storage_path: path, category, sort_order: i })
        }
      }
    }

    if (inserts.length > 0) {
      await supabase.from('review_photos').insert(inserts)
    }
  }

  async function handleSubmit() {
    if (!title.trim()) {
      Alert.alert('Title required', 'Give your review a title.')
      return
    }
    if (ratings.rating_overall === null) {
      Alert.alert('Overall rating required', 'Please rate your overall experience.')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    let placeId: string | null = null
    if (venueName.trim()) {
      const { data: place } = await supabase
        .from('places')
        .upsert({ name: venueName.trim(), city: venueCity.trim() || null }, { onConflict: 'name,city' })
        .select('id')
        .single()
      placeId = place?.id ?? null
    }

    const slug = title.trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50) + '-' + Math.random().toString(36).slice(2, 6)

    const { data: review, error } = await supabase.from('reviews').insert({
      user_id: user.id,
      slug,
      title: title.trim(),
      body: body.trim() || null,
      place_id: placeId,
      visited_on: visitedOn || null,
      is_public: isPublic,
      ...ratings,
    }).select('id').single()

    if (error || !review) {
      setLoading(false)
      Alert.alert('Error', error?.message ?? 'Failed to post review.')
      return
    }

    await uploadReviewPhotos(user.id, review.id)

    setLoading(false)
    Alert.alert('Review posted!', '', [
      { text: 'OK', onPress: () => router.replace('/(tabs)/my-dates') },
    ])

    setTitle(''); setBody(''); setVenueName(''); setVenueCity(''); setVisitedOn('')
    setRatings({ rating_overall: null, rating_ambiance: null, rating_food: null, rating_service: null, rating_value: null, rating_vibe: null })
    setRatingPhotos({ overall: [], ambiance: [], food: [], service: [], value: [], vibe: [] })
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Write a Review</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.section}>About the date</Text>

        <TextInput
          style={styles.input}
          placeholder="Title *"
          placeholderTextColor={Colors.muted}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.bodyInput]}
          placeholder="Tell your story…"
          placeholderTextColor={Colors.muted}
          value={body}
          onChangeText={setBody}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Date visited (YYYY-MM-DD)"
          placeholderTextColor={Colors.muted}
          value={visitedOn}
          onChangeText={setVisitedOn}
        />

        <Text style={styles.section}>Venue</Text>
        <TextInput
          style={styles.input}
          placeholder="Venue name"
          placeholderTextColor={Colors.muted}
          value={venueName}
          onChangeText={setVenueName}
        />
        <TextInput
          style={styles.input}
          placeholder="City"
          placeholderTextColor={Colors.muted}
          value={venueCity}
          onChangeText={setVenueCity}
        />

        <Text style={styles.section}>Ratings</Text>
        {RATINGS.map(r => (
          <RatingWithPhotos
            key={r.key}
            label={r.label}
            required={r.required}
            value={ratings[r.key]}
            onChange={v => setRating(r.key, v)}
            photos={ratingPhotos[r.category]}
            onAddPhotos={() => handleAddPhotos(r.category)}
            onRemovePhoto={i => removePhoto(r.category, i)}
          />
        ))}

        <View style={styles.publicRow}>
          <View>
            <Text style={styles.publicLabel}>Public review</Text>
            <Text style={styles.publicSub}>Visible to everyone</Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ true: Colors.primary, false: Colors.border }}
            thumbColor="#fff"
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>Post review</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  header: {
    paddingTop: 60, paddingBottom: 12, paddingHorizontal: 20,
    backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.foreground },
  form: { padding: 20, gap: 0 },
  section: {
    fontSize: 11, fontWeight: '700', color: Colors.muted,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: 20, marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.card, borderRadius: 12, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Colors.foreground, marginBottom: 10,
  },
  bodyInput: { height: 120, textAlignVertical: 'top' },
  publicRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: 12, borderWidth: 1,
    borderColor: Colors.border, padding: 14, marginTop: 8, marginBottom: 24,
  },
  publicLabel: { fontSize: 15, fontWeight: '600', color: Colors.foreground },
  publicSub: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 100,
    paddingVertical: 16, alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})
