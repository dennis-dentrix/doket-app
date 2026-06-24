import { create } from 'zustand';
import {
  signUpWithPhone,
  signUpWithEmail,
  signInWithPhone,
  signInWithEmail,
  signOut as supabaseSignOut,
  getSession,
  fetchUserProfile,
  isSupabaseConfigured,
} from '../services/supabase';

const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  session: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true });
    try {
      if (!isSupabaseConfigured) {
        set({ isInitialized: true });
        return;
      }
      const { session } = await getSession();
      if (session?.user) {
        const { data: profile } = await fetchUserProfile(session.user.id);
        set({ session, user: session.user, profile, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch (error) {
      set({ error: error.message, isInitialized: true });
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async ({ email, phone, password, fullName, businessName }) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = email
        ? await signUpWithEmail({ email, password, fullName, businessName })
        : await signUpWithPhone({ phone, password, fullName, businessName });
      if (error) throw error;
      set({ session: data.session, user: data.user });
      return { success: true };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async ({ email, phone, password }) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = email
        ? await signInWithEmail({ email, password })
        : await signInWithPhone({ phone, password });
      if (error) throw error;
      const { data: profile } = await fetchUserProfile(data.user.id);
      set({ session: data.session, user: data.user, profile });
      return { success: true };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await supabaseSignOut();
      set({ user: null, profile: null, session: null });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    // Merge updates into local profile immediately (optimistic)
    const current = useAuthStore.getState().profile ?? {};
    const next = { ...current, ...updates };
    set({ profile: next });
    // Persist to Supabase if available
    try {
      const { updateUserProfile } = await import('../services/supabase');
      const user = useAuthStore.getState().user;
      if (user?.id) await updateUserProfile(user.id, updates);
    } catch (_) {
      // offline — changes stay local until next sync
    }
  },

  // DEV ONLY — bypass auth to explore screens
  devBypass: () => {
    set({
      user: { id: 'dev-user-001', email: 'dev@doket.app' },
      profile: { full_name: 'Dennis Kariuki', business_name: 'Doket Dev', phone: '+254712345678' },
      session: { access_token: 'dev-token' },
      isInitialized: true,
    });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
