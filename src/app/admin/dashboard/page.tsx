'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { tClient, useLocale } from '@/lib/i18n/client';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

type DashboardData = {
  applications: {
    total: number;
    byStatus: { status: string; count: number; color: string }[];
    byMonth: { month: string; count: number }[];
    byAgeGroup: { ageGroup: string; count: number; color: string }[];
    byGender: { gender: string; count: number; color: string }[];
    byCoverageAmount: { range: string; count: number; color: string }[];
    byTerm: { term: string; count: number; color: string }[];
    dailyTrend: { date: string; count: number }[];
    completionRate: number;
  };
  agents: {
    total: number;
    byWorkload: { name: string; applications: number; color: string }[];
    performance: { name: string; completionRate: number; avgResponseTime: number; color: string }[];
  };
  calculator: {
    totalUses: number;
    byDay: { date: string; uses: number }[];
    byHour: { hour: number; uses: number }[];
    byWeekday: { day: string; uses: number; color: string }[];
    conversionRate: number;
    avgAmount: number;
    mostUsedParams: { param: string; count: number; color: string }[];
  };
  business: {
    monthlyGrowth: number;
    avgResponseTime: number;
    revenueProjection: number;
    peakHours: { hour: number; applications: number }[];
  };
  role: 'superadmin' | 'agent';
  agentApplications?: {
    total: number;
    byStatus: { status: string; count: number; color: string }[];
  };
};

export default function DashboardPage() {
  const [locale] = useLocale();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [calcStats, setCalcStats] = useState<{
    total: number;
    last7Days: number;
    avgPremium: number;
    byGender: Record<string, number>;
    byAgeBucket?: Record<string, number>;
    byTerm?: Record<string, number>;
    byCoverageBucket?: Record<string, number>;
    trend: { date: string; count: number }[];
  } | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace('/admin/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      if (profileError || !profile) {
        setError(tClient('dashboard_error_profile', locale));
        return;
      }

      const role = profile?.role as 'superadmin' | 'agent';

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      if (!response.ok) {
        throw new Error(tClient('dashboard_error_data', locale));
      }

      const dashboardData = await response.json();
      setData({ ...dashboardData, role });
      setLastUpdated(new Date());

      // Load calculator analytics (server aggregates from calculator_quote_logs)
      try {
        const calcRes = await fetch('/api/admin/analytics/calculator');
        if (calcRes.ok) {
          const j = await calcRes.json();
          setCalcStats({
            total: j.total ?? 0,
            last7Days: j.last7Days ?? 0,
            avgPremium: j.avgPremium ?? 0,
            byGender: j.byGender ?? {},
            byAgeBucket: j.byAgeBucket ?? {},
            byTerm: j.byTerm ?? {},
            byCoverageBucket: j.byCoverageBucket ?? {},
            trend: j.trend ?? [],
          });
        } else {
          setCalcStats(null);
        }
      } catch {
        setCalcStats(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tClient('dashboard_error', locale));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboard();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-teal-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="text-center">
            <p className="text-gray-700 font-semibold text-lg">{tClient('dashboard_loading', locale)}</p>
            <p className="text-gray-500 text-sm mt-1">{tClient('dashboard_wait', locale)}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        >
          {tClient('dashboard_retry', locale)}
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600">{tClient('dashboard_error_nodata', locale)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-3xl blur opacity-20"></div>
        <div className="relative rounded-3xl border border-cyan-100 bg-white/90 backdrop-blur-sm p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-50 to-teal-50 px-4 py-2 text-sm font-medium text-cyan-700 border border-cyan-200 mb-4">
                <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse"></span>
                PlanB Admin Dashboard
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent">
                {tClient('dashboard_overview', locale)}
              </h1>
              <p className="text-lg text-gray-700 mt-2">
                {data.role === 'superadmin' ? tClient('dashboard_stats_all', locale) : tClient('dashboard_stats_yours', locale)}
              </p>
              {lastUpdated && (
                <p className="text-sm text-cyan-600 mt-2 font-medium">
                  {tClient('dashboard_last_update', locale)}: {lastUpdated.toLocaleTimeString(locale === 'az' ? 'az-AZ' : locale === 'ru' ? 'ru-RU' : 'en-US')}
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-cyan-700">Auto-refresh:</label>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoRefresh ? 'bg-cyan-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-cyan-700">Interval:</label>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-sm rounded border border-cyan-200 p-1"
                  disabled={!autoRefresh}
                >
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                  <option value={60000}>1m</option>
                  <option value={300000}>5m</option>
                </select>
              </div>
              
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 text-sm bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
              >
                {tClient('dashboard_refresh', locale)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {data.role === 'superadmin' ? (
        <div className="space-y-6">
      
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">


          {calcStats && (
          <>

<div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 shadow-sm">
                <div className="text-sm text-purple-700 font-medium">{tClient('dashboard_calc_total', locale)}</div>
                <div className="mt-2 text-3xl font-extrabold text-purple-600">{calcStats.total}</div>
                <div className="mt-1 text-xs text-purple-700">{tClient('dashboard_last_90', locale)}</div>
              </div>
              <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-teal-50 p-6 shadow-sm">
                <div className="text-sm text-cyan-700 font-medium">{tClient('dashboard_last_7', locale)}</div>
                <div className="mt-2 text-3xl font-extrabold text-cyan-600">{calcStats.last7Days}</div>
                <div className="mt-1 text-xs text-cyan-700">{tClient('dashboard_calc_usage', locale)}</div>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-sm">
                <div className="text-sm text-emerald-700 font-medium">{tClient('dashboard_avg_monthly', locale)}</div>
                <div className="mt-2 text-3xl font-extrabold text-emerald-600">{calcStats.avgPremium} AZN</div>
                <div className="mt-1 text-xs text-emerald-700">{tClient('dashboard_server_calc', locale)}</div>
              </div>
             
            </>
          )}


            <div className="group relative overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-teal-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-200 to-teal-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-3xl font-bold text-cyan-600 mb-2">{data.applications.total}</div>
                <div className="text-sm font-semibold text-gray-900">{tClient('dashboard_total_apps', locale)}</div>
                <div className="text-xs text-cyan-600 mt-1">{tClient('dashboard_planb_apps', locale)}</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-3xl font-bold text-emerald-600 mb-2">{data.agents.total}</div>
                <div className="text-sm font-semibold text-gray-900">{tClient('dashboard_active_agents', locale)}</div>
                <div className="text-xs text-emerald-600 mt-1">{tClient('dashboard_working_agents', locale)}</div>
              </div>
            </div>
            {/* Removed legacy calculator totalUses card in favor of server-logged metrics */}
            <div className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-3xl font-bold text-orange-600 mb-2">{data.business.monthlyGrowth}%</div>
                <div className="text-sm font-semibold text-gray-900">{tClient('dashboard_monthly_growth', locale)}</div>
                <div className="text-xs text-orange-600 mt-1">{tClient('dashboard_planb_growth', locale)}</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-teal-200 to-cyan-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-3xl font-bold text-teal-600 mb-2">{data.calculator.conversionRate}%</div>
                <div className="text-sm font-semibold text-gray-900">{tClient('dashboard_conversion', locale)}</div>
                <div className="text-xs text-teal-600 mt-1">{tClient('dashboard_calc_to_app', locale)}</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-3xl font-bold text-pink-600 mb-2">{data.business.revenueProjection} AZN</div>
                <div className="text-sm font-semibold text-gray-900">{tClient('dashboard_revenue', locale)}</div>
                <div className="text-xs text-pink-600 mt-1">{tClient('dashboard_monthly_revenue', locale)}</div>
              </div>
            </div>
          </div>

          {/* Applications Section */}
          <h2 className="text-3xl text-center font-bold text-gray-900 mt-24">{tClient('dashboard_apps_section', locale)}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
            {/* Applications by Status */}
            <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">{tClient('dashboard_apps_by_status', locale)}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.applications.byStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.applications.byStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Applications by Age Group */}
            <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">{tClient('dashboard_by_age', locale)}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.applications.byAgeGroup}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Applications by Gender */}
            <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">{tClient('dashboard_gender_dist', locale)}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.applications.byGender}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ gender, count }) => `${gender}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.applications.byGender.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Coverage Amount Distribution */}
            <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">{tClient('dashboard_coverage_dist', locale)}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.applications.byCoverageAmount}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

        

          {/* Agents Section */}
          </div>

              {/* Daily Trend */}
              <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">{tClient('dashboard_daily_trend', locale)}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.applications.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
          </div>



          <h2 className="text-3xl text-center font-bold text-gray-900 mt-24">{tClient('dashboard_agents_section', locale)}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
            {/* Agent Performance */}
            <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm min-h-[380px] flex flex-col">
              <h3 className="text-lg font-semibold mb-4">{tClient('dashboard_agent_perf', locale)}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.agents.performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completionRate" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Peak Hours */}
            <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm min-h-[380px] flex flex-col">
              <h3 className="text-lg font-semibold mb-4">{tClient('dashboard_peak_hours', locale)}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.business.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="applications" stroke="#06B6D4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calculator Section */}
          <h2 className="text-3xl text-center font-bold text-gray-900 mt-24">{tClient('dashboard_calc_section', locale)}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
            {/* Calculator Trend (last 14 days) */}
            {calcStats && (
              <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">{tClient('dashboard_calc_trend', locale)}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={calcStats.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.25} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Calculator by Gender */}
            {calcStats && (
              <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">{tClient('dashboard_by_gender', locale)}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(calcStats.byGender).map(([gender, count]) => ({ gender, count }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ gender, count }) => `${gender}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {Object.entries(calcStats.byGender).map(([gender], index) => (
                        <Cell key={`cell-g-${index}`} fill={gender === 'male' ? '#06B6D4' : '#A78BFA'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Calculator by Age Bucket */}
            {calcStats && (
              <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">{tClient('dashboard_by_age_queries', locale)}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(calcStats.byAgeBucket || {}).map(([ageGroup, count]) => ({ ageGroup, count }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ageGroup" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Calculator by Coverage Bucket */}
            {calcStats && (
              <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">{tClient('dashboard_by_coverage', locale)}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(calcStats.byCoverageBucket || {}).map(([range, count]) => ({ range, count }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#06B6D4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

            {/* Most Used Parameters */}
            <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">{tClient('dashboard_most_params', locale)}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.calculator.mostUsedParams}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="param" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#84CC16" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        
      ) : (
        <div className="space-y-6">
          {/* Agent Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group relative overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-teal-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-200 to-teal-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-3xl font-bold text-cyan-600 mb-2">{data.agentApplications?.total || 0}</div>
                <div className="text-sm font-semibold text-gray-900">{tClient('dashboard_your_apps', locale)}</div>
                <div className="text-xs text-cyan-600 mt-1">{tClient('dashboard_planb_apps', locale)}</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {data.agentApplications?.byStatus.find(s => s.status === 'Təsdiqlənib')?.count || 0}
                </div>
                <div className="text-sm font-semibold text-gray-900">{tClient('dashboard_approved', locale)}</div>
                <div className="text-xs text-emerald-600 mt-1">{tClient('dashboard_successful', locale)}</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {data.agentApplications?.byStatus.find(s => s.status === 'Gözləmədə')?.count || 0}
                </div>
                <div className="text-sm font-semibold text-gray-900">{tClient('dashboard_pending', locale)}</div>
                <div className="text-xs text-orange-600 mt-1">{tClient('dashboard_waiting', locale)}</div>
              </div>
            </div>
          </div>

          {/* Agent Applications Chart */}
          <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">{tClient('dashboard_your_by_status', locale)}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.agentApplications?.byStatus || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.status}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(data.agentApplications?.byStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
