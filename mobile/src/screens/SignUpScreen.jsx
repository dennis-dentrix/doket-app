import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, StatusBar, ActivityIndicator, Alert,
  Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../hooks/useTheme';
import useAuthStore from '../store/authStore';
import useSettingsStore from '../store/settingsStore';
import { CURRENCIES, getCurrencyByCode } from '../utils/currencies';

// Derive a deduplicated country list from the currencies table
// Each entry: { label, dialCode, currencyCode }
const COUNTRIES = (() => {
  const seen = new Set();
  const list = [];
  for (const c of CURRENCIES) {
    const key = c.dialCode;
    if (!seen.has(key)) {
      seen.add(key);
      list.push({ label: c.name.split(' ').slice(1).join(' ') || c.name, dialCode: c.dialCode, currencyCode: c.code, currencyName: c.name });
    }
  }
  // Use currency name as country name (good enough for this list)
  return CURRENCIES.map(c => ({ label: c.name, dialCode: c.dialCode, currencyCode: c.code }));
})();

// Build a cleaner country list with proper country names
const COUNTRY_LIST = [
  { label: 'Kenya',             dialCode: '+254', currencyCode: 'KES' },
  { label: 'Nigeria',           dialCode: '+234', currencyCode: 'NGN' },
  { label: 'South Africa',      dialCode: '+27',  currencyCode: 'ZAR' },
  { label: 'Ghana',             dialCode: '+233', currencyCode: 'GHS' },
  { label: 'Uganda',            dialCode: '+256', currencyCode: 'UGX' },
  { label: 'Tanzania',          dialCode: '+255', currencyCode: 'TZS' },
  { label: 'Ethiopia',          dialCode: '+251', currencyCode: 'ETB' },
  { label: 'Egypt',             dialCode: '+20',  currencyCode: 'EGP' },
  { label: 'Morocco',           dialCode: '+212', currencyCode: 'MAD' },
  { label: 'Rwanda',            dialCode: '+250', currencyCode: 'RWF' },
  { label: 'United States',     dialCode: '+1',   currencyCode: 'USD' },
  { label: 'Canada',            dialCode: '+1',   currencyCode: 'CAD' },
  { label: 'Mexico',            dialCode: '+52',  currencyCode: 'MXN' },
  { label: 'Brazil',            dialCode: '+55',  currencyCode: 'BRL' },
  { label: 'Colombia',          dialCode: '+57',  currencyCode: 'COP' },
  { label: 'Germany / Eurozone',dialCode: '+49',  currencyCode: 'EUR' },
  { label: 'United Kingdom',    dialCode: '+44',  currencyCode: 'GBP' },
  { label: 'Switzerland',       dialCode: '+41',  currencyCode: 'CHF' },
  { label: 'Sweden',            dialCode: '+46',  currencyCode: 'SEK' },
  { label: 'Poland',            dialCode: '+48',  currencyCode: 'PLN' },
  { label: 'UAE',               dialCode: '+971', currencyCode: 'AED' },
  { label: 'Saudi Arabia',      dialCode: '+966', currencyCode: 'SAR' },
  { label: 'India',             dialCode: '+91',  currencyCode: 'INR' },
  { label: 'Philippines',       dialCode: '+63',  currencyCode: 'PHP' },
  { label: 'Indonesia',         dialCode: '+62',  currencyCode: 'IDR' },
  { label: 'Malaysia',          dialCode: '+60',  currencyCode: 'MYR' },
  { label: 'Singapore',         dialCode: '+65',  currencyCode: 'SGD' },
  { label: 'Australia',         dialCode: '+61',  currencyCode: 'AUD' },
  { label: 'New Zealand',       dialCode: '+64',  currencyCode: 'NZD' },
  { label: 'Pakistan',          dialCode: '+92',  currencyCode: 'PKR' },
];

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState(null);
  const [country, setCountry] = useState(null);         // selected COUNTRY_LIST entry
  const [currency, setCurrencyLocal] = useState(null);  // selected CURRENCIES entry
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  const { colors, typography, spacing, radius, isDark } = useTheme();
  const { signUp, isLoading } = useAuthStore();
  const { setCurrency } = useSettingsStore();
  const s = makeStyles(colors, spacing, radius, typography);

  const handleSelectCountry = (c) => {
    setCountry(c);
    // Auto-set currency to match country
    const matched = getCurrencyByCode(c.currencyCode);
    setCurrencyLocal(matched);
    setShowCountryPicker(false);
    setPickerSearch('');
  };

  const handleSelectCurrency = (c) => {
    setCurrencyLocal(c);
    setShowCurrencyPicker(false);
    setPickerSearch('');
  };

  const handleSignUp = async () => {
    if (!fullName.trim()) { Alert.alert('Missing Field', 'Please enter your full name.'); return; }
    if (!country) { Alert.alert('Missing Field', 'Please select your country.'); return; }
    if (!email.trim() || !email.includes('@')) { Alert.alert('Invalid Email', 'Please enter a valid email address.'); return; }
    if (!password.trim() || password.length < 6) { Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return; }

    const formattedPhone = phone.trim()
      ? phone.startsWith('+') ? phone : `${country.dialCode}${phone.replace(/^0/, '')}`
      : null;

    const result = await signUp({
      email: email.trim(),
      phone: formattedPhone,
      password,
      fullName: fullName.trim(),
      businessName: businessName.trim(),
    });

    if (!result.success) {
      Alert.alert('Sign Up Failed', result.error);
    } else {
      // Persist the chosen currency globally
      if (currency) await setCurrency(currency);
    }
  };

  const filteredCountries = COUNTRY_LIST.filter(c =>
    c.label.toLowerCase().includes(pickerSearch.toLowerCase()) ||
    c.dialCode.includes(pickerSearch)
  );
  const filteredCurrencies = CURRENCIES.filter(c =>
    c.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
    c.code.toLowerCase().includes(pickerSearch.toLowerCase())
  );

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

        <Text style={s.title}>Create Account</Text>
        <Text style={s.subtitle}>Start managing your business today.</Text>

        <View style={s.form}>
          {/* Text fields */}
          {[
            { label: 'Full Name *', key: 'name', value: fullName, set: setFullName, props: { placeholder: 'Jane Smith', autoCapitalize: 'words' } },
            { label: 'Business Name (optional)', key: 'biz', value: businessName, set: setBusinessName, props: { placeholder: 'Smith Consulting', autoCapitalize: 'words' } },
            { label: 'Email Address *', key: 'email', value: email, set: setEmail, props: { placeholder: 'jane@example.com', keyboardType: 'email-address', autoCapitalize: 'none' } },
          ].map(({ label, key, value, set, props }) => (
            <View key={key} style={s.field}>
              <Text style={s.label}>{label}</Text>
              <TextInput
                style={[s.input, focused === key && s.inputFocused]}
                value={value}
                onChangeText={set}
                onFocus={() => setFocused(key)}
                onBlur={() => setFocused(null)}
                placeholderTextColor={colors.outline}
                {...props}
              />
            </View>
          ))}

          {/* Country picker */}
          <View style={s.field}>
            <Text style={s.label}>Country *</Text>
            <TouchableOpacity
              style={[s.pickerBtn, !country && focused === 'country' && s.inputFocused]}
              onPress={() => { setPickerSearch(''); setShowCountryPicker(true); }}
              activeOpacity={0.8}
            >
              {country ? (
                <View style={s.pickerSelected}>
                  <Text style={s.pickerDialCode}>{country.dialCode}</Text>
                  <Text style={s.pickerValue}>{country.label}</Text>
                </View>
              ) : (
                <Text style={s.pickerPlaceholder}>Select your country</Text>
              )}
              <Ionicons name="chevron-down" size={18} color={colors.outline} />
            </TouchableOpacity>
          </View>

          {/* Phone — shows dial code prefix once country chosen */}
          <View style={s.field}>
            <Text style={s.label}>Phone Number (optional)</Text>
            <View style={[s.phoneRow, focused === 'phone' && s.inputFocused]}>
              {country ? (
                <TouchableOpacity
                  style={s.dialCodeBtn}
                  onPress={() => { setPickerSearch(''); setShowCountryPicker(true); }}
                >
                  <Text style={s.dialCodeText}>{country.dialCode}</Text>
                  <Ionicons name="chevron-down" size={12} color={colors.outline} />
                </TouchableOpacity>
              ) : (
                <View style={s.dialCodeBtn}>
                  <Text style={s.dialCodeText}>+??</Text>
                </View>
              )}
              <TextInput
                style={s.phoneInput}
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused(null)}
                placeholder="712 345 678"
                placeholderTextColor={colors.outline}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Currency picker */}
          <View style={s.field}>
            <Text style={s.label}>Currency *</Text>
            <TouchableOpacity
              style={s.pickerBtn}
              onPress={() => { setPickerSearch(''); setShowCurrencyPicker(true); }}
              activeOpacity={0.8}
            >
              {currency ? (
                <View style={s.pickerSelected}>
                  <View style={s.currencyBadge}>
                    <Text style={s.currencyBadgeText}>{currency.symbol.length <= 3 ? currency.symbol : currency.code}</Text>
                  </View>
                  <Text style={s.pickerValue}>{currency.name} ({currency.code})</Text>
                </View>
              ) : (
                <Text style={s.pickerPlaceholder}>Select currency</Text>
              )}
              <Ionicons name="chevron-down" size={18} color={colors.outline} />
            </TouchableOpacity>
            <Text style={s.fieldHint}>Auto-set from country · you can change this anytime in Settings</Text>
          </View>

          {/* Password */}
          <View style={s.field}>
            <Text style={s.label}>Password *</Text>
            <TextInput
              style={[s.input, focused === 'pass' && s.inputFocused]}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocused('pass')}
              onBlur={() => setFocused(null)}
              placeholder="Min. 6 characters"
              placeholderTextColor={colors.outline}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity style={[s.button, isLoading && s.buttonDisabled]} onPress={handleSignUp} disabled={isLoading} activeOpacity={0.85}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={s.link}>Already have an account? <Text style={s.linkBold}>Sign In</Text></Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Country picker modal */}
      <PickerModal
        visible={showCountryPicker}
        title="Select Country"
        search={pickerSearch}
        onSearchChange={setPickerSearch}
        onClose={() => setShowCountryPicker(false)}
        data={filteredCountries}
        keyExtractor={item => item.dialCode + item.label}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.modalItem, country?.label === item.label && { backgroundColor: colors.surfaceVariant }]}
            onPress={() => handleSelectCountry(item)}
            activeOpacity={0.7}
          >
            <View style={s.modalItemLeft}>
              <Text style={s.modalDialCode}>{item.dialCode}</Text>
              <Text style={[s.modalItemText, { color: colors.onSurface }]}>{item.label}</Text>
            </View>
            {country?.label === item.label && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
          </TouchableOpacity>
        )}
        colors={colors}
        spacing={spacing}
        radius={radius}
        typography={typography}
      />

      {/* Currency picker modal */}
      <PickerModal
        visible={showCurrencyPicker}
        title="Select Currency"
        search={pickerSearch}
        onSearchChange={setPickerSearch}
        onClose={() => setShowCurrencyPicker(false)}
        data={filteredCurrencies}
        keyExtractor={item => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.modalItem, currency?.code === item.code && { backgroundColor: colors.surfaceVariant }]}
            onPress={() => handleSelectCurrency(item)}
            activeOpacity={0.7}
          >
            <View style={s.currencyBadge}>
              <Text style={s.currencyBadgeText}>{item.symbol.length <= 3 ? item.symbol : item.code}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[s.modalItemText, { color: colors.onSurface }]}>{item.name}</Text>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>{item.code} · {item.dialCode}</Text>
            </View>
            {currency?.code === item.code && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
          </TouchableOpacity>
        )}
        colors={colors}
        spacing={spacing}
        radius={radius}
        typography={typography}
      />
    </SafeAreaView>
  );
}

// ─── Reusable bottom-sheet picker ─────────────────────────────────────────────

function PickerModal({ visible, title, search, onSearchChange, onClose, data, keyExtractor, renderItem, colors, spacing, radius, typography }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={onClose} />
      <View style={{
        backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        maxHeight: '75%', paddingBottom: 32,
      }}>
        {/* Handle */}
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginTop: 12, marginBottom: 4 }} />

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.containerMargin, paddingVertical: spacing.md }}>
          <Text style={{ ...typography.h3, color: colors.onSurface, fontWeight: '700' }}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={22} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: spacing.containerMargin, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceVariant, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 }}>
            <Ionicons name="search-outline" size={16} color={colors.outline} />
            <TextInput
              style={{ flex: 1, color: colors.onSurface, fontSize: 14 }}
              placeholder="Search…"
              placeholderTextColor={colors.outline}
              value={search}
              onChangeText={onSearchChange}
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange('')}>
                <Ionicons name="close-circle" size={16} color={colors.outline} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (colors, spacing, radius, typography) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.containerMargin, paddingBottom: spacing.xl },
  back: { marginTop: spacing.md, marginBottom: spacing.lg },
  backText: { ...typography.body, color: colors.secondary },
  title: { ...typography.h2, color: colors.onSurface, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.onSurfaceVariant, marginBottom: spacing.lg },
  form: { gap: spacing.md, marginBottom: spacing.lg },
  field: { gap: 4 },
  label: { ...typography.label, color: colors.secondary },
  fieldHint: { ...typography.small, color: colors.outline, marginTop: 4, fontSize: 11 },

  input: {
    borderWidth: 1, borderColor: colors.secondary, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    ...typography.body, color: colors.onSurface, backgroundColor: colors.surface,
  },
  inputFocused: { borderWidth: 2, borderColor: colors.primary },

  // Picker button (country / currency selector)
  pickerBtn: {
    borderWidth: 1, borderColor: colors.secondary, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface,
  },
  pickerSelected: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  pickerValue: { ...typography.body, color: colors.onSurface, flex: 1 },
  pickerPlaceholder: { ...typography.body, color: colors.outline, flex: 1 },
  pickerDialCode: { ...typography.body, color: colors.secondary, fontWeight: '700', minWidth: 42 },

  // Phone row
  phoneRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.secondary, borderRadius: radius.md,
    backgroundColor: colors.surface, overflow: 'hidden',
  },
  dialCodeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 14,
    borderRightWidth: 1, borderRightColor: colors.outlineVariant,
    backgroundColor: colors.surfaceVariant,
  },
  dialCodeText: { ...typography.body, color: colors.secondary, fontWeight: '700', fontSize: 14 },
  phoneInput: {
    flex: 1, paddingHorizontal: spacing.md, paddingVertical: 14,
    ...typography.body, color: colors.onSurface,
  },

  // Currency badge pill
  currencyBadge: {
    backgroundColor: colors.surfaceVariant, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: colors.outlineVariant,
    minWidth: 36, alignItems: 'center',
  },
  currencyBadgeText: { fontWeight: '700', fontSize: 12, color: colors.secondary },

  button: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: spacing.md, alignItems: 'center', marginBottom: spacing.md },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { ...typography.button, color: '#fff', fontSize: 16 },
  link: { ...typography.body, color: colors.onSurfaceVariant, textAlign: 'center' },
  linkBold: { color: colors.secondary, fontWeight: '700' },

  // Modal list items
  modalItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.containerMargin, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
  },
  modalItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  modalDialCode: { ...typography.body, color: colors.secondary, fontWeight: '700', minWidth: 46 },
  modalItemText: { ...typography.body, flex: 1 },
});
