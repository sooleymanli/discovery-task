import { NextResponse } from 'next/server';
import { cookies as nextCookies } from 'next/headers';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || undefined;
    const from = url.searchParams.get('from') || undefined; // ISO date
    const to = url.searchParams.get('to') || undefined; // ISO date
    const q = url.searchParams.get('q') || undefined; // search in name/email/phone
    const ageMin = url.searchParams.get('ageMin') || undefined;
    const ageMax = url.searchParams.get('ageMax') || undefined;
    const gender = url.searchParams.get('gender') || undefined;
    const coverageMin = url.searchParams.get('coverageMin') || undefined;
    const coverageMax = url.searchParams.get('coverageMax') || undefined;
    const termMin = url.searchParams.get('termMin') || undefined;
    const termMax = url.searchParams.get('termMax') || undefined;
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const cookieStore = await nextCookies();
    const authed = createSupabaseServerClient({ cookies: cookieStore as any });
    const { data: userData } = await authed.auth.getUser();
    if (!userData.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const supabase = createSupabaseServiceClient();
    // Find role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userData.user.id).single();
    const role = (profile?.role as string) ?? 'agent';

    // First, get total count for pagination
    let countQuery = supabase
      .from('applications')
      .select('id', { count: 'exact', head: true });
    if (role !== 'superadmin') {
      countQuery = countQuery.eq('assigned_agent_id', userData.user.id);
    }
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    if (from) {
      countQuery = countQuery.gte('created_at', from);
    }
    if (to) {
      countQuery = countQuery.lte('created_at', to);
    }
    if (q) {
      countQuery = countQuery.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
    }
    if (ageMin) {
      countQuery = countQuery.gte('age', parseInt(ageMin));
    }
    if (ageMax) {
      countQuery = countQuery.lte('age', parseInt(ageMax));
    }
    if (gender) {
      countQuery = countQuery.eq('gender', gender);
    }
    if (coverageMin) {
      countQuery = countQuery.gte('coverage_amount', parseInt(coverageMin));
    }
    if (coverageMax) {
      countQuery = countQuery.lte('coverage_amount', parseInt(coverageMax));
    }
    if (termMin) {
      countQuery = countQuery.gte('term_years', parseInt(termMin));
    }
    if (termMax) {
      countQuery = countQuery.lte('term_years', parseInt(termMax));
    }
    const { count, error: countError } = await countQuery;
    if (countError) throw countError;

    // Then get paginated data
    let query = supabase
      .from('applications')
      .select('id, created_at, full_name, email, phone, age, gender, coverage_amount, term_years, premium_estimate, status, assigned_agent_id, notes')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
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
      // simple ilike on name/email/phone
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

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({ 
      applications: data, 
      role,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


