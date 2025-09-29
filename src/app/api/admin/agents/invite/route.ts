import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { sendTelegramMessage } from '@/lib/telegram';
import { sendMail } from '@/lib/email';
import { notifyAgentInvite } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const { email, fullName, phone, chatId } = await req.json();
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const supabase = createSupabaseServiceClient();

    // 1) Create user as agent (email not confirmed yet)
    const { data, error } = await supabase.auth.admin.createUser({ email, email_confirm: false });
    if (error) throw error;
    const user = data.user;
    if (!user) throw new Error('user not returned');

    // 2) Upsert profile as agent
    const { error: upErr } = await supabase.from('profiles').upsert({
      id: user.id,
      role: 'agent',
      full_name: fullName ?? null,
      email,
      phone: phone ?? null,
      telegram_chat_id: chatId ?? null,
      status: 'pending_invite',
    });
    if (upErr) throw upErr;

    // Create notification for agent invite
    await notifyAgentInvite(email, fullName || email);

    // 3) Generate invite link and send via our email
    const redirectTo = `${process.env.APP_BASE_URL ?? ''}/admin/accept`;
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email,
      options: { redirectTo },
    } as any);
    if (linkErr) throw linkErr;
    const actionLink = (linkData as any)?.properties?.action_link ?? (linkData as any)?.action_link;

    await sendMail({
      to: email,
      subject: 'Agent dəvəti – parolunuzu təyin edin',
      html: `<p>Salam  <strong>${fullName ?? ''},</strong></p>
             <p>Sizə agent hesabı yaradıldı. Parolunuzu təyin etmək və daxil olmaq üçün aşağıdakı linkə klikləyin:</p>
             <p><a href="${actionLink}" target="_blank" rel="noreferrer">Hesabınızı aktivləşdirin</a></p>
            `,
    });

    // 4) Telegram notify (if chatId)
    if (chatId) await sendTelegramMessage({ chatId, text: `Sizə agent hesabı dəvəti göndərildi: ${email}` });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}


