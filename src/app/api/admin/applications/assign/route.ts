import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { sendMail } from '@/lib/email';
import { postToSlack } from '@/lib/slack';
import { sendTelegramMessage } from '@/lib/telegram';
import { notifyAgentAssignment } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const { applicationId, agentId } = await req.json();
    if (!applicationId || !agentId) return NextResponse.json({ error: 'applicationId and agentId required' }, { status: 400 });
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase
      .from('applications')
      .update({ assigned_agent_id: agentId, status: 'assigned', assigned_at: new Date().toISOString() })
      .eq('id', applicationId);
    if (error) throw error;

    // Load details for notify
    const { data: app } = await supabase
      .from('applications')
      .select('id, full_name, email, phone, coverage_amount, term_years, status')
      .eq('id', applicationId)
      .single();

    const { data: agent } = await supabase
      .from('profiles')
      .select('id, full_name, email, telegram_chat_id')
      .eq('id', agentId)
      .single();

    // Create notification for agent assignment
    if (app && agent) {
      await notifyAgentAssignment(applicationId, app.full_name, agent.full_name || agent.email, agentId);
    }

    const listUrl = `${process.env.APP_BASE_URL ?? ''}/admin/dashboard/applications`;

    if (agent?.email) {
      await sendMail({
        to: agent.email,
        subject: `Yeni müraciət sizə təyin olundu (${app?.full_name ?? ''})`,
        html: `<p>Salam ${agent?.full_name ?? ''},</p>
               <p>Sizə yeni müraciət təyin olundu.</p>
               <ul>
                 <li>Ad Soyad: ${app?.full_name ?? '-'}</li>
                 <li>Email: ${app?.email ?? '-'}</li>
                 <li>Telefon: ${app?.phone ?? '-'}</li>
                 <li>Məbləğ: ${app?.coverage_amount ?? '-'}</li>
                 <li>Müddət: ${app?.term_years ?? '-'}</li>
                 <li>Status: ${app?.status ?? '-'}</li>
               </ul>
               <p><a href="${listUrl}">Müraciətlər səhifəsinə keç</a></p>`,
      });
    }

    await postToSlack({
      text: `Müraciət təyinatı: ${app?.full_name ?? ''} → ${agent?.full_name ?? agent?.email ?? ''}`,
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: '👤 Müraciət təyinatı', emoji: true } },
        { type: 'section', fields: [
          { type: 'mrkdwn', text: `*Müştəri:*\n${app?.full_name ?? '-'}` },
          { type: 'mrkdwn', text: `*Agent:*\n${agent?.full_name ?? agent?.email ?? '-'}` },
          { type: 'mrkdwn', text: `*Email:*\n${app?.email ?? '-'}` },
          { type: 'mrkdwn', text: `*Telefon:*\n${app?.phone ?? '-'}` },
          { type: 'mrkdwn', text: `*Məbləğ:*\n${app?.coverage_amount ?? '-'}` },
          { type: 'mrkdwn', text: `*Müddət:*\n${app?.term_years ?? '-'}` },
        ]},
        { type: 'actions', elements: [ { type: 'button', text: { type: 'plain_text', text: 'Müraciətlərə bax' }, url: listUrl } ] }
      ],
    });

    if (agent?.telegram_chat_id) {
      await sendTelegramMessage({ chatId: agent.telegram_chat_id, text: `Yeni müraciət sizə təyin olundu\nMüştəri: ${app?.full_name ?? '-'}\nEmail: ${app?.email ?? '-'}\nTelefon: ${app?.phone ?? '-'}\nLink: ${listUrl}` });
    } else {
      await sendTelegramMessage({ chatId: process.env.TELEGRAM_DEFAULT_CHAT_ID, text: `Yeni müraciət təyinatı\nAgent: ${agent?.full_name ?? agent?.email ?? '-'}\nMüştəri: ${app?.full_name ?? '-'}\nEmail: ${app?.email ?? '-'}\nTelefon: ${app?.phone ?? '-'}\nLink: ${listUrl}` });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}


