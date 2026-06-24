import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity,  StatusBar, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../hooks/useTheme';
import useCurrency from '../hooks/useCurrency';

const MOCK_RECEIPTS = [
  { id: '1', vendor: 'Safaricom', amount: 2500, date: '2026-06-18', category: 'Communications', synced: true },
  { id: '2', vendor: 'Equity Bank', amount: 500, date: '2026-06-17', category: 'Banking', synced: true },
  { id: '3', vendor: 'Coffee Shop', amount: 450, date: '2026-06-15', category: 'Meals', synced: false },
];

export default function ReceiptsScreen({ navigation }) {
  const { colors, typography, spacing, radius, shadows, isDark } = useTheme();
  const { fmt } = useCurrency();
  const s = makeStyles(colors, spacing, radius, typography, shadows);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <FlatList
        data={MOCK_RECEIPTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        ListHeaderComponent={
          <View>
            {/* Page title */}
            <Text style={s.pageTitle}>Receipts</Text>

            {/* Scan button */}
            <TouchableOpacity
              style={s.scanButton}
              onPress={() => navigation.navigate('ReceiptScanner')}
              activeOpacity={0.85}
            >
              <Ionicons name="camera-outline" size={20} color="#fff" />
              <Text style={s.scanButtonText}>Scan New Receipt</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => <ReceiptCard receipt={item} colors={colors} s={s} fmt={fmt} onPress={() => navigation.navigate('ReceiptDetail', { imageUri: item.imageUri ?? null })} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function ReceiptCard({ receipt, colors, s, fmt, onPress }) {
  return (
    <TouchableOpacity style={s.card} activeOpacity={0.8} onPress={onPress}>
      {/* Camera placeholder */}
      <View style={s.cardThumb}>
        <Ionicons name="camera-outline" size={22} color={colors.outline} />
      </View>

      {/* Info */}
      <View style={s.cardBody}>
        <Text style={s.cardVendor}>{receipt.vendor}</Text>
        <Text style={s.cardDate}>{format(new Date(receipt.date), 'd MMMM yyyy')}</Text>
      </View>

      {/* Amount + sync */}
      <View style={s.cardRight}>
        <Text style={s.cardAmount}>{fmt(receipt.amount)}</Text>
        {!receipt.synced && (
          <View style={s.pendingBadge}>
            <Text style={s.pendingBadgeText}>Pending</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (colors, spacing, radius, typography, shadows) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  list: { paddingHorizontal: spacing.containerMargin, paddingBottom: spacing.xl },

  pageTitle: {
    ...typography.h1, color: colors.secondary, fontWeight: '800',
    marginTop: spacing.md, marginBottom: spacing.lg,
  },

  scanButton: {
    backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, marginBottom: spacing.lg,
  },
  scanButtonText: { ...typography.button, color: '#fff', fontSize: 15 },

  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm,
    gap: spacing.md, ...shadows.card,
  },
  cardThumb: {
    width: 52, height: 52, backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.outlineVariant,
  },
  cardBody: { flex: 1 },
  cardVendor: { ...typography.bodyMedium, color: colors.secondary, fontWeight: '700', marginBottom: 3 },
  cardDate: { ...typography.small, color: colors.onSurfaceVariant },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  cardAmount: { ...typography.bodyMedium, color: colors.secondary, fontWeight: '700' },
  pendingBadge: {
    backgroundColor: colors.primary + '18', borderRadius: radius.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  pendingBadgeText: { ...typography.small, color: colors.primary, fontWeight: '600', fontSize: 11 },
});
