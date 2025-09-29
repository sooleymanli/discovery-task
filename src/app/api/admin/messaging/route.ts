import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { postToSlack } from '@/lib/slack';
import { sendTelegramMessage } from '@/lib/telegram';
import { sendMail } from '@/lib/email';

type Payload = {
  message: string;
  // Slack
  sendSlack?: boolean;
  // Telegram Channel
  sendTelegramChannel?: boolean;
  // Telegram to Agents
  sendTelegramToAgents?: boolean;
  agentIdsForTelegram?: string[];
  // Email to Agents
  sendEmailToAgents?: boolean;
  agentIdsForEmail?: string[];
  subject?: string;
  // Mentions
  mentionAgents?: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Payload;
    const { message } = body;
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    // Resolve target agents if provided
    let selectedAgents: { id: string; full_name: string | null; email: string | null; telegram_chat_id: string | null }[] = [];
    const needAgents = (body.sendEmailToAgents && (body.agentIdsForEmail?.length)) || (body.sendTelegramToAgents && (body.agentIdsForTelegram?.length));
    if (needAgents) {
      const ids = Array.from(new Set([...(body.agentIdsForEmail || []), ...(body.agentIdsForTelegram || [])]));
      const { data: agents, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, telegram_chat_id, role, status')
        .in('id', ids)
        .eq('role', 'agent')
        .eq('status', 'active');
      if (error) throw error;
      selectedAgents = (agents || []) as any;
    }

    const mentionPrefix = body.mentionAgents && selectedAgents.length
      ? `@${selectedAgents.map(a => (a.full_name || a.email || '').trim()).filter(Boolean).join(' @')}\n\n`
      : '';
    const finalMessage = `${mentionPrefix}${message}`;

    // Slack (channel via webhook)
    if (body.sendSlack) {
      await postToSlack(finalMessage);
    }

    // Telegram Channel
    if (body.sendTelegramChannel) {
      await sendTelegramMessage({ text: finalMessage });
    }

    // Telegram to Agents
    if (body.sendTelegramToAgents && selectedAgents.length) {
      for (const a of selectedAgents) {
        if (a.telegram_chat_id) {
          await sendTelegramMessage({ chatId: a.telegram_chat_id, text: finalMessage });
        }
      }
    }

    // Email to Agents
    if (body.sendEmailToAgents && selectedAgents.length) {
      const subject = body.subject || 'PlanB Məlumat';
      for (const a of selectedAgents) {
        if (a.email) {
          await sendMail({ to: a.email, subject, html: `<p>${finalMessage.replace(/\n/g, '<br/>')}</p>` });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


