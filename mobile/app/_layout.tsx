import { Stack, router, useSegments, useRootNavigationState } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const segments = useSegments()
  const navState = useRootNavigationState()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!navState?.key || session === undefined) return
    SplashScreen.hideAsync()

    const inAuthGroup = segments[0] === '(auth)'
    const inTabsGroup = segments[0] === '(tabs)'

    if (!session && !inAuthGroup) {
      // Unauthenticated and not already on an auth screen — redirect to login
      router.replace('/(auth)/login')
    } else if (session && inAuthGroup) {
      // Authenticated but on auth screen — redirect to tabs
      router.replace('/(tabs)')
    }
    // Deep link destinations (review/[slug], reset-password, etc.) are left as-is
  }, [session, segments, navState?.key])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="review/[slug]" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="edit-review/[id]" />
    </Stack>
  )
}
