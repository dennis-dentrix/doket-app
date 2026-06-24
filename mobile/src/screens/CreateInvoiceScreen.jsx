import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, 
  TextInput, ScrollView, StatusBar, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../hooks/useTheme';
import useAuthStore from '../store/authStore';
import useInvoiceStore from '../store/invoiceStore';
import useCurrency from '../hooks/useCurrency';

let _itemKey = 0;
const newItem = () => ({ key: String(++_itemKey), description: '', quantity: '1', unit_price: '' });

export default function CreateInvoiceScreen({ navigation }) {
  const { colors, typography, spacing, radius, shadows, isDark } = useTheme();
  const { user } = useAuthStore();
  const { createInvoice, isLoading } = useInvoiceStore();
  const { fmt, symbol, taxPresets, activeTaxIndex, setActiveTaxIndex, currency } = useCurrency();

  const styles = makeStyles(colors, spacing, radius, typography, shadows);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [invoiceDate] = useState(format(new Date(), 'd MMMM yyyy'));
  const [items, setItems] = useState([newItem()]);
  const [focused, setFocused] = useState(null);

  const taxRate = taxPresets[activeTaxIndex] ?? 0;

  const addItem = useCallback(() => setItems(prev => [...prev, newItem()]), []);
  const removeItem = useCallback((key) => setItems(prev => prev.filter(i => i.key !== key)), []);
  const updateItem = useCallback((key, field, value) => {
    setItems(prev => prev.map(i => i.key === key ? { ...i, [field]: value } : i));
  }, []);

  const subtotal = items.reduce((sum, i) => {
    const q = parseFloat(i.quantity) || 0;
    const p = parseFloat(i.unit_price) || 0;
    return sum + q * p;
  }, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const buildInvoicePayload = (status) => ({
    user_id: user?.id ?? 'dev-user-001',
    client_name: clientName.trim() || 'Unknown Client',
    client_phone: clientPhone.trim() || null,
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    status,
    items: items.map(i => {
      const q = parseFloat(i.quantity) || 0;
      const p = parseFloat(i.unit_price) || 0;
      return { description: i.description, quantity: q, unit_price: p, amount: q * p };
    }),
    subtotal, tax_rate: taxRate, tax_amount: taxAmount, total,
    notes: '',
  });

  const handleSaveAsDraft = async () => {
    const result = await createInvoice(buildInvoicePayload('draft'));
    if (result?.success) navigation.navigate('InvoicePreview', { invoiceId: result.id });
    else Alert.alert('Error', result?.error ?? 'Failed to save');
  };

  const handlePreviewAndShare = async () => {
    const result = await createInvoice(buildInvoicePayload('pending'));
    if (result?.success) navigation.navigate('InvoicePreview', { invoiceId: result.id });
    else Alert.alert('Error', result?.error ?? 'Failed to save');
  };

  const handleGenerateMpesa = () => {
    Alert.alert('M-Pesa', 'M-Pesa integration coming soon.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Invoice</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* CLIENT DETAILS */}
        <Text style={styles.sectionLabel}>CLIENT DETAILS</Text>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Client Name</Text>
          <TextInput
            style={[styles.input, focused === 'client' && styles.inputFocused]}
            placeholder="e.g. ABC Trading Co."
            placeholderTextColor={colors.outline}
            value={clientName}
            onChangeText={setClientName}
            onFocus={() => setFocused('client')}
            onBlur={() => setFocused(null)}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Client Phone</Text>
          <TextInput
            style={[styles.input, focused === 'phone' && styles.inputFocused]}
            placeholder="0712 345 678"
            placeholderTextColor={colors.outline}
            value={clientPhone}
            onChangeText={setClientPhone}
            onFocus={() => setFocused('phone')}
            onBlur={() => setFocused(null)}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Invoice Date</Text>
          <View style={[styles.input, styles.inputReadonly]}>
            <Text style={styles.inputText}>{invoiceDate}</Text>
            <Ionicons name="calendar-outline" size={18} color={colors.secondary} />
          </View>
        </View>

        {/* LINE ITEMS */}
        <Text style={[styles.sectionLabel, { marginTop: spacing.md }]}>LINE ITEMS</Text>

        {items.map((item, index) => (
          <LineItemRow
            key={item.key}
            item={item}
            focused={focused}
            onFocus={setFocused}
            onBlur={() => setFocused(null)}
            onChange={updateItem}
            onRemove={() => removeItem(item.key)}
            canRemove={items.length > 1}
            colors={colors}
            styles={styles}
            spacing={spacing}
            fmt={fmt}
          />
        ))}

        <TouchableOpacity style={styles.addItemBtn} onPress={addItem} activeOpacity={0.7}>
          <Ionicons name="add" size={18} color={colors.primary} />
          <Text style={styles.addItemText}>Add Item</Text>
        </TouchableOpacity>

        {/* Tax */}
        <View style={styles.taxRow}>
          <Text style={styles.fieldLabel}>Tax</Text>
          <View style={styles.taxChips}>
            {taxPresets.map((rate, index) => (
              <TouchableOpacity
                key={rate}
                style={[styles.taxChip, activeTaxIndex === index && styles.taxChipActive]}
                onPress={() => setActiveTaxIndex(index)}
              >
                <Text style={[styles.taxChipText, activeTaxIndex === index && styles.taxChipTextActive]}>
                  {rate}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{fmt(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax ({taxRate}%)</Text>
            <Text style={styles.summaryValue}>{fmt(taxAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalAmount}>{fmt(total)}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.draftBtn}
            onPress={handleSaveAsDraft}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.draftBtnText}>Save as Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.previewBtn}
            onPress={handlePreviewAndShare}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.previewBtnText}>Preview & Share</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.mpesaBtn}
          onPress={handleGenerateMpesa}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          <Ionicons name="phone-portrait-outline" size={20} color="#fff" />
          <Text style={styles.mpesaBtnText}>
            {currency.paymentMethod === 'mpesa' ? 'GENERATE M-PESA LINK' : 'GENERATE PAYMENT LINK'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function LineItemRow({ item, focused, onFocus, onBlur, onChange, onRemove, canRemove, colors, styles, spacing, fmt }) {
  const fKey = (f) => `${item.key}-${f}`;
  const qty = parseFloat(item.quantity) || 0;
  const price = parseFloat(item.unit_price) || 0;
  const amount = qty * price;

  return (
    <View style={styles.lineItemCard}>
      <View style={styles.lineItemTop}>
        {/* Description */}
        <TextInput
          style={[styles.lineItemDesc, focused === fKey('desc') && styles.inputFocused]}
          placeholder="Description"
          placeholderTextColor={colors.outline}
          value={item.description}
          onChangeText={(v) => onChange(item.key, 'description', v)}
          onFocus={() => onFocus(fKey('desc'))}
          onBlur={onBlur}
          autoCapitalize="sentences"
        />
        {/* Qty */}
        <TextInput
          style={[styles.lineItemQty, focused === fKey('qty') && styles.inputFocused]}
          placeholder="1"
          placeholderTextColor={colors.outline}
          value={item.quantity}
          onChangeText={(v) => onChange(item.key, 'quantity', v)}
          onFocus={() => onFocus(fKey('qty'))}
          onBlur={onBlur}
          keyboardType="decimal-pad"
          textAlign="center"
        />
        {/* Price */}
        <TextInput
          style={[styles.lineItemPrice, focused === fKey('price') && styles.inputFocused]}
          placeholder="0"
          placeholderTextColor={colors.outline}
          value={item.unit_price}
          onChangeText={(v) => onChange(item.key, 'unit_price', v)}
          onFocus={() => onFocus(fKey('price'))}
          onBlur={onBlur}
          keyboardType="decimal-pad"
          textAlign="right"
        />
        {/* Delete */}
        {canRemove && (
          <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ paddingLeft: 6 }}>
            <Ionicons name="close" size={18} color={colors.outline} />
          </TouchableOpacity>
        )}
      </View>
      {amount > 0 && (
        <Text style={styles.lineItemAmount}>
          {fmt(amount)}
        </Text>
      )}
    </View>
  );
}

const makeStyles = (colors, spacing, radius, typography, shadows) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.containerMargin, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
  },
  headerTitle: { ...typography.h3, color: colors.secondary, fontWeight: '700' },

  scroll: { paddingHorizontal: spacing.containerMargin, paddingVertical: spacing.md, paddingBottom: 40 },

  sectionLabel: {
    ...typography.small, color: colors.primary, fontWeight: '700',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: spacing.sm,
  },

  field: { marginBottom: spacing.md },
  fieldLabel: { ...typography.small, color: colors.primary, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: colors.outlineVariant, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 13,
    ...typography.body, color: colors.onSurface, backgroundColor: colors.surface,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  inputFocused: { borderColor: colors.primary, borderWidth: 1.5 },
  inputReadonly: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputText: { ...typography.body, color: colors.onSurface },

  // Line items
  lineItemCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.outlineVariant, padding: spacing.sm, marginBottom: spacing.sm,
  },
  lineItemTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lineItemDesc: {
    flex: 1, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.sm,
    paddingHorizontal: 10, paddingVertical: 9, ...typography.body, color: colors.onSurface,
    backgroundColor: colors.background,
  },
  lineItemQty: {
    width: 48, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.sm,
    paddingHorizontal: 6, paddingVertical: 9, ...typography.body, color: colors.onSurface,
    backgroundColor: colors.background,
  },
  lineItemPrice: {
    width: 80, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.sm,
    paddingHorizontal: 8, paddingVertical: 9, ...typography.body, color: colors.onSurface,
    backgroundColor: colors.background,
  },
  lineItemAmount: {
    ...typography.small, color: colors.primary, fontWeight: '600',
    textAlign: 'right', marginTop: 6,
  },

  addItemBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.md, paddingVertical: 4 },
  addItemText: { ...typography.body, color: colors.primary, fontWeight: '600' },

  taxRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  taxChips: { flexDirection: 'row', gap: spacing.sm },
  taxChip: {
    paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.outlineVariant, backgroundColor: colors.surface,
  },
  taxChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  taxChipText: { ...typography.small, color: colors.onSurfaceVariant, fontWeight: '600' },
  taxChipTextActive: { color: colors.primary },

  summaryCard: {
    backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.md,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { ...typography.body, color: 'rgba(255,255,255,0.8)' },
  summaryValue: { ...typography.body, color: '#fff', fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.3)' },
  totalLabel: { ...typography.bodyMedium, color: '#fff', fontWeight: '800', letterSpacing: 0.5 },
  totalAmount: { fontSize: 22, fontWeight: '800', color: '#fff' },

  actionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  draftBtn: {
    flex: 1, borderWidth: 1.5, borderColor: colors.secondary, borderRadius: radius.full,
    paddingVertical: 13, alignItems: 'center', backgroundColor: colors.surface,
  },
  draftBtnText: { ...typography.button, color: colors.secondary },
  previewBtn: {
    flex: 1, backgroundColor: colors.secondary, borderRadius: radius.full,
    paddingVertical: 13, alignItems: 'center',
  },
  previewBtnText: { ...typography.button, color: '#fff' },
  mpesaBtn: {
    backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  mpesaBtnText: { ...typography.button, color: '#fff', letterSpacing: 0.5 },
});
