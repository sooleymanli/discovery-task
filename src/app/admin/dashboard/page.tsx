'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
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
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000);

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
        setError('Profil məlumatları yüklənə bilmədi');
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
        throw new Error('Dashboard məlumatları yüklənə bilmədi');
      }

      const dashboardData = await response.json();
      setData({ ...dashboardData, role });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xəta baş verdi');
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
        <div className="text-cyan-600">Yüklənir...</div>
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
          Yenidən yoxla
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600">Məlumat yüklənə bilmədi</div>
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
                İcmal
              </h1>
              <p className="text-lg text-gray-700 mt-2">
                {data.role === 'superadmin' ? 'Ümumi statistika və analitika' : 'Sizin müraciətləriniz'}
              </p>
              {lastUpdated && (
                <p className="text-sm text-cyan-600 mt-2 font-medium">
                  Son yenilənmə: {lastUpdated.toLocaleTimeString('az-AZ')}
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
                Yenilə
              </button>
            </div>
          </div>
        </div>
      </div>

      {data.role === 'superadmin' ? (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group relative overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-teal-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-200 to-teal-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-3xl font-bold text-cyan-600 mb-2">{data.applications.total}</div>
                <div className="text-sm font-semibold text-gray-900">Ümumi Müraciət</div>
                <div className="text-xs text-cyan-600 mt-1">PlanB müraciətləri</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-3xl font-bold text-emerald-600 mb-2">{data.agents.total}</div>
                <div className="text-sm font-semibold text-gray-900">Aktiv Agent</div>
                <div className="text-xs text-emerald-600 mt-1">İşləyən agentlər</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-3xl font-bold text-purple-600 mb-2">{data.calculator.totalUses}</div>
                <div className="text-sm font-semibold text-gray-900">Kalkulyator İstifadəsi</div>
                <div className="text-xs text-purple-600 mt-1">Qiymət hesablamaları</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-3xl font-bold text-orange-600 mb-2">{data.business.monthlyGrowth}%</div>
                <div className="text-sm font-semibold text-gray-900">Aylıq Artım</div>
                <div className="text-xs text-orange-600 mt-1">PlanB böyüməsi</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-teal-200 to-cyan-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-3xl font-bold text-teal-600 mb-2">{data.calculator.conversionRate}%</div>
                <div className="text-sm font-semibold text-gray-900">Çevrilmə Faizi</div>
                <div className="text-xs text-teal-600 mt-1">Kalkulyator → Müraciət</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-3xl font-bold text-pink-600 mb-2">{data.business.revenueProjection} AZN</div>
                <div className="text-sm font-semibold text-gray-900">Gəlir Proqnozu</div>
                <div className="text-xs text-pink-600 mt-1">Aylıq gəlir</div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
            {/* Applications by Status */}
            <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Müraciətlər Statusa Görə</h3>
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
              <h3 className="text-lg font-semibold mb-4">Yaş Qruplarına Görə</h3>
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
              <h3 className="text-lg font-semibold mb-4">Cinsiyyət Paylanması</h3>
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
              <h3 className="text-lg font-semibold mb-4">Sığorta Məbləği Paylanması</h3>
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

            {/* Daily Trend */}
            <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Günlük Müraciət Trendi</h3>
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

            {/* Calculator Usage by Weekday */}
            <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Həftənin Günlərinə Görə İstifadə</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.calculator.byWeekday}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="uses" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Agent Performance */}
            <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Agent Performansı</h3>
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
            <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Peak Saatlar</h3>
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

            {/* Most Used Parameters */}
            <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Ən Çox İstifadə Olunan Parametrlər</h3>
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
        </div>
      ) : (
        <div className="space-y-6">
          {/* Agent Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group relative overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-teal-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-200 to-teal-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-3xl font-bold text-cyan-600 mb-2">{data.agentApplications?.total || 0}</div>
                <div className="text-sm font-semibold text-gray-900">Sizin Müraciətləriniz</div>
                <div className="text-xs text-cyan-600 mt-1">PlanB müraciətləri</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {data.agentApplications?.byStatus.find(s => s.status === 'Təsdiqlənib')?.count || 0}
                </div>
                <div className="text-sm font-semibold text-gray-900">Təsdiqlənmiş</div>
                <div className="text-xs text-emerald-600 mt-1">Uğurlu müraciətlər</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {data.agentApplications?.byStatus.find(s => s.status === 'Gözləmədə')?.count || 0}
                </div>
                <div className="text-sm font-semibold text-gray-900">Gözləmədə</div>
                <div className="text-xs text-orange-600 mt-1">Gözləyən müraciətlər</div>
              </div>
            </div>
          </div>

          {/* Agent Applications Chart */}
          <div className="rounded-xl border border-cyan-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Müraciətləriniz Statusa Görə</h3>
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
