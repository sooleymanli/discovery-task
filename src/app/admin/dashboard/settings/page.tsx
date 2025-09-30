'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('agent');
  const [roleLoading, setRoleLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [telegramChatId, setTelegramChatId] = useState<string>('');
  const [savingChat, setSavingChat] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatSuccess, setChatSuccess] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/admin/login');
        return;
      }

      // Check user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, telegram_chat_id')
        .eq('id', data.user.id)
        .single();
      
      const role = profile?.role || 'agent';
      setUserRole(role);
   
      setEmail(data.user.email ?? '');
      setUserId(data.user.id);
      if (profile?.telegram_chat_id) setTelegramChatId(profile.telegram_chat_id as string);
      setRoleLoading(false);
    };
    init();
  }, [supabase, router]);

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('İstifadəçi tapılmadı.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Yeni şifrə ən az 8 simvol olmalıdır.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Yeni şifrə və təkrar şifrə eyni deyil.');
      return;
    }

    setLoading(true);
    // Re-authenticate with current password
    const { error: reauthError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (reauthError) {
      setLoading(false);
      setError('Cari şifrə yanlışdır.');
      return;
    }

    const { error: updError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (updError) {
      setError(updError.message || 'Şifrə yenilənə bilmədi.');
      return;
    }
    setSuccess('Şifrəniz uğurla yeniləndi.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const onSaveChatId = async (e: React.FormEvent) => {
    e.preventDefault();
    setChatError(null);
    setChatSuccess(null);
    if (!userId) return;
    setSavingChat(true);
    const { error } = await supabase.from('profiles').update({ telegram_chat_id: telegramChatId || null }).eq('id', userId);
    setSavingChat(false);
    if (error) {
      setChatError(error.message || 'Yadda saxlanılmadı.');
      return;
    }
    setChatSuccess('Telegram chat_id yeniləndi.');
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 p-6">
      {/* Header Section */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-900 via-teal-900 to-emerald-900 bg-clip-text text-transparent">
              Tənzimləmələr
            </h1>
            <p className="text-cyan-600 text-sm">PlanB Admin Panel - Hesab tənzimləmələri</p>
          </div>
        </div>
      </motion.div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Password Change Card */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cyan-100/60 p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Şifrəni Yenilə</h2>
              <p className="text-cyan-600 text-sm">Hesab təhlükəsizliyi üçün güclü şifrə seçin</p>
            </div>
          </div>

          <form onSubmit={onChangePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input 
                value={email} 
                disabled 
                className="w-full rounded-xl border border-cyan-200 p-4 bg-cyan-50/50 text-gray-600 cursor-not-allowed" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cari şifrə</label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                required 
                className="w-full rounded-xl border border-cyan-200 p-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200" 
                placeholder="Cari şifrənizi yazın" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Yeni şifrə</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                className="w-full rounded-xl border border-cyan-200 p-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200" 
                placeholder="Yeni şifrə" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Yeni şifrə (təkrar)</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                className="w-full rounded-xl border border-cyan-200 p-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200" 
                placeholder="Yeni şifrəni təkrar yazın" 
              />
            </div>

            {error && (
              <motion.div 
                className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}
            
            {success && (
              <motion.div 
                className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-emerald-600">{success}</p>
              </motion.div>
            )}

            <motion.button 
              disabled={loading} 
              type="submit" 
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-6 py-4 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Yenilənir...</span>
                </div>
              ) : (
                'Şifrəni Yenilə'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Telegram Settings Card */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cyan-100/60 p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.626 4.476-1.635z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Telegram Chat ID</h2>
              <p className="text-purple-600 text-sm">Agent təyinatı və bildirişlər üçün istifadə olunur</p>
            </div>
          </div>
          
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
            <p className="text-sm font-semibold text-gray-700 mb-3">Chat ID-ni necə öyrənmək olar:</p>
            <a 
              href="https://t.me/userinfobot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 underline transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.626 4.476-1.635z"/>
              </svg>
              Chat ID-ni öyrən (@userinfobot)
            </a>
            <p className="text-xs text-gray-600 mt-2">Linkə daxil olun və bot sizin ID-nizi göstərəcək</p>
          </div>

          <form onSubmit={onSaveChatId} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Chat ID</label>
              <input 
                value={telegramChatId} 
                onChange={(e) => setTelegramChatId(e.target.value)} 
                className="w-full rounded-xl border border-purple-200 p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" 
                placeholder="Məs: 123456789" 
              />
            </div>

            {chatError && (
              <motion.div 
                className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600">{chatError}</p>
              </motion.div>
            )}
            
            {chatSuccess && (
              <motion.div 
                className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-emerald-600">{chatSuccess}</p>
              </motion.div>
            )}

            <motion.button 
              disabled={savingChat} 
              type="submit" 
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 px-6 py-4 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {savingChat ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Yadda saxlanılır...</span>
                </div>
              ) : (
                'Yadda Saxla'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}


