import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity,  StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../hooks/useTheme';
import useAuthStore from '../store/authStore';
import DoketLogo from '../components/DoketLogo';

const FEATURES = [
  { icon: 'document-text-outline', title: 'Quick Invoices', subtitle: 'Create professional invoices in seconds.' },
  { icon: 'camera-outline', title: 'Receipt Scanning', subtitle: 'Scan receipts with AI-powered OCR.' },
  { icon: 'cloud-offline-outline', title: 'Offline First', subtitle: 'Works without internet, syncs when online.' },
  { icon: 'card-outline', title: 'Payment Links', subtitle: 'Generate payment links and get paid faster.' },
];

export default function WelcomeScreen({ navigation }) {
  const { colors, typography, spacing, radius, shadows, isDark } = useTheme();
  const { devBypass } = useAuthStore();
  const s = makeStyles(colors, spacing, radius, typography);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={s.header}>
        <View style={s.logoContainer}>
          <DoketLogo size={36} />
          <Text style={s.logoText}>Doket</Text>
        </View>
        <Text style={s.tagline}>Your business, organized</Text>
      </View>

      <View style={s.features}>
        {FEATURES.map((feature) => (
          <View key={feature.title} style={s.featureCard}>
            <View style={s.featureIconContainer}>
              <Ionicons name={feature.icon} size={22} color={colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.featureTitle}>{feature.title}</Text>
              <Text style={s.featureSubtitle}>{feature.subtitle}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={s.actions}>
        <TouchableOpacity style={s.primaryButton} onPress={() => navigation.navigate('SignUp')} activeOpacity={0.85}>
          <Text style={s.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.secondaryButton} onPress={() => navigation.navigate('SignIn')} activeOpacity={0.85}>
          <Text style={s.secondaryButtonText}>Sign In</Text>
        </TouchableOpacity>
        <Text style={s.terms}>
          By continuing, you agree to our <Text style={s.link}>Terms</Text> and <Text style={s.link}>Privacy Policy</Text>.
        </Text>
        <TouchableOpacity style={s.devButton} onPress={devBypass} activeOpacity={0.7}>
          <Text style={s.devButtonText}>🛠 Browse app (dev mode)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors, spacing, radius, typography) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.containerMargin },
  header: { alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.lg },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  logoIcon: { width: 48, height: 48, backgroundColor: colors.secondary, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  logoText: { ...typography.h1, color: colors.secondary },
  tagline: { ...typography.body, color: colors.onSurfaceVariant },
  features: { flex: 1, gap: spacing.sm, paddingVertical: spacing.md },
  featureCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md, borderLeftWidth: 4,
    borderLeftColor: colors.secondary, gap: spacing.md,
    shadowColor: colors.onSurface, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  featureIconContainer: { width: 44, height: 44, backgroundColor: colors.surfaceVariant, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  featureTitle: { ...typography.bodyMedium, color: colors.onSurface, fontWeight: '700', marginBottom: 2 },
  featureSubtitle: { ...typography.small, color: colors.onSurfaceVariant },
  actions: { paddingBottom: spacing.lg, gap: spacing.sm },
  primaryButton: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: spacing.md, alignItems: 'center' },
  primaryButtonText: { ...typography.button, color: '#fff', fontSize: 16 },
  secondaryButton: { backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.primary, paddingVertical: spacing.md, alignItems: 'center' },
  secondaryButtonText: { ...typography.button, color: colors.primary, fontSize: 16 },
  terms: { ...typography.small, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: spacing.xs },
  link: { color: colors.secondary, textDecorationLine: 'underline' },
  devButton: { alignItems: 'center', paddingVertical: spacing.sm },
  devButtonText: { ...typography.small, color: colors.outline, textDecorationLine: 'underline' },
});
