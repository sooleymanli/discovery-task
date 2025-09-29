import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;

    // profiles has on delete cascade; no extra delete needed
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}


