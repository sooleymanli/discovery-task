import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, telegram_chat_id, status, role, created_at')
      .eq('role', 'agent')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ agents: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


