import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { email, password, fullName, token } = await req.json();
    if (!process.env.ADMIN_SETUP_TOKEN || token !== process.env.ADMIN_SETUP_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'email and password required' }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;

    const user = data.user;
    if (!user) throw new Error('User not returned');

    const { error: upsertErr } = await supabase.from('profiles').upsert({
      id: user.id,
      role: 'superadmin',
      full_name: fullName ?? 'Super Admin',
      email,
      status: 'active',
    });
    if (upsertErr) throw upsertErr;

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}


