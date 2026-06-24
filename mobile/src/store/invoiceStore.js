import { create } from 'zustand';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import {
  getAllInvoices,
  createInvoice as sqliteCreateInvoice,
  updateInvoice as sqliteUpdateInvoice,
  deleteInvoice as sqliteDeleteInvoice,
  addToSyncQueue,
} from '../services/sqlite';
import {
  syncInvoiceToSupabase,
  deleteInvoiceFromSupabase,
} from '../services/supabase';

const useInvoiceStore = create((set, get) => ({
  invoices: [],
  isLoading: false,
  isSyncing: false,
  lastSyncedAt: null,
  error: null,

  loadInvoices: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const invoices = await getAllInvoices(userId);
      set({ invoices });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createInvoice: async ({ userId, clientName, clientEmail, clientPhone, items, dueDate, notes, taxRate = 0 }) => {
    set({ isLoading: true, error: null });
    try {
      const invoiceId = uuidv4();
      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;

      const existingCount = get().invoices.length;
      const invoiceNumber = `INV-${String(existingCount + 1).padStart(3, '0')}`;

      const invoice = {
        id: invoiceId,
        user_id: userId,
        invoice_number: invoiceNumber,
        client_name: clientName,
        client_email: clientEmail || null,
        client_phone: clientPhone || null,
        status: 'pending',
        issue_date: format(new Date(), 'yyyy-MM-dd'),
        due_date: dueDate || null,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        notes: notes || null,
        synced: 0,
      };

      const invoiceItems = items.map((item) => ({
        id: uuidv4(),
        invoice_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.amount,
      }));

      await sqliteCreateInvoice(invoice, invoiceItems);
      await addToSyncQueue({ id: uuidv4(), entity_type: 'invoice', entity_id: invoiceId, action: 'create' });

      set((state) => ({ invoices: [{ ...invoice, items: invoiceItems }, ...state.invoices] }));
      return { success: true, invoiceId };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  updateInvoice: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await sqliteUpdateInvoice(id, updates);
      await addToSyncQueue({ id: uuidv4(), entity_type: 'invoice', entity_id: id, action: 'update' });
      set((state) => ({
        invoices: state.invoices.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)),
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  deleteInvoice: async (id, isOnline = false) => {
    set({ isLoading: true, error: null });
    try {
      await sqliteDeleteInvoice(id);
      if (isOnline) {
        await deleteInvoiceFromSupabase(id);
      } else {
        await addToSyncQueue({ id: uuidv4(), entity_type: 'invoice', entity_id: id, action: 'delete' });
      }
      set((state) => ({ invoices: state.invoices.filter((inv) => inv.id !== id) }));
      return { success: true };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  syncToSupabase: async (userId) => {
    set({ isSyncing: true });
    try {
      const invoices = get().invoices.filter((inv) => !inv.synced);
      for (const invoice of invoices) {
        await syncInvoiceToSupabase({ ...invoice, user_id: userId, local_id: invoice.id });
        await sqliteUpdateInvoice(invoice.id, { synced: 1 });
      }
      set({ lastSyncedAt: new Date().toISOString() });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isSyncing: false });
    }
  },

  getTodayTotal: () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return get()
      .invoices.filter((inv) => inv.issue_date === today && inv.status !== 'draft')
      .reduce((sum, inv) => sum + inv.total, 0);
  },

  getPendingCount: () => get().invoices.filter((inv) => inv.status === 'pending').length,

  clearError: () => set({ error: null }),
}));

export default useInvoiceStore;
