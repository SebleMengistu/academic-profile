import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../config';

if (!config.supabase.url || !config.supabase.serviceKey) {
  console.warn('[Supabase] SUPABASE_URL or SUPABASE_SERVICE_KEY not set — running without database');
}

/**
 * Service-role client — bypasses RLS, used only on the server.
 * Never expose this key to the client.
 */
export const supabase: SupabaseClient = createClient(
  config.supabase.url || 'https://placeholder.supabase.co',
  config.supabase.serviceKey || 'placeholder',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Thin helper — throws on Supabase errors so controllers can use try/catch
 * without checking `error` on every single query.
 */
export async function sbQuery<T>(
  queryPromise: Promise<{ data: T | null; error: unknown }>
): Promise<T> {
  const { data, error } = await queryPromise;
  if (error) throw error;
  return data as T;
}

export default supabase;
