import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured =
  !!process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'https://placeholder.supabase.co';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ── Auth helpers ──────────────────────────────────────────────

export async function signUpWithEmail({ email, password, fullName, businessName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, business_name: businessName },
    },
  });
  return { data, error };
}

export async function signUpWithPhone({ phone, password, fullName, businessName }) {
  const { data, error } = await supabase.auth.signUp({
    phone,
    password,
    options: {
      data: { full_name: fullName, business_name: businessName, phone },
    },
  });
  return { data, error };
}

export async function signInWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signInWithPhone({ phone, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ phone, password });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

// ── Profile helpers ───────────────────────────────────────────

export async function fetchUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
}

// ── Invoice helpers ───────────────────────────────────────────

export async function syncInvoiceToSupabase(invoice) {
  const { data, error } = await supabase
    .from('invoices')
    .upsert(invoice, { onConflict: 'local_id' })
    .select()
    .single();
  return { data, error };
}

export async function fetchInvoicesFromSupabase(userId) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function deleteInvoiceFromSupabase(invoiceId) {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId);
  return { error };
}

// ── Receipt helpers ───────────────────────────────────────────

export async function syncReceiptToSupabase(receipt) {
  const { data, error } = await supabase
    .from('receipts')
    .upsert(receipt, { onConflict: 'local_id' })
    .select()
    .single();
  return { data, error };
}

export async function fetchReceiptsFromSupabase(userId) {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  return { data, error };
}
