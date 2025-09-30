import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('application_messages')
      .select('id, created_at, sender, body, author_role, author_user_id')
      .eq('application_id', id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ ok: true, messages: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { body } = await req.json();
    if (!body) return NextResponse.json({ error: 'Body required' }, { status: 400 });
    const supabase = createSupabaseServiceClient();

    // Determine author role from Authorization token (if provided)
    let author_role: 'superadmin' | 'agent' | null = null;
    let author_user_id: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: authData } = await supabase.auth.getUser(token);
      const user = authData?.user || null;
      if (user) {
        author_user_id = user.id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        if (profile?.role === 'superadmin' || profile?.role === 'agent') {
          author_role = profile.role;
        }
      }
    }

    const { error } = await supabase.from('application_messages').insert({
      application_id: id,
      sender: 'agent',
      body,
      author_user_id: author_user_id || null,
      author_role: author_role || null,
    } as any);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


