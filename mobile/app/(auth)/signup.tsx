import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native'
import { Link, router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { Colors } from '@/constants/Colors'

export default function SignupScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    if (!username.trim()) {
      Alert.alert('Username required', 'Please choose a username.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username.trim().toLowerCase() },
      },
    })
    setLoading(false)
    if (error) {
      Alert.alert('Sign up failed', error.message)
    } else {
      Alert.alert(
        'Check your email',
        'We sent you a confirmation link. Confirm it then sign in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      )
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>dated</Text>
        <Text style={styles.subtitle}>Create your account</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={Colors.muted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
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

        <Text style={styles.tos}>
          By signing up you agree to our{' '}
          <Text style={styles.tosLink}>Terms of Service</Text> and{' '}
          <Text style={styles.tosLink}>Privacy Policy</Text>.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Create account</Text>
          }
        </TouchableOpacity>

        <View style={styles.row}>
          <Text style={styles.dimText}>Already have an account? </Text>
          <Link href="/(auth)/login" style={styles.link}>Sign in</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 28 },
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
  tos: {
    fontSize: 12, color: Colors.muted, textAlign: 'center', marginBottom: 16, lineHeight: 18,
  },
  tosLink: { color: Colors.primary, fontWeight: '600' },
  button: {
    backgroundColor: Colors.primary, borderRadius: 100, paddingVertical: 15,
    alignItems: 'center', marginBottom: 16,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  link: { color: Colors.primary, fontWeight: '600', fontSize: 14, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  dimText: { color: Colors.muted, fontSize: 14 },
})
