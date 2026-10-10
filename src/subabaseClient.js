import { createClient } from '@supabase/supabase-js';

// Supabase Connection Credentials (can be updated here anytime)
export const SUPABASE_URL = 'https://eflfvugtdhvqkxahwmsh.supabase.co/rest/v1/';
export const SUPABASE_PUBLIC_KEY = 'sb_publishable_JzabOuH11Hn4JP4G4yOcnw_3ZP70kAk';

// Standard base URL formatted for @supabase/supabase-js client (removes /rest/v1/ suffix if present)
export const SUPABASE_BASE_URL = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

/**
 * Initialized Supabase Client instance
 */
export const supabase = createClient(SUPABASE_BASE_URL, SUPABASE_PUBLIC_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Utility function to test active connection to Supabase
 * @returns {Promise<{connected: boolean, message: string, error?: any}>}
 */
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('categories').select('id').limit(1);
    if (error) {
      return {
        connected: false,
        message: `Connected to host but query failed: ${error.message}`,
        error,
      };
    }
    return {
      connected: true,
      message: 'Supabase connected successfully! Database tables are live and accessible.',
      data,
    };
  } catch (err) {
    return {
      connected: false,
      message: `Failed to connect to Supabase: ${err.message || err}`,
      error: err,
    };
  }
}

export default supabase;
