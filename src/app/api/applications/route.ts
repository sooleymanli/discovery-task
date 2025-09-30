import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase';
import { sendMail } from '@/lib/email';
import { postToSlack } from '@/lib/slack';
import { cookies } from 'next/headers';
import { sendTelegramMessage } from '@/lib/telegram';
import { notifyNewApplication } from '@/lib/notifications';

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5).optional(),
  age: z.number().min(18).max(65),
  gender: z.enum(['male', 'female']),
  coverageAmount: z.number().min(10000),
  termYears: z.number().int().positive(),
  smoker: z.boolean().optional(),
  consent: z.literal(true),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse({
      ...body,
      age: Number(body.age),
      coverageAmount: Number(body.coverageAmount),
      termYears: Number(body.termYears),
    });

    // Prefer service client for anonymous public submissions to avoid RLS issues
    const supabase = createSupabaseServiceClient();

    const { data: inserted, error } = await supabase.from('applications').insert({
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      age: data.age,
      gender: data.gender,
      coverage_amount: data.coverageAmount,
      term_years: data.termYears,
      consent_given: true,
      premium_estimate: null,
      status: 'pending',
      source: 'web',
    }).select('id').single();

    if (error) throw error;

    // Create notification for new application
    await notifyNewApplication('', data.fullName);

    await sendMail({
      to: data.email,
      subject: 'Müraciətiniz üçün təşəkkürlər',
      html: `<div>
        <p>Sizin müraciətiniz alındı. Tezliklə sizinlə əlaqə saxlanılacaq.</p>
        <p><strong>Müraciət ID:</strong> ${inserted?.id}</p>
        <p>Portala keçid: <a href="${process.env.APP_BASE_URL || ''}/portal" target="_blank" rel="noopener">${process.env.APP_BASE_URL || ''}/portal</a></p>
        <p>Portala daxil olmaq üçün Müraciət ID və emailinizi istifadə edin.</p>
      </div>`,
    });

    await postToSlack({
      text: `Yeni müraciət: ${data.fullName} - ${data.email}`,
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: '🆕 Yeni müraciət', emoji: true } },
        { type: 'section', fields: [
          { type: 'mrkdwn', text: `*Ad Soyad:*\n${data.fullName}` },
          { type: 'mrkdwn', text: `*Email:*\n${data.email}` },
          { type: 'mrkdwn', text: `*Telefon:*\n${data.phone ?? '-'}` },
          { type: 'mrkdwn', text: `*Yaş:*\n${data.age}` },
          { type: 'mrkdwn', text: `*Cins:*\n${data.gender}` },
          { type: 'mrkdwn', text: `*Məbləğ:*\n${data.coverageAmount}` },
          { type: 'mrkdwn', text: `*Müddət:*\n${data.termYears}` },
          { type: 'mrkdwn', text: `*Siqaret:*\n${data.smoker ? 'Bəli' : 'Xeyr'}` },
        ]},
      ],
    });

    await sendTelegramMessage({
      text: `🆕 Yeni müraciət\nAd: ${data.fullName}\nEmail: ${data.email}\nTelefon: ${data.phone ?? '-'}\nYaş: ${data.age}\nCins: ${data.gender}\nMəbləğ: ${data.coverageAmount}\nMüddət: ${data.termYears}\nSiqaret: ${data.smoker ? 'Bəli' : 'Xeyr'}`,
    });

    return NextResponse.json({ ok: true, applicationId: inserted?.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
