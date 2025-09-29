import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { calculatePremiumEstimate, type CalculatorConfig } from '@/lib/calculator';

type QuoteInput = {
  age: number;
  gender: 'male' | 'female';
  coverageAmount: number;
  termYears: number;
  smoker?: boolean;
  source?: string; // optional tracking
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as QuoteInput;
    const { age, gender, coverageAmount, termYears, smoker } = body;

    if (
      typeof age !== 'number' ||
      (gender !== 'male' && gender !== 'female') ||
      typeof coverageAmount !== 'number' ||
      typeof termYears !== 'number'
    ) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    // 1) Load active calculator config
    const { data: cfgRow, error: cfgErr } = await supabase
      .from('calculator_config')
      .select('id, version, config')
      .eq('is_active', true)
      .order('effective_from', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (cfgErr) throw cfgErr;

    const config: CalculatorConfig | undefined = cfgRow?.config as unknown as CalculatorConfig | undefined;

    // 2) Compute on server
    const premium = calculatePremiumEstimate({ age, gender, coverageAmount, termYears, smoker: Boolean(smoker), config });

    // 3) Persist calculation for analytics
    const { error: logErr } = await supabase.from('calculator_quote_logs').insert({
      config_id: cfgRow?.id ?? null,
      config_version: cfgRow?.version ?? null,
      age,
      gender,
      coverage_amount: coverageAmount,
      term_years: termYears,
      smoker: Boolean(smoker),
      premium,
      source: body.source ?? 'landing',
      user_id: null, // anonymous by default; can be populated if session is attached later
    });
    if (logErr) throw logErr;

    return NextResponse.json({
      ok: true,
      premium,
      configVersion: cfgRow?.version ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


