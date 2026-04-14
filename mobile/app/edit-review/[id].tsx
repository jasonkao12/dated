import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Switch,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useThemeColors } from '@/hooks/useThemeColors'

const RATINGS = [
  { key: 'rating_overall',  label: 'Overall',   required: true },
  { key: 'rating_ambiance', label: 'Ambiance' },
  { key: 'rating_food',     label: 'Food' },
  { key: 'rating_service',  label: 'Service' },
  { key: 'rating_value',    label: 'Value' },
  { key: 'rating_vibe',     label: 'Date Vibe' },
]

function StarPicker({ label, required, value, onChange, Colors }: {
  label: string; required?: boolean; value: number | null
  onChange: (v: number | null) => void; Colors: any
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.foreground, marginBottom: 6 }}>
        {label}{!required && <Text style={{ color: Colors.muted }}> (optional)</Text>}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <TouchableOpacity key={n} onPress={() => onChange(n === value ? null : n)}>
            <Text style={{ fontSize: 28, color: n <= (value ?? 0) ? Colors.primary : Colors.border }}>★</Text>
          </TouchableOpacity>
        ))}
        {value !== null && (
          <Text style={{ marginLeft: 8, fontSize: 13, color: Colors.muted }}>{value}/5</Text>
        )}
      </View>
    </View>
  )
}

type ReviewData = {
  id: string; title: string; body: string | null; visited_on: string | null
  is_public: boolean; rating_overall: number | null; rating_ambiance: number | null
  rating_food: number | null; rating_service: number | null
  rating_value: number | null; rating_vibe: number | null
  places: { name: string; city: string | null } | null
}

export default function EditReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const Colors = useThemeColors()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [visitedOn, setVisitedOn] = useState('')
  const [venueName, setVenueName] = useState('')
  const [venueCity, setVenueCity] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [ratings, setRatings] = useState<Record<string, number | null>>({
    rating_overall: null, rating_ambiance: null, rating_food: null,
    rating_service: null, rating_value: null, rating_vibe: null,
  })

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('reviews')
        .select('id, title, body, visited_on, is_public, rating_overall, rating_ambiance, rating_food, rating_service, rating_value, rating_vibe, places(name, city)')
        .eq('id', id)
        .single()

      if (!data) { setLoading(false); return }
      const r = data as unknown as ReviewData
      setTitle(r.title)
      setBody(r.body ?? '')
      setVisitedOn(r.visited_on ?? '')
      setVenueName(r.places?.name ?? '')
      setVenueCity(r.places?.city ?? '')
      setIsPublic(r.is_public)
      setRatings({
        rating_overall:  r.rating_overall,
        rating_ambiance: r.rating_ambiance,
        rating_food:     r.rating_food,
        rating_service:  r.rating_service,
        rating_value:    r.rating_value,
        rating_vibe:     r.rating_vibe,
      })
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSave() {
    if (!title.trim()) { Alert.alert('Title required'); return }
    if (ratings.rating_overall === null) { Alert.alert('Overall rating required'); return }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    let placeId: string | null = null
    if (venueName.trim()) {
      const { data: place } = await supabase
        .from('places')
        .upsert({ name: venueName.trim(), city: venueCity.trim() || null }, { onConflict: 'name,city' })
        .select('id').single()
      placeId = place?.id ?? null
    }

    const { error } = await supabase
      .from('reviews')
      .update({
        title: title.trim(),
        body: body.trim() || null,
        visited_on: visitedOn || null,
        is_public: isPublic,
        place_id: placeId,
        ...ratings,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    setSaving(false)
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('Saved!', '', [{ text: 'OK', onPress: () => router.back() }])
    }
  }

  async function handleDelete() {
    Alert.alert('Delete review', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          await supabase.from('reviews').delete().eq('id', id).eq('user_id', user.id)
          router.replace('/(tabs)/dates')
        }
      }
    ])
  }

  const s = makeStyles(Colors)

  if (loading) return (
    <View style={s.center}><ActivityIndicator color={Colors.primary} /></View>
  )

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Edit Review</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={Colors.destructive} />
        </TouchableOpacity>
      </View>

      <View style={s.form}>
        <Text style={s.section}>Venue</Text>
        <TextInput style={s.input} placeholder="Venue name" placeholderTextColor={Colors.muted} value={venueName} onChangeText={setVenueName} />
        <TextInput style={s.input} placeholder="City" placeholderTextColor={Colors.muted} value={venueCity} onChangeText={setVenueCity} />

        <Text style={s.section}>About the date</Text>
        <TextInput style={s.input} placeholder="Title *" placeholderTextColor={Colors.muted} value={title} onChangeText={setTitle} />
        <TextInput style={[s.input, s.bodyInput]} placeholder="Tell your story…" placeholderTextColor={Colors.muted} value={body} onChangeText={setBody} multiline />
        <TextInput style={s.input} placeholder="Date visited (YYYY-MM-DD)" placeholderTextColor={Colors.muted} value={visitedOn} onChangeText={setVisitedOn} />

        <Text style={s.section}>Ratings</Text>
        {RATINGS.map(r => (
          <StarPicker
            key={r.key} label={r.label} required={r.required}
            value={ratings[r.key]} Colors={Colors}
            onChange={v => setRatings(prev => ({ ...prev, [r.key]: v }))}
          />
        ))}

        <View style={s.publicRow}>
          <View>
            <Text style={s.publicLabel}>Public review</Text>
            <Text style={s.publicSub}>Visible to everyone</Text>
          </View>
          <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: Colors.primary, false: Colors.border }} thumbColor="#fff" />
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Save changes</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

function makeStyles(Colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingBottom: 48 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    header: {
      paddingTop: 60, paddingBottom: 12, paddingHorizontal: 20,
      backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    backBtn: { padding: 2 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.foreground },
    form: { padding: 20 },
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
    saveBtn: { backgroundColor: Colors.primary, borderRadius: 100, paddingVertical: 16, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  })
}
