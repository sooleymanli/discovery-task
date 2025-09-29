import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { notifyCalculatorUsage } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, event_properties, source, user_id, application_id, quote_id } = body;

    const supabase = createSupabaseServiceClient();

    const { error } = await supabase
      .from('analytics')
      .insert({
        event_type,
        event_properties,
        source: source || 'landing_page',
        user_id: user_id || null,
        application_id: application_id || null,
        quote_id: quote_id || null,
      });

    if (error) {
      console.error('Analytics insert error:', error);
      return NextResponse.json({ error: 'Failed to log analytics' }, { status: 500 });
    }

    // Create notification for calculator usage
    if (event_type === 'calculator_used' && event_properties?.premium) {
      await notifyCalculatorUsage(user_id || '', event_properties.premium);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
