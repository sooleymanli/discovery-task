'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

type Agent = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  telegram_chat_id: string | null;
  status: string | null;
  role: string;
};

export default function AgentsPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', chatId: '' });
  const [message, setMessage] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('agent');
  const [roleLoading, setRoleLoading] = useState(true);

  const loadAgents = async () => {
    const res = await fetch('/api/admin/agents');
    const j = await res.json();
    setAgents(j.agents ?? []);
  };

  useEffect(() => {
    const checkRole = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userData.user.id)
          .single();
        
        const role = profile?.role || 'agent';
        setUserRole(role);
        
        if (role !== 'superadmin') {
          router.push('/admin/dashboard');
          return;
        }
        
        await loadAgents();
      }
      setRoleLoading(false);
    };
    
    checkRole();
  }, [supabase, router]);

  const createAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      // 1) Admin API ilə istifadəçi dəvət et (parol təyin etməsi üçün email)
      const res = await fetch('/api/admin/agents/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          fullName: form.fullName,
          phone: form.phone,
          chatId: form.chatId,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? 'Invite failed');
      setMessage('Agent dəvəti göndərildi');
      setForm({ fullName: '', email: '', phone: '', chatId: '' });
      await loadAgents();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const deleteAgent = async (id: string) => {
    if (!confirm('Bu agenti silmək istədiyinizə əminsiniz?')) return;
    const res = await fetch(`/api/admin/agents/${id}`, { method: 'DELETE' });
    const j = await res.json();
    if (!res.ok) {
      alert(j.error ?? 'Silinmədi');
      return;
    }
    await loadAgents();
  };

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-teal-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="text-center">
            <p className="text-gray-700 font-semibold text-lg">Yüklənir...</p>
            <p className="text-gray-500 text-sm mt-1">Zəhmət olmasa gözləyin</p>
          </div>
        </div>
      </div>
    );
  }

  if (userRole !== 'superadmin') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-100 to-pink-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Giriş İcazəsi Yoxdur</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Bu səhifəyə giriş icazəniz yoxdur. Yalnız superadmin istifadəçiləri agentləri idarə edə bilər.
          </p>
          <motion.button 
            onClick={() => router.push('/admin/dashboard')} 
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Geri qayıt
            </div>
          </motion.button>
        </div>
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
                PlanB Agentlər
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent">
                Agentlər
              </h1>
              <p className="text-lg text-gray-700 mt-2">
                PlanB agentlərinin idarə edilməsi və izlənilməsi
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Ümumi agent</div>
                <div className="text-2xl font-bold text-cyan-600">{agents.length}</div>
              </div>
              <button
                onClick={loadAgents}
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

      {/* Add Agent Form */}
      <div className="relative">
        <div className="rounded-2xl border border-cyan-100 bg-white/80 backdrop-blur-sm p-6 shadow-lg">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Yeni Agent Əlavə Et</h2>
            <p className="text-gray-600">PlanB komandasına yeni agent əlavə edin</p>
          </div>
          
          <form onSubmit={createAgent} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Ad Soyad *</label>
              <input 
                className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80" 
                placeholder="Ad Soyad"
                value={form.fullName} 
                onChange={(e) => setForm({ ...form, fullName: e.target.value })} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Email *</label>
              <input 
                className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80" 
                placeholder="email@example.com"
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Mobil nömrə</label>
              <input 
                className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80" 
                placeholder="+994 XX XXX XX XX"
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Telegram Chat ID</label>
              <input 
                className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80" 
                placeholder="123456789"
                value={form.chatId} 
                onChange={(e) => setForm({ ...form, chatId: e.target.value })} 
              />
            </div>
            <div className="md:col-span-4">
              <motion.button 
                disabled={loading} 
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                <div className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Göndərilir...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Agent yarat və dəvət et
                    </>
                  )}
                </div>
              </motion.button>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm text-cyan-600 font-medium text-center"
                >
                  {message}
                </motion.div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Agents Table */}
      <div className="rounded-2xl border border-cyan-100 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-50 to-teal-50 px-6 py-4 border-b border-cyan-100">
          <h3 className="text-lg font-semibold text-gray-900">Agentlər Siyahısı</h3>
          <p className="text-sm text-gray-600 mt-1">PlanB komandasının agentləri</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-cyan-50 to-teal-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Ad Soyad</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Telefon</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Telegram</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a, index) => (
                <motion.tr 
                  key={a.id} 
                  className="border-t border-cyan-100 hover:bg-cyan-50/50 transition-colors duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <td className="px-6 py-4 text-gray-900 font-medium">{a.full_name}</td>
                  <td className="px-6 py-4 text-gray-600">{a.email}</td>
                  <td className="px-6 py-4 text-gray-600">{a.phone}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-xs">{a.telegram_chat_id}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      a.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        a.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}></div>
                      {a.status === 'active' ? 'Aktiv' : 'Qeyri-aktiv'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <motion.button 
                      onClick={() => deleteAgent(a.id)} 
                      className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-all duration-300"
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
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {agents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-100 to-teal-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Agent yoxdur</h3>
            <p className="text-gray-600">Hələlik heç bir agent əlavə edilməyib</p>
          </div>
        )}
      </div>
    </div>
  );
}


