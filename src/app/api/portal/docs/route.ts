import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const applicationId = String(form.get('applicationId') || '');
    const email = String(form.get('email') || '');
    const file = form.get('file') as File | null;
    if (!applicationId || !email || !file) return NextResponse.json({ error: 'Missing inputs' }, { status: 400 });

    const supabase = createSupabaseServiceClient();
    const { data: app, error } = await supabase
      .from('applications')
      .select('id')
      .eq('id', applicationId)
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    if (!app) return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 });

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const path = `${applicationId}/${Date.now()}_${file.name}`;

    // Upload to storage bucket (assumes bucket exists)
    const { data: uploadData, error: upErr } = await (supabase as any).storage
      .from('application-docs')
      .upload(path, bytes, { contentType: file.type });
    if (upErr) throw upErr;

    const { error: insErr } = await supabase.from('application_documents').insert({
      application_id: applicationId,
      file_name: file.name,
      storage_path: path,
    });
    if (insErr) throw insErr;

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


