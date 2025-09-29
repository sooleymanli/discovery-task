import { NextResponse } from 'next/server';
import { createSupabaseServiceClient, createSupabaseServerClient } from '@/lib/supabase';
import { cookies as nextCookies } from 'next/headers';
import { sendMail } from '@/lib/email';
import { notifyStatusChange } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const { applicationId, status, reason } = await req.json();
    if (!applicationId || !status) return NextResponse.json({ error: 'applicationId and status required' }, { status: 400 });

    const cookieStore = await nextCookies();
    const authed = createSupabaseServerClient({ cookies: cookieStore as any });
    const { data: userData } = await authed.auth.getUser();

    const supabase = createSupabaseServiceClient();
    
    // Get current application data
    const { data: application } = await supabase
      .from('applications')
      .select('status, full_name, assigned_agent_id')
      .eq('id', applicationId)
      .single();
    
    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    
    const { error } = await supabase
      .from('applications')
      .update({ status, status_changed_at: new Date().toISOString(), notes: reason ?? null })
      .eq('id', applicationId);
    if (error) throw error;

    // Create notification for status change
    // Get the user who is changing the status
    const { data: changerProfile } = await supabase.from('profiles').select('role, full_name, email').eq('id', userData?.user?.id ?? '').single();
    
    await notifyStatusChange(
      applicationId, 
      application.full_name, 
      application.status, 
      status, 
      changerProfile?.role === 'agent' ? userData?.user?.id : application.assigned_agent_id
    );

    // Notify superadmin if changer is agent
    if (changerProfile?.role === 'agent') {
      const { data: superadmins } = await supabase.from('profiles').select('email').eq('role', 'superadmin');
      const toList = (superadmins ?? []).map((s: any) => s.email).filter(Boolean);
      if (toList.length > 0) {
        await sendMail({
          to: toList.join(','),
          subject: `Agent status dəyişdi: ${status}`,
          html: `<p>Agent ${changerProfile.full_name ?? changerProfile.email} müraciətin statusunu dəyişdi.</p>
                 <p>Status: ${status}${reason ? `<br/>Səbəb: ${reason}` : ''}</p>`,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}


