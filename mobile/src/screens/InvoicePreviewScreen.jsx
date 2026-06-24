import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity,  StatusBar, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../hooks/useTheme';
import useInvoiceStore from '../store/invoiceStore';
import useCurrency from '../hooks/useCurrency';

export default function InvoicePreviewScreen({ route, navigation }) {
  const { invoiceId } = route.params ?? {};
  const { invoices, deleteInvoice } = useInvoiceStore();
  const { colors, typography, spacing, radius, shadows, isDark } = useTheme();
  const { fmt, currency } = useCurrency();
  const s = makeStyles(colors, spacing, radius, typography, shadows);

  const invoice = invoices.find((inv) => inv.id === invoiceId) ?? {
    invoice_number: 'INV-001',
    client_name: 'ABC Trading Ltd',
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    items: [
      { description: 'Consulting Services', quantity: 1, unit_price: 50000, amount: 50000 },
      { description: 'UI/UX Design', quantity: 1, unit_price: 25000, amount: 25000 },
    ],
    subtotal: 75000, tax_rate: 0, tax_amount: 0, total: 75000,
    notes: 'Payment is due within 15 days. Thank you for your business!',
  };

  const handleDelete = () => {
    Alert.alert('Delete Invoice', 'Are you sure you want to delete this invoice?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteInvoice(invoice.id); navigation.goBack(); } },
    ]);
  };

  const formatKES = (amount) => fmt(amount);
  const issueDate = invoice.issue_date ? format(new Date(invoice.issue_date), 'd MMMM yyyy') : format(new Date(), 'd MMMM yyyy');

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{invoice.invoice_number}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.document}>
          <View style={s.docHeader}>
            <View>
              <Text style={s.docBrand}>Doket</Text>
              <Text style={s.docTagline}>Professional Invoicing, Worldwide</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.docInvoiceWord}>INVOICE</Text>
              <Text style={s.docInvoiceNum}>#{invoice.invoice_number}</Text>
            </View>
          </View>

          <View style={s.docMeta}>
            <View>
              <Text style={s.docMetaLabel}>BILL TO:</Text>
              <Text style={s.docClientName}>{invoice.client_name}</Text>
              {invoice.client_phone && <Text style={s.docMetaValue}>{invoice.client_phone}</Text>}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.docMetaLabel}>DATE:</Text>
              <Text style={s.docMetaValue}>{issueDate}</Text>
            </View>
          </View>

          <View style={s.divider} />

          <View style={s.itemsHeader}>
            <Text style={[s.itemsHeaderText, { flex: 1 }]}>Description</Text>
            <Text style={s.itemsHeaderText}>Amount ({currency.code})</Text>
          </View>

          {(invoice.items ?? []).map((item, i) => (
            <View key={i} style={s.lineItem}>
              <View style={{ flex: 1 }}>
                <Text style={s.lineItemDesc}>{item.description}</Text>
                {item.quantity !== 1 && <Text style={s.lineItemMeta}>Qty: {item.quantity}</Text>}
              </View>
              <Text style={s.lineItemAmount}>{formatKES(item.amount)}</Text>
            </View>
          ))}

          <View style={s.divider} />

          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Subtotal</Text>
            <Text style={s.summaryValue}>{formatKES(invoice.subtotal)}</Text>
          </View>
          {invoice.tax_rate > 0 && (
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Tax ({invoice.tax_rate}%)</Text>
              <Text style={s.summaryValue}>{formatKES(invoice.tax_amount)}</Text>
            </View>
          )}

          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalAmount}>{formatKES(invoice.total)}</Text>
          </View>

          {invoice.notes && <Text style={s.notes}>{invoice.notes}</Text>}
        </View>

        <TouchableOpacity style={s.mpesaButton} activeOpacity={0.85}>
          <Ionicons name="phone-portrait-outline" size={20} color="#fff" />
          <Text style={s.mpesaButtonText}>
            {currency.paymentMethod === 'mpesa' ? 'Generate M-Pesa Link' : 'Generate Payment Link'}
          </Text>
        </TouchableOpacity>

        <View style={s.actionRow}>
          <TouchableOpacity style={s.actionButton} activeOpacity={0.85}>
            <Ionicons name="share-outline" size={18} color={colors.secondary} />
            <Text style={s.actionButtonText}>Share PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionButton} onPress={() => navigation.navigate('Create')} activeOpacity={0.85}>
            <Ionicons name="create-outline" size={18} color={colors.secondary} />
            <Text style={s.actionButtonText}>Edit Invoice</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.deleteButton} onPress={handleDelete} activeOpacity={0.85}>
          <Ionicons name="trash-outline" size={16} color={colors.error} />
          <Text style={s.deleteButtonText}>Delete Invoice</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors, spacing, radius, typography, shadows) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.containerMargin, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
  },
  backArrow: { ...typography.h3, color: colors.secondary },
  headerTitle: { ...typography.h3, color: colors.secondary },
  scroll: { padding: spacing.containerMargin, paddingBottom: spacing.xl, gap: spacing.md },
  document: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadows.card },
  docHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  docBrand: { ...typography.h3, color: colors.primary },
  docTagline: { ...typography.small, color: colors.onSurfaceVariant },
  docInvoiceWord: { ...typography.small, color: colors.secondary, letterSpacing: 2, fontWeight: '700' },
  docInvoiceNum: { ...typography.label, color: colors.secondary },
  docMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  docMetaLabel: { ...typography.small, color: colors.onSurfaceVariant, marginBottom: 2 },
  docClientName: { ...typography.bodyMedium, color: colors.onSurface, fontWeight: '700' },
  docMetaValue: { ...typography.body, color: colors.onSurface },
  divider: { height: 1, backgroundColor: colors.outlineVariant, marginVertical: spacing.sm },
  itemsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  itemsHeaderText: { ...typography.small, color: colors.onSurfaceVariant },
  lineItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: spacing.sm },
  lineItemDesc: { ...typography.bodyMedium, color: colors.onSurface, fontWeight: '600' },
  lineItemMeta: { ...typography.small, color: colors.onSurfaceVariant },
  lineItemAmount: { ...typography.body, color: colors.onSurface },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { ...typography.body, color: colors.onSurfaceVariant },
  summaryValue: { ...typography.body, color: colors.onSurface },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  totalLabel: { ...typography.h3, color: colors.secondary },
  totalAmount: { ...typography.h3, color: colors.primary },
  notes: { ...typography.small, color: colors.onSurfaceVariant, marginTop: spacing.md, fontStyle: 'italic' },
  mpesaButton: { backgroundColor: colors.secondary, borderRadius: radius.lg, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  mpesaButtonText: { ...typography.button, color: '#fff', fontSize: 15 },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderWidth: 1.5, borderColor: colors.secondary, borderRadius: radius.full, paddingVertical: 13, backgroundColor: colors.surface },
  actionButtonText: { ...typography.button, color: colors.secondary },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.sm },
  deleteButtonText: { ...typography.body, color: colors.error },
});
