import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { Link, router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useThemeColors } from '@/hooks/useThemeColors'

export default function LoginScreen() {
  const Colors = useThemeColors()
  const styles = makeStyles(Colors)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) Alert.alert('Login failed', error.message)
    else router.replace('/(tabs)')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>dated</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Sign in</Text>
          }
        </TouchableOpacity>

        <Link href="/(auth)/forgot-password" style={styles.link}>
          Forgot password?
        </Link>

        <View style={styles.row}>
          <Text style={styles.dimText}>Don't have an account? </Text>
          <Link href="/(auth)/signup" style={styles.link}>Sign up</Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

function makeStyles(Colors: any) { return StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, justifyContent: 'center', padding: 28 },
  logo: {
    fontSize: 40, fontWeight: '900', color: Colors.primary,
    textAlign: 'center', marginBottom: 8, letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16, color: Colors.mutedFg, textAlign: 'center', marginBottom: 32,
  },
  input: {
    backgroundColor: Colors.card, borderRadius: 12, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: Colors.foreground, marginBottom: 12,
  },
  button: {
    backgroundColor: Colors.primary, borderRadius: 100, paddingVertical: 15,
    alignItems: 'center', marginTop: 4, marginBottom: 16,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  link: { color: Colors.primary, fontWeight: '600', fontSize: 14, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  dimText: { color: Colors.muted, fontSize: 14 },
}) }
