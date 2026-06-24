import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, 
  StatusBar, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../hooks/useTheme';
import useAuthStore from '../store/authStore';
import useInvoiceStore from '../store/invoiceStore';
import useCurrency from '../hooks/useCurrency';
import DoketLogo from '../components/DoketLogo';

export default function DashboardScreen({ navigation }) {
  const { colors, typography, spacing, radius, shadows, isDark } = useTheme();
  const { user } = useAuthStore();
  const { invoices, isLoading, isSyncing, lastSyncedAt, loadInvoices, getTodayTotal, getPendingCount } = useInvoiceStore();
  const { fmt } = useCurrency();
  const s = makeStyles(colors, spacing, radius, typography, shadows);

  useEffect(() => {
    if (user?.id) loadInvoices(user.id);
  }, [user?.id]);

  const todayTotal = getTodayTotal();
  const pendingCount = getPendingCount();
  const recentInvoices = invoices.slice(0, 5);
  const syncTime = lastSyncedAt ? `${format(new Date(lastSyncedAt), 'h:mm a')}` : null;
  const syncLabel = syncTime ? `Synced · ${syncTime}` : 'Not synced yet';

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.logoRow}>
          <DoketLogo size={32} />
          <Text style={s.logoText}>Doket</Text>
        </View>
        <TouchableOpacity style={s.syncBadge}>
          <Ionicons name={isSyncing ? 'sync' : 'checkmark'} size={12} color={colors.success} />
          <Text style={s.syncBadgeText}>{isSyncing ? 'Syncing…' : 'Synced'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Sync label */}
        <View style={s.syncRow}>
          <Ionicons name="checkmark" size={12} color={colors.success} />
          <Text style={s.syncLabel}>{syncLabel}</Text>
        </View>

        {/* Today's total card */}
        <View style={s.totalCard}>
          <Text style={s.totalCardLabel}>Today's Total</Text>
          <Text style={s.totalCardAmount}>
            {fmt(todayTotal)}
          </Text>
          <Text style={s.totalCardSub}>
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} · {invoices.filter(i => i.status === 'paid').length} paid today
          </Text>
        </View>

        {/* Stat row */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statLabel}>Pending</Text>
            <Text style={s.statValue}>{pendingCount} invoice{pendingCount !== 1 ? 's' : ''}</Text>
          </View>
          <View style={[s.statCard, { marginLeft: spacing.sm }]}>
            <Text style={s.statLabel}>Last Sync</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={s.statValue}>{syncTime ?? '—'}</Text>
              {syncTime && <Ionicons name="checkmark" size={14} color={colors.success} />}
            </View>
          </View>
        </View>

        {/* Recent Invoices */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Recent Invoices</Text>
          <TouchableOpacity><Text style={s.seeAll}>See all</Text></TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : recentInvoices.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="document-outline" size={48} color={colors.outlineVariant} />
            <Text style={s.emptyText}>No invoices yet</Text>
            <Text style={s.emptySubtext}>Tap Create to make your first invoice.</Text>
          </View>
        ) : (
          recentInvoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} s={s} colors={colors} navigation={navigation} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InvoiceCard({ invoice, s, colors, navigation }) {
  const isPaid = invoice.status === 'paid';
  const isPending = invoice.status === 'pending';
  const statusDotColor = isPaid ? colors.success : isPending ? colors.primary : colors.outline;

  return (
    <TouchableOpacity
      style={s.invoiceCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('InvoicePreview', { invoiceId: invoice.id })}
    >
      <View style={s.invoiceAccent} />
      <View style={s.invoiceBody}>
        <View style={s.invoiceTopRow}>
          <Text style={s.invoiceClient}>{invoice.client_name}</Text>
          <Text style={s.invoiceAmount}>
            {fmt(invoice.total)}
          </Text>
        </View>
        <View style={s.invoiceMetaRow}>
          {invoice.status !== 'draft' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {isPaid
                ? <Ionicons name="checkmark-circle" size={13} color={colors.success} />
                : <View style={[s.statusDot, { backgroundColor: statusDotColor }]} />}
              <Text style={[s.statusLabel, { color: statusDotColor }]}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </Text>
            </View>
          )}
          <Text style={s.invoiceMetaText}>
            {invoice.status === 'draft' ? 'Draft' : ''}
            {invoice.invoice_number ? ` · ${invoice.invoice_number}` : ''}
          </Text>
        </View>
        <View style={s.invoiceActions}>
          <TouchableOpacity style={s.sendBtn}>
            <Text style={s.sendBtnText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.payBtn, isPaid && s.payBtnDisabled]}
            disabled={isPaid}
          >
            <Text style={[s.payBtnText, isPaid && s.payBtnTextDisabled]}>Pay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (colors, spacing, radius, typography, shadows) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.containerMargin, paddingTop: spacing.sm, paddingBottom: spacing.xs,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoText: { ...typography.h3, color: colors.secondary, fontWeight: '800' },
  syncBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  syncBadgeText: { ...typography.small, color: colors.success, fontWeight: '600' },

  scroll: { paddingHorizontal: spacing.containerMargin, paddingBottom: spacing.xl },

  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.md },
  syncLabel: { ...typography.small, color: colors.success },

  totalCard: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
  },
  totalCardLabel: { ...typography.small, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  totalCardAmount: { fontSize: 34, fontWeight: '800', color: '#fff', marginBottom: 6 },
  totalCardSub: { ...typography.small, color: 'rgba(255,255,255,0.75)' },

  statsRow: { flexDirection: 'row', marginBottom: spacing.lg },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.outlineVariant, ...shadows.card,
  },
  statLabel: { ...typography.small, color: colors.onSurfaceVariant, marginBottom: 4 },
  statValue: { ...typography.bodyMedium, color: colors.secondary, fontWeight: '700' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: { ...typography.h3, color: colors.secondary },
  seeAll: { ...typography.body, color: colors.primary, fontWeight: '600' },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyText: { ...typography.bodyMedium, color: colors.onSurface, fontWeight: '700' },
  emptySubtext: { ...typography.small, color: colors.onSurfaceVariant },

  invoiceCard: {
    flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg,
    marginBottom: spacing.sm, overflow: 'hidden', ...shadows.card,
  },
  invoiceAccent: { width: 4, backgroundColor: colors.secondary },
  invoiceBody: { flex: 1, padding: spacing.md },
  invoiceTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  invoiceClient: { ...typography.bodyMedium, color: colors.onSurface, fontWeight: '700', flex: 1 },
  invoiceAmount: { ...typography.bodyMedium, color: colors.secondary, fontWeight: '700' },
  invoiceMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { ...typography.small, fontWeight: '600' },
  invoiceMetaText: { ...typography.small, color: colors.onSurfaceVariant },
  invoiceActions: { flexDirection: 'row', gap: spacing.sm },
  sendBtn: {
    flex: 1, borderWidth: 1.5, borderColor: colors.secondary, borderRadius: radius.full,
    paddingVertical: 7, alignItems: 'center',
  },
  sendBtnText: { ...typography.button, color: colors.secondary, fontSize: 13 },
  payBtn: {
    flex: 1, backgroundColor: colors.primary, borderRadius: radius.full,
    paddingVertical: 7, alignItems: 'center',
  },
  payBtnDisabled: { backgroundColor: colors.surfaceVariant },
  payBtnText: { ...typography.button, color: '#fff', fontSize: 13 },
  payBtnTextDisabled: { color: colors.outline },
});
