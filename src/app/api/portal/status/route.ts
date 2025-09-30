import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { applicationId, email } = await req.json();
    if (!applicationId || !email) return NextResponse.json({ error: 'Missing inputs' }, { status: 400 });

    const supabase = createSupabaseServiceClient();
    const { data: app, error } = await supabase
      .from('applications')
      .select('id, status, full_name, email, created_at, assigned_agent_id')
      .eq('id', applicationId)
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    if (!app) return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 });

    // agent info (optional)
    let agent: { full_name: string | null; email: string | null } | null = null;
    if (app.assigned_agent_id) {
      const { data: ag } = await supabase.from('profiles').select('full_name, email').eq('id', app.assigned_agent_id).maybeSingle();
      agent = ag || null;
    }

    return NextResponse.json({ ok: true, application: app, agent });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


