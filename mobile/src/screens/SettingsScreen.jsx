import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image,
  StatusBar, ScrollView, Switch, Alert, StyleSheet, FlatList,
  Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useTheme from '../hooks/useTheme';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import useCurrency from '../hooks/useCurrency';
import { CURRENCIES } from '../utils/currencies';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const { colors, typography, spacing, radius, isDark } = useTheme();
  const { themeMode, setThemeMode } = useThemeStore();
  const { profile, updateProfile, signOut } = useAuthStore();
  const { currency, setCurrency } = useCurrency();
  const [autoSync, setAutoSync] = useState(true);
  const [avatarUri, setAvatarUri] = useState(profile?.avatar_url ?? null);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);

  const s = makeStyles(colors, spacing, radius, typography);

  const name = profile?.full_name ?? 'Your Name';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handlePickAvatar = () => {
    Alert.alert('Profile Photo', 'Choose how to update your photo', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permission needed', 'Camera access is required.'); return; }
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
          if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
            updateProfile({ avatar_url: result.assets[0].uri });
          }
        },
      },
      {
        text: 'Choose from Library',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
          if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
            updateProfile({ avatar_url: result.assets[0].uri });
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Page title */}
        <Text style={s.pageTitle}>Settings</Text>

        {/* Avatar + name */}
        <View style={s.profileRow}>
          <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8} style={s.avatarWrapper}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={s.avatarImage} />
            ) : (
              <View style={s.avatar}>
                <Text style={s.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={s.editBadge}>
              <Ionicons name="camera" size={10} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={s.profileInfo}>
            <Text style={s.profileName}>{name}</Text>
            <Text style={s.profileSub}>{profile?.business_name ?? 'Doket User'}</Text>
          </View>

          <TouchableOpacity
            style={s.editProfileBtn}
            onPress={() => setShowEditSheet(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text style={s.editProfileBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ACCOUNT */}
        <Text style={s.sectionLabel}>ACCOUNT</Text>
        <View style={s.card}>
          <FlatRow label="Phone" value={profile?.phone ?? '—'} s={s} />
          <View style={s.divider} />
          <FlatRow label="Email" value={profile?.email ?? '—'} valueStyle={{ color: colors.secondary }} s={s} />
          <View style={s.divider} />
          <TouchableOpacity style={s.row} onPress={() => setShowEditSheet(true)} activeOpacity={0.7}>
            <Text style={[s.rowLabel, { color: colors.primary, fontWeight: '600' }]}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.outline} />
          </TouchableOpacity>
        </View>

        {/* REGION & CURRENCY */}
        <Text style={s.sectionLabel}>REGION & CURRENCY</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.row} onPress={() => setShowCurrencyPicker(true)} activeOpacity={0.7}>
            <View>
              <Text style={s.rowLabel}>Currency</Text>
              <Text style={[s.rowValue, { textAlign: 'left', marginLeft: 0, marginTop: 2, fontSize: 12 }]}>{currency.name}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={s.currencyBadge}>
                <Text style={s.currencyBadgeText}>{currency.symbol}</Text>
              </View>
              <Text style={[s.rowValue, { color: colors.secondary, fontWeight: '700', marginLeft: 0 }]}>{currency.code}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.outline} />
            </View>
          </TouchableOpacity>
        </View>

        {/* APP SETTINGS */}
        <Text style={s.sectionLabel}>APP SETTINGS</Text>
        <View style={s.card}>
          <View style={s.themeRow}>
            <Text style={s.rowLabel}>Appearance</Text>
            <View style={s.themeSegment}>
              {THEME_OPTIONS.map((opt) => {
                const active = themeMode === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[s.themeOption, active && s.themeOptionActive]}
                    onPress={() => setThemeMode(opt.value)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name={opt.icon} size={15} color={active ? colors.primary : colors.onSurfaceVariant} />
                    <Text style={[s.themeOptionText, active && s.themeOptionTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <Text style={s.rowLabel}>Auto-Sync</Text>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: colors.outlineVariant, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <Text style={s.rowLabel}>Offline Status</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={s.syncedText}>Synced</Text>
              <Ionicons name="checkmark" size={14} color={colors.success} />
            </View>
          </View>
        </View>

        {/* SUPPORT */}
        <Text style={s.sectionLabel}>SUPPORT</Text>
        <View style={s.card}>
          <LinkRow label="Help & FAQ" s={s} colors={colors} />
          <View style={s.divider} />
          <LinkRow label="Privacy Policy" s={s} colors={colors} />
          <View style={s.divider} />
          <LinkRow label="About Doket" s={s} colors={colors} />
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={s.signOutButton} onPress={handleSignOut} activeOpacity={0.85}>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>Doket v1.0.0</Text>
      </ScrollView>

      {/* Currency Picker */}
      <CurrencyPickerSheet
        visible={showCurrencyPicker}
        onClose={() => setShowCurrencyPicker(false)}
        current={currency}
        onSelect={(c) => { setCurrency(c); setShowCurrencyPicker(false); }}
        colors={colors}
        typography={typography}
        spacing={spacing}
        radius={radius}
      />

      {/* Edit Profile Sheet */}
      <EditProfileSheet
        visible={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        profile={profile}
        avatarUri={avatarUri}
        onPickAvatar={handlePickAvatar}
        onSave={(updates) => {
          updateProfile(updates);
          setShowEditSheet(false);
        }}
        colors={colors}
        typography={typography}
        spacing={spacing}
        radius={radius}
      />
    </SafeAreaView>
  );
}

// ─── Edit Profile Modal Sheet ────────────────────────────────────────────────

function EditProfileSheet({ visible, onClose, profile, avatarUri, onPickAvatar, onSave, colors, typography, spacing, radius }) {
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [businessName, setBusinessName] = useState(profile?.business_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [email] = useState(profile?.email ?? ''); // email change needs re-auth, read-only for now
  const [isSaving, setIsSaving] = useState(false);
  const [focused, setFocused] = useState(null);
  const ms = makeSheetStyles(colors, spacing, radius, typography);

  const name = fullName || 'Your Name';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleSave = async () => {
    if (!fullName.trim()) { Alert.alert('Required', 'Full name cannot be empty.'); return; }
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 400)); // small delay for feel
    onSave({ full_name: fullName.trim(), business_name: businessName.trim(), phone: phone.trim() });
    setIsSaving(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={ms.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={ms.sheetWrapper}>
          <View style={ms.sheet}>
            {/* Handle + header */}
            <View style={ms.handle} />
            <View style={ms.sheetHeader}>
              <Text style={ms.sheetTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {/* Avatar picker inside sheet */}
            <View style={ms.avatarSection}>
              <TouchableOpacity onPress={onPickAvatar} activeOpacity={0.8} style={ms.avatarWrapper}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={ms.avatarImage} />
                ) : (
                  <View style={ms.avatar}>
                    <Text style={ms.avatarText}>{initials}</Text>
                  </View>
                )}
                <View style={ms.cameraBadge}>
                  <Ionicons name="camera" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text style={ms.avatarHint}>Tap to change photo</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Fields */}
              {[
                { key: 'name', label: 'Full Name', value: fullName, set: setFullName, props: { autoCapitalize: 'words', placeholder: 'Your full name' } },
                { key: 'biz', label: 'Business Name', value: businessName, set: setBusinessName, props: { autoCapitalize: 'words', placeholder: 'Your business (optional)' } },
                { key: 'phone', label: 'Phone', value: phone, set: setPhone, props: { keyboardType: 'phone-pad', placeholder: '0712 345 678' } },
                { key: 'email', label: 'Email', value: email, set: () => {}, props: { keyboardType: 'email-address', editable: false, placeholder: '' } },
              ].map(({ key, label, value, set, props }) => (
                <View key={key} style={ms.field}>
                  <Text style={ms.label}>{label}{key === 'email' ? ' (cannot change here)' : ''}</Text>
                  <TextInput
                    style={[ms.input, focused === key && ms.inputFocused, props.editable === false && ms.inputDisabled]}
                    value={value}
                    onChangeText={set}
                    onFocus={() => setFocused(key)}
                    onBlur={() => setFocused(null)}
                    placeholderTextColor={colors.outline}
                    {...props}
                  />
                </View>
              ))}

              <TouchableOpacity
                style={[ms.saveBtn, isSaving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                {isSaving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={ms.saveBtnText}>Save Changes</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

// ─── Currency Picker Sheet ───────────────────────────────────────────────────

function CurrencyPickerSheet({ visible, onClose, current, onSelect, colors, typography, spacing, radius }) {
  const [search, setSearch] = useState('');
  const filtered = CURRENCIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );
  const ms = makeSheetStyles(colors, spacing, radius, typography);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={ms.backdrop}>
        <View style={[ms.sheet, { backgroundColor: colors.surface, maxHeight: '85%' }]}>
          <View style={ms.handle} />
          <View style={ms.sheetHeader}>
            <Text style={[ms.sheetTitle, { color: colors.onSurface }]}>Select Currency</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={{ paddingHorizontal: spacing.containerMargin, paddingBottom: spacing.sm }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              backgroundColor: colors.surfaceVariant, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
            }}>
              <Ionicons name="search-outline" size={16} color={colors.outline} />
              <TextInput
                style={{ flex: 1, color: colors.onSurface, fontSize: 14 }}
                placeholder="Search currency or country…"
                placeholderTextColor={colors.outline}
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={16} color={colors.outline} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={c => c.code}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const active = item.code === current.code;
              return (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingHorizontal: spacing.containerMargin, paddingVertical: 14,
                    borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
                    backgroundColor: active ? colors.surfaceVariant : 'transparent',
                  }}
                  onPress={() => onSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={{
                    width: 44, height: 28, borderRadius: 6, backgroundColor: colors.surfaceVariant,
                    justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: colors.outlineVariant,
                  }}>
                    <Text style={{ fontWeight: '700', fontSize: 12, color: active ? colors.primary : colors.secondary }}>
                      {item.symbol.length <= 3 ? item.symbol : item.code}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.onSurface, fontWeight: active ? '700' : '500', fontSize: 14 }}>{item.name}</Text>
                    <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>{item.code} · {item.dialCode}</Text>
                  </View>
                  {active && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FlatRow({ label, value, valueStyle, s }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, valueStyle]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function LinkRow({ label, s, colors }) {
  return (
    <TouchableOpacity style={s.row} activeOpacity={0.7}>
      <Text style={[s.rowLabel, { color: colors.primary, fontWeight: '500' }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.outline} />
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const makeStyles = (colors, spacing, radius, typography) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.containerMargin, paddingBottom: spacing.xl },

  pageTitle: {
    ...typography.h1, color: colors.secondary, fontWeight: '800',
    marginTop: spacing.md, marginBottom: spacing.lg,
  },

  profileRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginBottom: spacing.lg,
  },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 60, height: 60, backgroundColor: colors.secondary,
    borderRadius: 30, justifyContent: 'center', alignItems: 'center',
  },
  avatarImage: { width: 60, height: 60, borderRadius: 30 },
  avatarText: { fontSize: 22, color: '#fff', fontWeight: '700' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.background,
  },
  profileInfo: { flex: 1 },
  profileName: { ...typography.bodyMedium, color: colors.onSurface, fontWeight: '700', marginBottom: 2 },
  profileSub: { ...typography.small, color: colors.onSurfaceVariant },
  editProfileBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.primary,
  },
  editProfileBtnText: { ...typography.small, color: colors.primary, fontWeight: '600' },

  sectionLabel: {
    ...typography.small, color: colors.onSurfaceVariant, fontWeight: '700',
    letterSpacing: 0.8, textTransform: 'uppercase',
    marginBottom: spacing.sm, marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    overflow: 'hidden', marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.outlineVariant,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: 15,
  },
  rowLabel: { ...typography.body, color: colors.onSurface },
  rowValue: { ...typography.body, color: colors.onSurfaceVariant, flex: 1, textAlign: 'right', marginLeft: 8 },
  divider: { height: 1, backgroundColor: colors.outlineVariant, marginLeft: spacing.md },
  syncedText: { ...typography.body, color: colors.success, fontWeight: '600' },

  themeRow: { paddingHorizontal: spacing.md, paddingVertical: 12 },
  themeSegment: {
    flexDirection: 'row', marginTop: 10,
    backgroundColor: colors.surfaceVariant, borderRadius: 10, padding: 3,
  },
  themeOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 8, borderRadius: 8,
  },
  themeOptionActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  themeOptionText: { ...typography.small, color: colors.onSurfaceVariant, fontWeight: '600' },
  themeOptionTextActive: { color: colors.primary },

  signOutButton: {
    borderWidth: 1.5, borderColor: colors.secondary, borderRadius: radius.lg,
    paddingVertical: 14, alignItems: 'center', marginTop: spacing.md,
    backgroundColor: colors.surface,
  },
  signOutText: { ...typography.button, color: colors.primary, fontSize: 15 },
  version: { ...typography.small, color: colors.outline, textAlign: 'center', marginTop: spacing.md },

  currencyBadge: {
    backgroundColor: colors.surfaceVariant, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: colors.outlineVariant,
  },
  currencyBadgeText: { ...typography.small, color: colors.secondary, fontWeight: '700', fontSize: 12 },
});

const makeSheetStyles = (colors, spacing, radius, typography) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheetWrapper: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: 36, maxHeight: '90%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.outlineVariant,
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  sheetTitle: { ...typography.h3, color: colors.onSurface, fontWeight: '700' },

  avatarSection: { alignItems: 'center', paddingVertical: spacing.md },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 80, height: 80, backgroundColor: colors.secondary,
    borderRadius: 40, justifyContent: 'center', alignItems: 'center',
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarText: { fontSize: 28, color: '#fff', fontWeight: '700' },
  cameraBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: colors.surface,
  },
  avatarHint: { ...typography.small, color: colors.onSurfaceVariant, marginTop: 8 },

  field: { marginBottom: spacing.md },
  label: { ...typography.label, color: colors.secondary, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 13,
    ...typography.body, color: colors.onSurface, backgroundColor: colors.background,
  },
  inputFocused: { borderColor: colors.primary, borderWidth: 2 },
  inputDisabled: { color: colors.onSurfaceVariant, backgroundColor: colors.surfaceVariant },

  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm,
  },
  saveBtnText: { ...typography.button, color: '#fff', fontSize: 15 },
});
