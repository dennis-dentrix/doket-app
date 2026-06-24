import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Image, TextInput, Modal, Alert, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import useTheme from '../hooks/useTheme';
import useCurrency from '../hooks/useCurrency';
import { extractReceiptData } from '../services/ocr';

const CATEGORIES = [
  'Communications', 'Banking', 'Meals', 'Transport', 'Office Supplies',
  'Utilities', 'Marketing', 'Software', 'Rent', 'Salaries', 'Other',
];

function genReceiptId() {
  return 'RCP-' + String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
}

export default function ReceiptDetailScreen({ route, navigation }) {
  const { imageUri } = route.params ?? {};
  const { colors, typography, spacing, radius, shadows, isDark } = useTheme();
  const { symbol } = useCurrency();

  const [receiptId] = useState(genReceiptId);
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [date] = useState(new Date());
  const [category, setCategory] = useState('');
  const [isScanning, setIsScanning] = useState(!!imageUri);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const s = makeStyles(colors, spacing, radius, typography, shadows);

  // Auto-extract details from image via OCR on mount
  useEffect(() => {
    if (!imageUri) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await extractReceiptData(imageUri);
        if (cancelled) return;
        if (result.vendor) setVendor(result.vendor);
        if (result.amount) setAmount(result.amount);
        if (result.category) setCategory(result.category);
      } catch {
        // OCR failed silently — user fills manually
      } finally {
        if (!cancelled) setIsScanning(false);
      }
    })();
    return () => { cancelled = true; };
  }, [imageUri]);

  const handleRetake = () => navigation.navigate('ReceiptScanner');

  const handleSave = async () => {
    if (!vendor.trim()) { Alert.alert('Missing Vendor', 'Please enter the vendor name.'); return; }
    if (!amount.trim()) { Alert.alert('Missing Amount', 'Please enter the amount.'); return; }
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 500));
    // TODO: save to SQLite receipts table
    setIsSaving(false);
    navigation.navigate('Tabs', { screen: 'Receipts' });
  };

  const handleDelete = () => {
    Alert.alert('Delete Receipt', 'This receipt will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>Receipt #{receiptId}</Text>
        <TouchableOpacity style={s.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="sync-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Receipt image */}
          <TouchableOpacity
            style={s.imageContainer}
            onPress={() => imageUri && setShowImagePreview(true)}
            activeOpacity={imageUri ? 0.9 : 1}
          >
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={s.image} resizeMode="cover" />
                {/* Scanning overlay */}
                {isScanning && (
                  <View style={s.scanningOverlay}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                    <Text style={s.scanningText}>Scanning receipt…</Text>
                  </View>
                )}
                {/* Image action buttons */}
                <View style={s.imageOverlay}>
                  <TouchableOpacity style={s.overlayBtn} onPress={() => setShowImagePreview(true)}>
                    <Ionicons name="expand-outline" size={18} color={colors.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.overlayBtn} onPress={handleRetake}>
                    <Ionicons name="refresh-outline" size={18} color={colors.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.overlayBtn}>
                    <Ionicons name="share-outline" size={18} color={colors.secondary} />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity style={s.imagePlaceholder} onPress={handleRetake} activeOpacity={0.8}>
                <Ionicons name="camera-outline" size={40} color={colors.outline} />
                <Text style={s.imagePlaceholderText}>Tap to take photo</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* Section header */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Details</Text>
            {isScanning ? (
              <View style={s.scanBadge}>
                <ActivityIndicator size="small" color="#FF6B35" style={{ transform: [{ scale: 0.7 }] }} />
                <Text style={s.scanBadgeText}>Extracting…</Text>
              </View>
            ) : (
              <View style={s.savedBadge}>
                <Ionicons name="checkmark-circle-outline" size={14} color="#1BBC9B" />
                <Text style={s.savedBadgeText}>Ready</Text>
              </View>
            )}
          </View>

          {/* Detail cards — 2 column grid */}
          <View style={s.grid}>

            {/* Vendor */}
            <View style={[s.card, s.cardHalf]}>
              <View style={s.cardHeader}>
                <Text style={s.cardLabel}>VENDOR</Text>
                {vendor.length > 0 && (
                  <TouchableOpacity onPress={() => setVendor('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle-outline" size={18} color={colors.secondary} />
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={s.cardInput}
                value={vendor}
                onChangeText={setVendor}
                placeholder="e.g. Safaricom"
                placeholderTextColor={colors.outline}
                returnKeyType="next"
              />
            </View>

            {/* Amount — KES prefix in same row, no overlap */}
            <View style={[s.card, s.cardHalf]}>
              <View style={s.cardHeader}>
                <Text style={s.cardLabel}>AMOUNT</Text>
                {amount.length > 0 && (
                  <TouchableOpacity onPress={() => setAmount('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle-outline" size={18} color={colors.secondary} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={s.amountRow}>
                <Text style={s.currencyLabel}>{symbol}</Text>
                <TextInput
                  style={s.amountInput}
                  value={amount}
                  onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))}
                  placeholder="0.00"
                  placeholderTextColor={colors.primary + '60'}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Date */}
            <View style={[s.card, s.cardHalf]}>
              <View style={s.cardHeader}>
                <Text style={s.cardLabel}>DATE</Text>
                <Ionicons name="calendar-outline" size={16} color={colors.onSurfaceVariant} />
              </View>
              <Text style={s.cardStaticValue}>{format(date, 'd MMMM yyyy')}</Text>
            </View>

            {/* Category */}
            <TouchableOpacity style={[s.card, s.cardHalf]} onPress={() => setShowCategoryPicker(true)} activeOpacity={0.75}>
              <View style={s.cardHeader}>
                <Text style={s.cardLabel}>CATEGORY</Text>
                <Ionicons name="chevron-down-outline" size={16} color={colors.onSurfaceVariant} />
              </View>
              {category ? (
                <View style={s.categoryRow}>
                  <View style={[s.categoryDot, { backgroundColor: colors.secondary }]} />
                  <Text style={s.cardStaticValue} numberOfLines={1}>{category}</Text>
                </View>
              ) : (
                <Text style={[s.cardStaticValue, { color: colors.outline }]}>Select…</Text>
              )}
            </TouchableOpacity>

          </View>

          {/* Retake button */}
          {imageUri && (
            <TouchableOpacity style={s.retakeRow} onPress={handleRetake} activeOpacity={0.7}>
              <Ionicons name="camera-reverse-outline" size={16} color={colors.onSurfaceVariant} />
              <Text style={s.retakeText}>Retake photo</Text>
            </TouchableOpacity>
          )}

          {/* Action buttons */}
          <View style={s.actions}>
            <TouchableOpacity style={[s.actionBtn, s.saveBtn, isSaving && { opacity: 0.7 }]} onPress={handleSave} disabled={isSaving} activeOpacity={0.8}>
              {isSaving
                ? <ActivityIndicator size="small" color={colors.secondary} />
                : <><Ionicons name="checkmark-outline" size={18} color={colors.secondary} /><Text style={[s.actionBtnText, { color: colors.secondary }]}>Save</Text></>
              }
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn, s.deleteBtn]} onPress={handleDelete} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
              <Text style={[s.actionBtnText, { color: colors.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom padding so last elements clear keyboard */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category picker */}
      <Modal visible={showCategoryPicker} transparent animationType="slide" onRequestClose={() => setShowCategoryPicker(false)}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => setShowCategoryPicker(false)} />
        <View style={[s.sheet, { backgroundColor: colors.surface }]}>
          <View style={s.sheetHandle} />
          <Text style={[s.sheetTitle, { color: colors.onSurface }]}>Select Category</Text>
          <FlatList
            data={CATEGORIES}
            keyExtractor={c => c}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[s.categoryItem, category === item && { backgroundColor: colors.surfaceVariant }]}
                onPress={() => { setCategory(item); setShowCategoryPicker(false); }}
                activeOpacity={0.7}
              >
                <View style={[s.categoryDot, { backgroundColor: category === item ? colors.primary : colors.secondary }]} />
                <Text style={[s.categoryItemText, { color: colors.onSurface }, category === item && { color: colors.primary, fontWeight: '700' }]}>{item}</Text>
                {category === item && <Ionicons name="checkmark" size={16} color={colors.primary} />}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Full image preview */}
      <Modal visible={showImagePreview} transparent animationType="fade" onRequestClose={() => setShowImagePreview(false)}>
        <View style={s.previewModal}>
          <TouchableOpacity style={s.previewClose} onPress={() => setShowImagePreview(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {imageUri && <Image source={{ uri: imageUri }} style={s.previewImage} resizeMode="contain" />}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (colors, spacing, radius, typography, shadows) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.containerMargin, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
  },
  headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...typography.h3, color: colors.secondary, fontWeight: '700', flex: 1, textAlign: 'center' },

  scroll: { paddingHorizontal: spacing.containerMargin, paddingTop: spacing.lg },

  // Image
  imageContainer: {
    height: 210, borderRadius: radius.xl,
    borderWidth: 2, borderColor: colors.secondary,
    overflow: 'hidden', marginBottom: spacing.lg,
    ...shadows.card,
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.surfaceVariant, gap: 10,
  },
  imagePlaceholderText: { ...typography.body, color: colors.outline },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', gap: 12,
  },
  scanningText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  imageOverlay: {
    position: 'absolute', bottom: 10, right: 10,
    flexDirection: 'row', gap: 6,
  },
  overlayBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.surface + 'E8',
    justifyContent: 'center', alignItems: 'center',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h3, color: colors.onSurface, fontWeight: '700' },
  savedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  savedBadgeText: { ...typography.small, color: '#1BBC9B', fontWeight: '600' },
  scanBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scanBadgeText: { ...typography.small, color: colors.primary, fontWeight: '600' },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.outlineVariant,
    padding: spacing.md, ...shadows.card,
  },
  cardHalf: { width: '47.5%' },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLabel: {
    ...typography.small, color: colors.onSurfaceVariant,
    fontWeight: '700', letterSpacing: 0.5, fontSize: 10,
  },
  cardInput: {
    ...typography.body, color: colors.onSurface,
    fontSize: 15, fontWeight: '600', padding: 0,
    borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
    paddingBottom: 4, minHeight: 28,
  },
  // Amount: KES + input in a row, no overlap
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 4, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, paddingBottom: 4 },
  currencyLabel: { ...typography.small, color: colors.primary, fontWeight: '700', fontSize: 11, lineHeight: 22 },
  amountInput: {
    flex: 1, ...typography.body, color: colors.primary,
    fontWeight: '700', fontSize: 15, padding: 0, minHeight: 28,
  },
  cardStaticValue: { ...typography.body, color: colors.onSurface, fontWeight: '600', fontSize: 14 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },

  // Retake
  retakeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    justifyContent: 'center', paddingVertical: 8, marginBottom: spacing.xs,
  },
  retakeText: { ...typography.small, color: colors.onSurfaceVariant, fontWeight: '500' },

  // Actions
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    flex: 1, height: 48, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: radius.xl, borderWidth: 2,
  },
  saveBtn: { borderColor: colors.secondary },
  deleteBtn: { borderColor: colors.error + '50' },
  actionBtnText: { ...typography.button },

  // Category sheet
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32, maxHeight: '60%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  sheetTitle: { ...typography.h3, fontWeight: '700', paddingHorizontal: spacing.containerMargin, paddingVertical: spacing.md },
  categoryItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: spacing.containerMargin, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
  },
  categoryItemText: { ...typography.body, flex: 1 },

  // Full-screen image preview
  previewModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  previewClose: { position: 'absolute', top: 56, right: 20, zIndex: 1, padding: 8 },
  previewImage: { width: '100%', height: '80%' },
});
