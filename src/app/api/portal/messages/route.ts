import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { applicationId, email } = await req.json();
    if (!applicationId || !email) return NextResponse.json({ error: 'Missing inputs' }, { status: 400 });

    const supabase = createSupabaseServiceClient();
    const { data: app, error: appErr } = await supabase
      .from('applications')
      .select('id')
      .eq('id', applicationId)
      .eq('email', email)
      .maybeSingle();
    if (appErr) throw appErr;
    if (!app) return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 });

    const { data: messages, error: msgErr } = await supabase
      .from('application_messages')
      .select('id, created_at, sender, body, author_role')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true });
    if (msgErr) throw msgErr;

    return NextResponse.json({ ok: true, messages: messages || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


