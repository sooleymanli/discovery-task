import { NextResponse } from 'next/server';
import { cookies as nextCookies } from 'next/headers';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'excel';
    const status = url.searchParams.get('status') || undefined;
    const from = url.searchParams.get('from') || undefined;
    const to = url.searchParams.get('to') || undefined;
    const q = url.searchParams.get('q') || undefined;
    const ageMin = url.searchParams.get('ageMin') || undefined;
    const ageMax = url.searchParams.get('ageMax') || undefined;
    const gender = url.searchParams.get('gender') || undefined;
    const coverageMin = url.searchParams.get('coverageMin') || undefined;
    const coverageMax = url.searchParams.get('coverageMax') || undefined;
    const termMin = url.searchParams.get('termMin') || undefined;
    const termMax = url.searchParams.get('termMax') || undefined;

    const cookieStore = await nextCookies();
    const authed = createSupabaseServerClient({ cookies: cookieStore as any });
    const { data: userData } = await authed.auth.getUser();
    if (!userData.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const supabase = createSupabaseServiceClient();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userData.user.id).single();
    const role = (profile?.role as string) ?? 'agent';

    let query = supabase
      .from('applications')
      .select('id, created_at, full_name, email, phone, age, gender, coverage_amount, term_years, premium_estimate, status, assigned_agent_id, notes')
      .order('created_at', { ascending: false });

    if (role !== 'superadmin') {
      query = query.eq('assigned_agent_id', userData.user.id);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (from) {
      query = query.gte('created_at', from);
    }
    if (to) {
      query = query.lte('created_at', to);
    }
    if (q) {
      query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
    }
    if (ageMin) {
      query = query.gte('age', parseInt(ageMin));
    }
    if (ageMax) {
      query = query.lte('age', parseInt(ageMax));
    }
    if (gender) {
      query = query.eq('gender', gender);
    }
    if (coverageMin) {
      query = query.gte('coverage_amount', parseInt(coverageMin));
    }
    if (coverageMax) {
      query = query.lte('coverage_amount', parseInt(coverageMax));
    }
    if (termMin) {
      query = query.gte('term_years', parseInt(termMin));
    }
    if (termMax) {
      query = query.lte('term_years', parseInt(termMax));
    }

    const { data, error } = await query;
    if (error) throw error;

    if (format === 'excel') {
      return exportToExcel(data || []);
    } else if (format === 'csv') {
      return exportToCSV(data || []);
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}

function exportToExcel(data: any[]) {
  const headers = [
    'ID',
    'Tarix',
    'Ad Soyad',
    'Email',
    'Telefon',
    'Yaş',
    'Cinsiyyət',
    'Sığorta Məbləği (AZN)',
    'Müddət (il)',
    'Aylıq Ödəniş (AZN)',
    'Status',
    'Agent ID',
    'Qeydlər'
  ];

  const rows = data.map(app => [
    app.id,
    new Date(app.created_at).toLocaleString('az-AZ'),
    app.full_name,
    app.email,
    app.phone || '',
    app.age || '',
    app.gender === 'male' ? 'Kişi' : app.gender === 'female' ? 'Qadın' : '',
    app.coverage_amount || '',
    app.term_years || '',
    app.premium_estimate || '',
    getStatusText(app.status),
    app.assigned_agent_id || '',
    app.notes || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  return new NextResponse(blob, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv;charset=utf-8;',
      'Content-Disposition': `attachment; filename="muracietler_${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}

function exportToCSV(data: any[]) {
  return exportToExcel(data); // Same implementation for now
}

function getStatusText(status: string) {
  switch (status) {
    case 'pending': return 'Gözləmədə';
    case 'in_progress': return 'Təsdiqlənib';
    case 'closed': return 'İmtina olunub';
    default: return status;
  }
}
