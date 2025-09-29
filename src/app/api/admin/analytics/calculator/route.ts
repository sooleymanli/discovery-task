import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';

type QuoteLog = {
  created_at: string;
  age: number;
  gender: 'male' | 'female';
  coverage_amount: number;
  term_years: number;
  smoker: boolean;
  premium: number;
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function GET(_req: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient();

    const since = new Date();
    since.setDate(since.getDate() - 90); // analyze last 90 days

    const { data, error } = await supabase
      .from('calculator_quote_logs')
      .select('created_at, age, gender, coverage_amount, term_years, smoker, premium')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(5000);
    if (error) throw error;

    const rows: QuoteLog[] = (data ?? []) as unknown as QuoteLog[];

    const total = rows.length;
    const last7DaysCut = new Date();
    last7DaysCut.setDate(last7DaysCut.getDate() - 7);
    const last7Days = rows.filter(r => new Date(r.created_at) >= last7DaysCut).length;

    const avgPremium = total > 0 ? Number((rows.reduce((s, r) => s + Number(r.premium || 0), 0) / total).toFixed(2)) : 0;

    const byGender = rows.reduce<Record<string, number>>((acc, r) => {
      const k = r.gender || 'unknown';
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});

    const byAgeBucket = rows.reduce<Record<string, number>>((acc, r) => {
      const a = r.age ?? 0;
      const bucket = a < 18 ? '<18' : a <= 25 ? '18-25' : a <= 35 ? '26-35' : a <= 45 ? '36-45' : a <= 55 ? '46-55' : a <= 65 ? '56-65' : '65+';
      acc[bucket] = (acc[bucket] ?? 0) + 1;
      return acc;
    }, {});

    const byTerm = rows.reduce<Record<string, number>>((acc, r) => {
      const k = String(r.term_years ?? 'unknown');
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});

    // Coverage amount buckets
    const byCoverageBucket = rows.reduce<Record<string, number>>((acc, r) => {
      const amt = Number(r.coverage_amount || 0);
      const bucket = amt < 25000 ? '<25k' : amt <= 50000 ? '25-50k' : amt <= 100000 ? '50-100k' : amt <= 250000 ? '100-250k' : amt <= 500000 ? '250-500k' : '500k+';
      acc[bucket] = (acc[bucket] ?? 0) + 1;
      return acc;
    }, {});

    // 14-day daily trend
    const trendDays = 14;
    const today = startOfDay(new Date());
    const trend: { date: string; count: number }[] = [];
    for (let i = trendDays - 1; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const count = rows.filter(r => {
        const t = new Date(r.created_at);
        return t >= day && t < next;
      }).length;
      trend.push({ date: day.toISOString().slice(0, 10), count });
    }

    return NextResponse.json({
      ok: true,
      total,
      last7Days,
      avgPremium,
      byGender,
      byAgeBucket,
      byTerm,
      byCoverageBucket,
      trend,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


