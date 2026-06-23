// services/supabase.js — the Supabase client for the Medira app (project: medira).
// Single source of truth for the URL + key, with React-Native session persistence.
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://bjxhnkwgtnkxyotzdzcw.supabase.co';
// publishable key — safe to ship; RLS + the server-side AI key do the real protection
export const SUPABASE_ANON_KEY = 'sb_publishable_ZXkAUu3AaCNGc1qXaMCR1w_LDC_lrfn';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,          // keeps the user logged in across app restarts
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,      // RN has no URL to parse
  },
});
