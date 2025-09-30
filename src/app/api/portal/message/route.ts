import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { applicationId, email, body } = await req.json();
    if (!applicationId || !email || !body) return NextResponse.json({ error: 'Missing inputs' }, { status: 400 });
    const supabase = createSupabaseServiceClient();
    const { data: app, error } = await supabase
      .from('applications')
      .select('id')
      .eq('id', applicationId)
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    if (!app) return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 });

    const { error: insErr } = await supabase.from('application_messages').insert({
      application_id: applicationId,
      sender: 'applicant',
      body,
    });
    if (insErr) throw insErr;
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


