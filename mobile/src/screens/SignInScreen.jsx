import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, 
  TextInput, ScrollView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../hooks/useTheme';
import useAuthStore from '../store/authStore';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authMethod, setAuthMethod] = useState('email');
  const [focused, setFocused] = useState(null);

  const { colors, typography, spacing, radius, isDark } = useTheme();
  const { signIn, isLoading } = useAuthStore();
  const s = makeStyles(colors, spacing, radius, typography);

  const handleSignIn = async () => {
    if (!password.trim()) { Alert.alert('Missing Password', 'Please enter your password.'); return; }
    let identifier;
    if (authMethod === 'email') {
      if (!email.trim()) { Alert.alert('Missing Email', 'Please enter your email address.'); return; }
      identifier = { email: email.trim() };
    } else {
      if (!phone.trim()) { Alert.alert('Missing Phone', 'Please enter your phone number.'); return; }
      identifier = { phone: phone.startsWith('+') ? phone : phone };
    }
    const result = await signIn({ ...identifier, password });
    if (!result.success) Alert.alert('Sign In Failed', result.error);
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="arrow-back" size={20} color={colors.secondary} />
            <Text style={s.backText}>Back</Text>
          </View>
        </TouchableOpacity>

        <Text style={s.title}>Welcome Back</Text>
        <Text style={s.subtitle}>Sign in to continue to Doket.</Text>

        <View style={s.toggle}>
          {['email', 'phone'].map((method) => (
            <TouchableOpacity key={method} style={[s.toggleBtn, authMethod === method && s.toggleBtnActive]} onPress={() => setAuthMethod(method)}>
              <Text style={[s.toggleText, authMethod === method && s.toggleTextActive]}>
                {method.charAt(0).toUpperCase() + method.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.form}>
          {authMethod === 'email' ? (
            <View style={s.field}>
              <Text style={s.label}>Email Address</Text>
              <TextInput
                style={[s.input, focused === 'email' && s.inputFocused]}
                placeholder="john@example.com"
                placeholderTextColor={colors.outline}
                value={email} onChangeText={setEmail}
                keyboardType="email-address" autoCapitalize="none"
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
              />
            </View>
          ) : (
            <View style={s.field}>
              <Text style={s.label}>Phone Number</Text>
              <TextInput
                style={[s.input, focused === 'phone' && s.inputFocused]}
                placeholder="0712 345 678"
                placeholderTextColor={colors.outline}
                value={phone} onChangeText={setPhone}
                keyboardType="phone-pad"
                onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
              />
            </View>
          )}
          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <TextInput
              style={[s.input, focused === 'pass' && s.inputFocused]}
              placeholder="Your password"
              placeholderTextColor={colors.outline}
              value={password} onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)}
            />
          </View>
        </View>

        <TouchableOpacity style={[s.button, isLoading && s.buttonDisabled]} onPress={handleSignIn} disabled={isLoading} activeOpacity={0.85}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={s.link}>Don't have an account? <Text style={s.linkBold}>Get Started</Text></Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors, spacing, radius, typography) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.containerMargin, paddingBottom: spacing.xl },
  back: { marginTop: spacing.md, marginBottom: spacing.lg },
  backText: { ...typography.body, color: colors.secondary },
  title: { ...typography.h2, color: colors.onSurface, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.onSurfaceVariant, marginBottom: spacing.md },
  toggle: { flexDirection: 'row', backgroundColor: colors.surfaceVariant, borderRadius: radius.full, padding: 4, marginBottom: spacing.md },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: radius.full, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleText: { ...typography.label, color: colors.onSurfaceVariant },
  toggleTextActive: { color: colors.secondary, fontWeight: '700' },
  form: { gap: spacing.md, marginBottom: spacing.lg },
  field: { gap: 4 },
  label: { ...typography.label, color: colors.secondary },
  input: {
    borderWidth: 1, borderColor: colors.secondary, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    ...typography.body, color: colors.onSurface, backgroundColor: colors.surface,
  },
  inputFocused: { borderWidth: 2, borderColor: colors.primary },
  button: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: spacing.md, alignItems: 'center', marginBottom: spacing.md },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { ...typography.button, color: '#fff', fontSize: 16 },
  link: { ...typography.body, color: colors.onSurfaceVariant, textAlign: 'center' },
  linkBold: { color: colors.secondary, fontWeight: '700' },
});
