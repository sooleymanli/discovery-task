'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
type Application = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  assigned_agent_id: string | null;
  notes?: string | null;
  age?: number;
  gender?: string;
  coverage_amount?: number;
  term_years?: number;
  premium_estimate?: number;
};
type Agent = { id: string; full_name: string | null; email: string | null };
type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};
export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [role, setRole] = useState<'superadmin' | 'agent' | 'unknown'>('unknown');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({ 
    q: '', 
    status: '', 
    from: '', 
    to: '',
    ageMin: '',
    ageMax: '',
    gender: '',
    coverageMin: '',
    coverageMax: '',
    termMin: '',
    termMax: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (filters.q) qs.set('q', filters.q);
      if (filters.status) qs.set('status', filters.status);
      if (filters.from) qs.set('from', filters.from);
      if (filters.to) qs.set('to', filters.to);
      if (filters.ageMin) qs.set('ageMin', filters.ageMin);
      if (filters.ageMax) qs.set('ageMax', filters.ageMax);
      if (filters.gender) qs.set('gender', filters.gender);
      if (filters.coverageMin) qs.set('coverageMin', filters.coverageMin);
      if (filters.coverageMax) qs.set('coverageMax', filters.coverageMax);
      if (filters.termMin) qs.set('termMin', filters.termMin);
      if (filters.termMax) qs.set('termMax', filters.termMax);
      qs.set('page', currentPage.toString());
      qs.set('limit', pageSize.toString());
      
      const res = await fetch('/api/admin/applications' + (qs.toString() ? `?${qs.toString()}` : ''));
      const j = await res.json();
      if (res.ok) {
        setApps(j.applications ?? []);
        setRole(j.role ?? 'unknown');
        setPagination(j.pagination ?? pagination);
      }
      // agents list (for assignment)
      const ra = await fetch('/api/admin/agents');
      const ja = await ra.json();
      setAgents(ja.agents ?? []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage, pageSize]);
  const updateStatus = async (id: string, status: string) => {
    let reason: string | undefined = undefined;
    if (status === 'closed') {
      reason = prompt('İmtina səbəbini daxil edin') ?? undefined;
    }
    await fetch('/api/admin/applications/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: id, status, reason }),
    });
    await load();
  };
  const assignTo = async (id: string, agentId: string) => {
    await fetch('/api/admin/applications/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: id, agentId }),
    });
    await load();
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
  };
  const clearAllFilters = () => {
    setFilters({ 
      q: '', 
      status: '', 
      from: '', 
      to: '',
      ageMin: '',
      ageMax: '',
      gender: '',
      coverageMin: '',
      coverageMax: '',
      termMin: '',
      termMax: ''
    });
    setCurrentPage(1);
  };
  const handleSelectAll = () => {
    if (selectedApplications.length === apps.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(apps.map(app => app.id));
    }
  };
  const handleSelectApplication = (id: string) => {
    setSelectedApplications(prev => 
      prev.includes(id) 
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    );
  };
  const handleBulkStatusChange = async (status: string) => {
    if (selectedApplications.length === 0) return;
    
    let reason: string | undefined = undefined;
    if (status === 'closed') {
      reason = prompt('İmtina səbəbini daxil edin') ?? undefined;
    }
    try {
      await Promise.all(
        selectedApplications.map(id => 
          fetch('/api/admin/applications/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId: id, status, reason }),
          })
        )
      );
      setSelectedApplications([]);
      await load();
    } catch (error) {
      console.error('Bulk status change error:', error);
    }
  };
  const handleBulkDelete = async () => {
    if (selectedApplications.length === 0) return;
    
    const confirmed = confirm(`${selectedApplications.length} müraciəti silmək istədiyinizə əminsiniz?`);
    if (!confirmed) return;
    try {
      await Promise.all(
        selectedApplications.map(id => 
          fetch(`/api/admin/applications/${id}`, {
            method: 'DELETE',
          })
        )
      );
      setSelectedApplications([]);
      await load();
    } catch (error) {
      console.error('Bulk delete error:', error);
    }
  };
  const handleExport = async (format: 'excel' | 'csv') => {
    try {
      const qs = new URLSearchParams();
      if (filters.q) qs.set('q', filters.q);
      if (filters.status) qs.set('status', filters.status);
      if (filters.from) qs.set('from', filters.from);
      if (filters.to) qs.set('to', filters.to);
      if (filters.ageMin) qs.set('ageMin', filters.ageMin);
      if (filters.ageMax) qs.set('ageMax', filters.ageMax);
      if (filters.gender) qs.set('gender', filters.gender);
      if (filters.coverageMin) qs.set('coverageMin', filters.coverageMin);
      if (filters.coverageMax) qs.set('coverageMax', filters.coverageMax);
      if (filters.termMin) qs.set('termMin', filters.termMin);
      if (filters.termMax) qs.set('termMax', filters.termMax);
      qs.set('format', format);
      const response = await fetch(`/api/admin/applications/export?${qs.toString()}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `muracietler_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'csv' : 'csv'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };
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
                PlanB Müraciətlər
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent">
                Müraciətlər
              </h1>
              <p className="text-lg text-gray-700 mt-2">
                PlanB müraciətlərinin idarə edilməsi və izlənilməsi
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Ümumi müraciət</div>
                <div className="text-2xl font-bold text-cyan-600">{pagination.total}</div>
              </div>
              <button
                onClick={load}
                className="rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Yenilə
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Filters Section */}
      <div className="relative">
        <div className="rounded-2xl border border-cyan-100 bg-white/80 backdrop-blur-sm p-6 shadow-lg">
          <div className="space-y-4">
            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Axtarış</label>
                <input 
                  className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80" 
                  placeholder="Ad, email, telefon..."
                  value={filters.q} 
                  onChange={(e) => handleFilterChange({ ...filters, q: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select 
                  className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80" 
                  value={filters.status} 
                  onChange={(e) => handleFilterChange({ ...filters, status: e.target.value })}
                >
                  <option value="">Hamısı</option>
                  <option value="pending">Gözləmədə</option>
                  <option value="in_progress">Təsdiqlənib</option>
                  <option value="closed">İmtina olunub</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Başlama tarixi</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80" 
                  value={filters.from} 
                  onChange={(e) => handleFilterChange({ ...filters, from: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bitmə tarixi</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80" 
                  value={filters.to} 
                  onChange={(e) => handleFilterChange({ ...filters, to: e.target.value })} 
                />
              </div>
            </div>
            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-cyan-100">
              <motion.button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-800 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className={`w-4 h-4 transition-transform duration-300 ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Gelişmiş Filterlər
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => handleExport('excel')}
                    className="px-4 py-2 text-sm font-semibold text-emerald-600 hover:text-emerald-800 border border-emerald-200 rounded-xl hover:bg-emerald-50 flex items-center gap-2 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Excel
                  </motion.button>
                  <motion.button
                    onClick={() => handleExport('csv')}
                    className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 rounded-xl hover:bg-blue-50 flex items-center gap-2 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CSV
                  </motion.button>
                </div>
                <motion.button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm font-semibold text-cyan-600 hover:text-cyan-800 border border-cyan-200 rounded-xl hover:bg-cyan-50 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Filterləri Təmizlə
                </motion.button>
              </div>
            </div>
            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl border border-cyan-100"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Yaş Aralığı</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80 text-sm"
                      value={filters.ageMin}
                      onChange={(e) => handleFilterChange({ ...filters, ageMin: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80 text-sm"
                      value={filters.ageMax}
                      onChange={(e) => handleFilterChange({ ...filters, ageMax: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cinsiyyət</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80 text-sm"
                    value={filters.gender}
                    onChange={(e) => handleFilterChange({ ...filters, gender: e.target.value })}
                  >
                    <option value="">Hamısı</option>
                    <option value="male">Kişi</option>
                    <option value="female">Qadın</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sığorta Məbləği (AZN)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80 text-sm"
                      value={filters.coverageMin}
                      onChange={(e) => handleFilterChange({ ...filters, coverageMin: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80 text-sm"
                      value={filters.coverageMax}
                      onChange={(e) => handleFilterChange({ ...filters, coverageMax: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Müddət (il)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80 text-sm"
                      value={filters.termMin}
                      onChange={(e) => handleFilterChange({ ...filters, termMin: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80 text-sm"
                      value={filters.termMax}
                      onChange={(e) => handleFilterChange({ ...filters, termMax: e.target.value })}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        </div>
      {/* Bulk Actions */}
      {selectedApplications.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-2xl border border-cyan-200 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{selectedApplications.length}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  müraciət seçildi
                </span>
              </div>
              <motion.button
                onClick={() => setSelectedApplications([])}
                className="text-sm font-medium text-cyan-600 hover:text-cyan-800 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Seçimi ləğv et
              </motion.button>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                onChange={(e) => handleBulkStatusChange(e.target.value)}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-cyan-200 bg-white/80 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                defaultValue=""
              >
                <option value="">Status dəyiş</option>
                <option value="pending">Gözləmədə</option>
                <option value="in_progress">Təsdiqlənib</option>
                <option value="closed">İmtina olunub</option>
              </select>
              
              <motion.button
                onClick={handleBulkDelete}
                className="px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Sil
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
      {/* Pagination Controls */}
      {!loading && (
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700">Səhifədə:</label>
              <select 
                value={pageSize} 
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-cyan-200 bg-white/80 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm font-medium"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="text-sm font-medium text-gray-600 bg-cyan-50 px-4 py-2 rounded-xl border border-cyan-200">
              {pagination.total > 0 ? (
                <>
                  {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, pagination.total)} / {pagination.total} müraciət
                </>
              ) : (
                'Müraciət yoxdur'
              )}
            </div>
          </div>
        
          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-4 py-2 rounded-xl border border-cyan-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-50 transition-all duration-300 bg-white/80"
                whileHover={{ scale: !pagination.hasPrev ? 1 : 1.05 }}
                whileTap={{ scale: !pagination.hasPrev ? 1 : 0.95 }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Əvvəlki
                </div>
              </motion.button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <motion.button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg'
                          : 'border border-cyan-200 hover:bg-cyan-50 bg-white/80'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {pageNum}
                    </motion.button>
                  );
                })}
              </div>
              
              <motion.button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-4 py-2 rounded-xl border border-cyan-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-50 transition-all duration-300 bg-white/80"
                whileHover={{ scale: !pagination.hasNext ? 1 : 1.05 }}
                whileTap={{ scale: !pagination.hasNext ? 1 : 0.95 }}
              >
                <div className="flex items-center gap-2">
                  Sonrakı
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.button>
            </div>
          )}
        </div>
      )}
      {!loading && apps.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-2xl border border-cyan-100 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-cyan-50 to-teal-50">
                <tr>
                  <th className="px-4 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedApplications.length === apps.length && apps.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500"
                    />
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-900">Tarix</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-900">Ad Soyad</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-900">Email</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-900">Telefon</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-900">Status</th>
                  {role === 'superadmin' && <th className="px-6 py-4 text-left font-semibold text-gray-900">Təyinat</th>}
                  <th className="px-4 py-4">Rəy</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <motion.tr 
                    key={a.id} 
                    className={`border-t border-cyan-100 hover:bg-cyan-50/50 transition-colors duration-300 ${selectedApplications.includes(a.id) ? 'bg-cyan-50' : ''}`}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedApplications.includes(a.id)}
                        onChange={() => handleSelectApplication(a.id)}
                        className="w-4 h-4 rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500"
                      />
                    </td>
                    <td className="px-4 py-4 text-gray-700 font-medium">{new Date(a.created_at).toLocaleString()}</td>
                    <td className="px-4 py-4 text-gray-900 font-semibold">
                      <a href={`/admin/dashboard/applications/${a.id}`} className="text-cyan-700 hover:text-cyan-900 underline decoration-cyan-300 underline-offset-4">
                        {a.full_name}
                      </a>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{a.email}</td>
                    <td className="px-4 py-4 text-gray-600">{a.phone ?? '-'}</td>
                    <td className="px-4 py-4">
                      <select 
                        defaultValue={a.status} 
                        onChange={(e) => updateStatus(a.id, e.target.value)} 
                        className="px-3 py-2 rounded-xl border border-cyan-200 bg-white/80 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm font-medium"
                      >
                        <option value="pending">Gözləmədə</option>
                        <option value="in_progress">Təsdiqlənib</option>
                        <option value="closed">İmtina olunub</option>
                      </select>
                    </td>
                    {role === 'superadmin' && (
                      <td className="px-4  py-4">
                        <select 
                          value={a.assigned_agent_id ?? ''} 
                          onChange={(e) => assignTo(a.id, e.target.value)} 
                          className="px-3 py-2 rounded-xl border border-cyan-200 bg-white/80 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm font-medium"
                        >
                          <option value="">Seçin</option>
                          {agents.map((ag) => (
                            <option key={ag.id} value={ag.id}>{ag.full_name ?? ag.email}</option>
                          ))}
                        </select>
                      </td>
                    )}
                    <td className="px-4 py-4 text-xs text-cyan-600 font-medium">
                      {a.notes ? (
                        <span title={`İmtina səbəbi: ${a.notes}`} className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {a.notes}
                        </span>
                      ) : (
                        ''
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {apps.map((a) => (
              <motion.div 
                key={a.id} 
                className={`rounded-2xl border border-cyan-100 bg-white/90 backdrop-blur-sm shadow-lg p-6 ${selectedApplications.includes(a.id) ? 'bg-cyan-50' : ''}`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(a.id)}
                      onChange={() => handleSelectApplication(a.id)}
                      className="w-4 h-4 rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{a.full_name}</h3>
                      <p className="text-sm text-gray-600 font-medium">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <select 
                      defaultValue={a.status} 
                      onChange={(e) => updateStatus(a.id, e.target.value)} 
                      className="px-3 py-2 text-sm rounded-xl border border-cyan-200 bg-white/80 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 font-medium"
                    >
                      <option value="pending">Gözləmədə</option>
                      <option value="in_progress">Təsdiqlənib</option>
                      <option value="closed">İmtina olunub</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-xl">
                    <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">{a.email}</span>
                  </div>
                  {a.phone && (
                    <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl">
                      <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{a.phone}</span>
                    </div>
                  )}
                  {a.age && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{a.age} yaş, {a.gender === 'male' ? 'Kişi' : a.gender === 'female' ? 'Qadın' : ''}</span>
                    </div>
                  )}
                  {a.coverage_amount && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{a.coverage_amount} AZN</span>
                    </div>
                  )}
                  {a.term_years && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{a.term_years} il</span>
                    </div>
                  )}
                  {a.premium_estimate && (
                    <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
                      <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{a.premium_estimate} AZN/ay</span>
                    </div>
                  )}
                </div>
                {role === 'superadmin' && (
                  <div className="mt-4 pt-4 border-t border-cyan-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Agent təyinatı:</label>
                    <select 
                      value={a.assigned_agent_id ?? ''} 
                      onChange={(e) => assignTo(a.id, e.target.value)} 
                      className="w-full px-4 py-3 text-sm rounded-xl border border-cyan-200 bg-white/80 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 font-medium"
                    >
                      <option value="">Seçin</option>
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id}>{ag.full_name ?? ag.email}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`/admin/dashboard/applications/${a.id}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mesajlar və Detallar
                  </a>
                  {role === 'superadmin' && (
                    <button
                      onClick={() => assignTo(a.id, '')}
                      className="hidden"
                    />
                  )}
                </div>

                {a.notes && (
                  <div className="mt-4 pt-4 border-t border-cyan-100">
                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{a.notes}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </>
      ) : !loading ? (
        <div className="rounded-2xl border border-cyan-100 bg-white/90 backdrop-blur-sm shadow-xl">
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-100 to-teal-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Müraciət tapılmadı</h3>
            <p className="text-gray-600 mb-8 max-w-md text-lg">
              {filters.q || filters.status || filters.from || filters.to 
                ? 'Axtarış şərtlərinizə uyğun müraciət tapılmadı. Filterləri dəyişdirərək yenidən cəhd edin.'
                : 'Hələlik heç bir müraciət yoxdur. Yeni müraciətlər gələndə burada görünəcək.'
              }
            </p>
            {(filters.q || filters.status || filters.from || filters.to) && (
              <motion.button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Filterləri Təmizlə
                </div>
              </motion.button>
            )}
          </div>
        </div>
      ) : null}
      {loading && (
        <div className="mb-6 rounded-2xl border border-cyan-100 bg-white/90 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-teal-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <div className="text-center">
                <p className="text-gray-700 font-semibold text-lg">Müraciətlər yüklənir...</p>
                <p className="text-gray-500 text-sm mt-1">Zəhmət olmasa gözləyin</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
