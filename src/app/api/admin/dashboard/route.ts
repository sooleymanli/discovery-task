import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient();
    
    // Get user from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user profile to determine role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const userId = user.id;
    const role = profile.role;

    if (role === 'superadmin') {
      // Superadmin data
      const [applicationsResult, agentsResult, calculatorResult] = await Promise.all([
        // Applications data
        supabase
          .from('applications')
          .select('id, status, created_at, assigned_agent_id, gender, age, coverage_amount, term_years, premium_estimate'),
        
        // Agents data
        supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('role', 'agent'),
        
        // Calculator usage data
        supabase
          .from('analytics')
          .select('timestamp, event_type, event_properties')
          .eq('event_type', 'calculator_used')
      ]);

      const applications = applicationsResult.data || [];
      const agents = agentsResult.data || [];
      const calculatorUsage = calculatorResult.data || [];

      // Process applications by status
      const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const applicationsByStatus = [
        { status: 'Gözləmədə', count: statusCounts.pending || 0, color: '#F59E0B' },
        { status: 'Təsdiqlənib', count: statusCounts.in_progress || 0, color: '#10B981' },
        { status: 'İmtina olunub', count: statusCounts.closed || 0, color: '#EF4444' },
      ];

      // Process applications by month (last 6 months)
      const monthlyData = applications.reduce((acc, app) => {
        const date = new Date(app.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('az-AZ', { month: 'short' });
        acc[monthKey] = { month: monthName, count: (acc[monthKey]?.count || 0) + 1 };
        return acc;
      }, {} as Record<string, { month: string; count: number }>);

      const applicationsByMonth = Object.values(monthlyData)
        .sort((a, b) => a.month.localeCompare(b.month));

      // Process applications by age group
      const ageGroupData = applications.reduce((acc, app) => {
        if (!app.age) return acc;
        let group = '';
        if (app.age >= 18 && app.age <= 25) group = '18-25';
        else if (app.age >= 26 && app.age <= 35) group = '26-35';
        else if (app.age >= 36 && app.age <= 45) group = '36-45';
        else if (app.age >= 46 && app.age <= 55) group = '46-55';
        else if (app.age >= 56 && app.age <= 65) group = '56-65';
        else return acc;
        
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const applicationsByAgeGroup = [
        { ageGroup: '18-25', count: ageGroupData['18-25'] || 0, color: '#3B82F6' },
        { ageGroup: '26-35', count: ageGroupData['26-35'] || 0, color: '#10B981' },
        { ageGroup: '36-45', count: ageGroupData['36-45'] || 0, color: '#F59E0B' },
        { ageGroup: '46-55', count: ageGroupData['46-55'] || 0, color: '#EF4444' },
        { ageGroup: '56-65', count: ageGroupData['56-65'] || 0, color: '#8B5CF6' },
      ];

      // Process applications by gender
      const genderData = applications.reduce((acc, app) => {
        if (!app.gender) return acc;
        acc[app.gender] = (acc[app.gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const applicationsByGender = [
        { gender: 'Kişi', count: genderData['male'] || 0, color: '#3B82F6' },
        { gender: 'Qadın', count: genderData['female'] || 0, color: '#EC4899' },
      ].filter(item => item.count > 0);

      // Process applications by coverage amount
      const coverageData = applications.reduce((acc, app) => {
        if (!app.coverage_amount) return acc;
        const amount = Number(app.coverage_amount);
        let range = '';
        if (amount < 50000) range = '0-50k';
        else if (amount < 100000) range = '50k-100k';
        else if (amount < 150000) range = '100k-150k';
        else range = '150k+';
        
        acc[range] = (acc[range] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const applicationsByCoverageAmount = [
        { range: '0-50k', count: coverageData['0-50k'] || 0, color: '#3B82F6' },
        { range: '50k-100k', count: coverageData['50k-100k'] || 0, color: '#10B981' },
        { range: '100k-150k', count: coverageData['100k-150k'] || 0, color: '#F59E0B' },
        { range: '150k+', count: coverageData['150k+'] || 0, color: '#EF4444' },
      ];

      // Process applications by term
      const termData = applications.reduce((acc, app) => {
        if (!app.term_years) return acc;
        const term = Number(app.term_years);
        acc[term] = (acc[term] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const applicationsByTerm = Object.entries(termData)
        .map(([term, count]) => ({ term: `${term} il`, count, color: COLORS[Number(term) % COLORS.length] }))
        .sort((a, b) => Number(a.term) - Number(b.term));

      // Daily trend (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentApplications = applications.filter(app => 
        new Date(app.created_at) >= thirtyDaysAgo
      );

      const dailyTrend = recentApplications.reduce((acc, app) => {
        const date = new Date(app.created_at).toLocaleDateString('az-AZ');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const applicationsDailyTrend = Object.entries(dailyTrend)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Completion rate (applications vs calculator uses)
      const completionRate = calculatorUsage.length > 0 
        ? Math.round((applications.length / calculatorUsage.length) * 100) 
        : 0;

      // Process agent workload
      const agentWorkload = agents.map((agent, index) => {
        const assignedCount = applications.filter(app => app.assigned_agent_id === agent.id).length;
        return {
          name: agent.full_name || `Agent ${index + 1}`,
          applications: assignedCount,
          color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index % 6],
        };
      });

      // Process calculator usage by day (last 30 days)
      const recentCalculatorUsage = calculatorUsage.filter(usage => 
        new Date(usage.timestamp) >= thirtyDaysAgo
      );

      const dailyUsage = recentCalculatorUsage.reduce((acc, usage) => {
        const date = new Date(usage.timestamp).toLocaleDateString('az-AZ');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const calculatorByDay = Object.entries(dailyUsage)
        .map(([date, uses]) => ({ date, uses }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Process calculator usage by hour
      const hourlyUsage = calculatorUsage.reduce((acc, usage) => {
        const hour = new Date(usage.timestamp).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const calculatorByHour = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        uses: hourlyUsage[hour] || 0,
      }));

      // Process calculator usage by weekday
      const weekdayUsage = calculatorUsage.reduce((acc, usage) => {
        const day = new Date(usage.timestamp).toLocaleDateString('az-AZ', { weekday: 'short' });
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const calculatorByWeekday = [
        { day: 'B.E', uses: weekdayUsage['B.E'] || 0, color: '#3B82F6' },
        { day: 'Ç.A', uses: weekdayUsage['Ç.A'] || 0, color: '#10B981' },
        { day: 'Ç', uses: weekdayUsage['Ç'] || 0, color: '#F59E0B' },
        { day: 'C.A', uses: weekdayUsage['C.A'] || 0, color: '#EF4444' },
        { day: 'C', uses: weekdayUsage['C'] || 0, color: '#8B5CF6' },
        { day: 'Ş', uses: weekdayUsage['Ş'] || 0, color: '#06B6D4' },
        { day: 'B', uses: weekdayUsage['B'] || 0, color: '#84CC16' },
      ];

      // Calculator conversion rate
      const conversionRate = calculatorUsage.length > 0 
        ? Math.round((applications.length / calculatorUsage.length) * 100) 
        : 0;

      // Average coverage amount
      const avgAmount = applications.length > 0 
        ? applications.reduce((sum, app) => sum + (Number(app.coverage_amount) || 0), 0) / applications.length 
        : 0;

      // Most used parameters
      const paramUsage = calculatorUsage.reduce((acc, usage) => {
        const props = usage.event_properties;
        if (props?.age) {
          const ageGroup = props.age >= 18 && props.age <= 25 ? '18-25' : 
                          props.age >= 26 && props.age <= 35 ? '26-35' : 
                          props.age >= 36 && props.age <= 45 ? '36-45' : '46+';
          acc[ageGroup] = (acc[ageGroup] || 0) + 1;
        }
        if (props?.gender) {
          acc[props.gender] = (acc[props.gender] || 0) + 1;
        }
        if (props?.smoker) {
          acc[props.smoker ? 'Siqaret çəkir' : 'Siqaret çəkmir'] = (acc[props.smoker ? 'Siqaret çəkir' : 'Siqaret çəkmir'] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const mostUsedParams = Object.entries(paramUsage)
        .map(([param, count]) => ({ param, count, color: COLORS[Object.keys(paramUsage).indexOf(param) % COLORS.length] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Business metrics
      const currentMonth = new Date().getMonth();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const currentYear = new Date().getFullYear();
      const lastYear = lastMonth === 11 ? currentYear - 1 : currentYear;

      const currentMonthApps = applications.filter(app => {
        const date = new Date(app.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).length;

      const lastMonthApps = applications.filter(app => {
        const date = new Date(app.created_at);
        return date.getMonth() === lastMonth && date.getFullYear() === lastYear;
      }).length;

      const monthlyGrowth = lastMonthApps > 0 
        ? Math.round(((currentMonthApps - lastMonthApps) / lastMonthApps) * 100) 
        : 0;

      const revenueProjection = applications.reduce((sum, app) => 
        sum + (Number(app.premium_estimate) || 0), 0
      );

      const avgApplicationValue = applications.length > 0 
        ? revenueProjection / applications.length 
        : 0;

      // Peak hours
      const peakHours = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        applications: applications.filter(app => 
          new Date(app.created_at).getHours() === hour
        ).length,
      }));

      return NextResponse.json({
        applications: {
          total: applications.length,
          byStatus: applicationsByStatus,
          byMonth: applicationsByMonth,
          byAgeGroup: applicationsByAgeGroup,
          byGender: applicationsByGender,
          byCoverageAmount: applicationsByCoverageAmount,
          byTerm: applicationsByTerm,
          dailyTrend: applicationsDailyTrend,
          completionRate,
        },
        agents: {
          total: agents.length,
          byWorkload: agentWorkload,
          performance: agentWorkload.map(agent => ({
            ...agent,
            completionRate: Math.round(Math.random() * 40 + 60), // Mock data
            avgResponseTime: Math.round(Math.random() * 4 + 1), // Mock data
          })),
        },
        calculator: {
          totalUses: calculatorUsage.length,
          byDay: calculatorByDay,
          byHour: calculatorByHour,
          byWeekday: calculatorByWeekday,
          conversionRate,
          avgAmount: Math.round(avgAmount),
          mostUsedParams,
        },
        business: {
          monthlyGrowth,
          revenueProjection: Math.round(revenueProjection),
          avgApplicationValue: Math.round(avgApplicationValue),
          peakHours,
        },
        role: 'superadmin',
      });

    } else {
      // Agent data - only assigned applications
      const applicationsResult = await supabase
        .from('applications')
        .select('id, status, created_at, gender, age, coverage_amount, term_years, premium_estimate')
        .eq('assigned_agent_id', userId);

      const applications = applicationsResult.data || [];

      // Process applications by status
      const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const applicationsByStatus = [
        { status: 'Gözləmədə', count: statusCounts.pending || 0, color: '#F59E0B' },
        { status: 'Təsdiqlənib', count: statusCounts.in_progress || 0, color: '#10B981' },
        { status: 'İmtina olunub', count: statusCounts.closed || 0, color: '#EF4444' },
      ];

      // Process applications by month (last 6 months)
      const monthlyData = applications.reduce((acc, app) => {
        const date = new Date(app.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('az-AZ', { month: 'short' });
        acc[monthKey] = { month: monthName, count: (acc[monthKey]?.count || 0) + 1 };
        return acc;
      }, {} as Record<string, { month: string; count: number }>);

      const applicationsByMonth = Object.values(monthlyData)
        .sort((a, b) => a.month.localeCompare(b.month));

      // Process applications by age group
      const ageGroupData = applications.reduce((acc, app) => {
        if (!app.age) return acc;
        let group = '';
        if (app.age >= 18 && app.age <= 25) group = '18-25';
        else if (app.age >= 26 && app.age <= 35) group = '26-35';
        else if (app.age >= 36 && app.age <= 45) group = '36-45';
        else if (app.age >= 46 && app.age <= 55) group = '46-55';
        else if (app.age >= 56 && app.age <= 65) group = '56-65';
        else return acc;
        
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const applicationsByAgeGroup = [
        { ageGroup: '18-25', count: ageGroupData['18-25'] || 0, color: '#3B82F6' },
        { ageGroup: '26-35', count: ageGroupData['26-35'] || 0, color: '#10B981' },
        { ageGroup: '36-45', count: ageGroupData['36-45'] || 0, color: '#F59E0B' },
        { ageGroup: '46-55', count: ageGroupData['46-55'] || 0, color: '#EF4444' },
        { ageGroup: '56-65', count: ageGroupData['56-65'] || 0, color: '#8B5CF6' },
      ];

      // Process applications by gender
      const genderData = applications.reduce((acc, app) => {
        if (!app.gender) return acc;
        acc[app.gender] = (acc[app.gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const applicationsByGender = [
        { gender: 'Kişi', count: genderData['male'] || 0, color: '#3B82F6' },
        { gender: 'Qadın', count: genderData['female'] || 0, color: '#EC4899' },
      ].filter(item => item.count > 0);

      // Process applications by coverage amount
      const coverageData = applications.reduce((acc, app) => {
        if (!app.coverage_amount) return acc;
        const amount = Number(app.coverage_amount);
        let range = '';
        if (amount < 50000) range = '0-50k';
        else if (amount < 100000) range = '50k-100k';
        else if (amount < 150000) range = '100k-150k';
        else range = '150k+';
        
        acc[range] = (acc[range] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const applicationsByCoverageAmount = [
        { range: '0-50k', count: coverageData['0-50k'] || 0, color: '#3B82F6' },
        { range: '50k-100k', count: coverageData['50k-100k'] || 0, color: '#10B981' },
        { range: '100k-150k', count: coverageData['100k-150k'] || 0, color: '#F59E0B' },
        { range: '150k+', count: coverageData['150k+'] || 0, color: '#EF4444' },
      ];

      // Process applications by term
      const termData = applications.reduce((acc, app) => {
        if (!app.term_years) return acc;
        const term = Number(app.term_years);
        acc[term] = (acc[term] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const applicationsByTerm = Object.entries(termData)
        .map(([term, count]) => ({ term: `${term} il`, count, color: COLORS[Number(term) % COLORS.length] }))
        .sort((a, b) => Number(a.term) - Number(b.term));

      // Daily trend (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentApplications = applications.filter(app => 
        new Date(app.created_at) >= thirtyDaysAgo
      );

      const dailyTrend = recentApplications.reduce((acc, app) => {
        const date = new Date(app.created_at).toLocaleDateString('az-AZ');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const applicationsDailyTrend = Object.entries(dailyTrend)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Completion rate (applications vs calculator uses)
      const completionRate = 0; // Agent doesn't have calculator usage data

      return NextResponse.json({
        applications: {
          total: applications.length,
          byStatus: applicationsByStatus,
          byMonth: applicationsByMonth,
          byAgeGroup: applicationsByAgeGroup,
          byGender: applicationsByGender,
          byCoverageAmount: applicationsByCoverageAmount,
          byTerm: applicationsByTerm,
          dailyTrend: applicationsDailyTrend,
          completionRate,
        },
        agents: {
          total: 0,
          byWorkload: [],
          performance: [],
        },
        calculator: {
          totalUses: 0,
          byDay: [],
          byHour: [],
          byWeekday: [],
          conversionRate: 0,
          avgAmount: 0,
          mostUsedParams: [],
        },
        business: {
          monthlyGrowth: 0,
          revenueProjection: 0,
          avgApplicationValue: 0,
          peakHours: [],
        },
        role: 'agent',
        agentApplications: {
          total: applications.length,
          byStatus: applicationsByStatus,
        },
      });
    }

  } catch (error) {
    console.error('Dashboard API error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
