import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function createSupabaseServerClient({ cookies }: { cookies: { get?: (name: string) => { value?: string } | string | undefined; set?: (name: string, value: string, options: CookieOptions) => void; remove?: (name: string, options: CookieOptions) => void } }): SupabaseClient {
  const get = (name: string) => {
    try {
      const v = cookies?.get?.(name);
      return typeof v === 'string' ? v : v?.value;
    } catch {
      return undefined;
    }
  };
  const set = (name: string, value: string, options: CookieOptions) => {
    try {
      cookies?.set?.(name, value, options);
    } catch {}
  };
  const remove = (name: string, options: CookieOptions) => {
    try {
      cookies?.remove?.(name, options);
    } catch {}
  };

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get, set, remove },
    }
  );
  return client as unknown as SupabaseClient;
}

// Server-only client using Service Role key (bypasses RLS). Never expose this to client.
export function createSupabaseServiceClient(): SupabaseClient {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase env missing: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) as unknown as SupabaseClient;
}
