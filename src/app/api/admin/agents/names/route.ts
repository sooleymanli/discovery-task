import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, telegram_chat_id, role, status')
      .eq('role', 'agent')
      .eq('status', 'active')
      .order('full_name', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ agents: (data || []).map((a: any) => ({
      id: a.id,
      full_name: a.full_name,
      email: a.email,
      telegram_chat_id: a.telegram_chat_id,
    })) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


