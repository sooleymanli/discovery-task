'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we have the necessary tokens in the URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      // Set the session with the tokens from the URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  }, [searchParams, supabase.auth]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Şifrələr uyğun gəlmir');
      return;
    }

    if (password.length < 6) {
      setError('Şifrə ən azı 6 simvol olmalıdır');
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="h-[100vh] flex items-center justify-center bg-gradient-to-b from-white to-indigo-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5 }} 
          className="w-full max-w-sm rounded-2xl border border-indigo-100 bg-white p-8 shadow-sm text-center"
        >
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-green-600 mb-2">Şifrə Yeniləndi!</h1>
          <p className="text-sm text-indigo-900/70 mb-4">Şifrəniz uğurla yeniləndi. Admin panelyə yönləndirilirsiniz...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[100vh]  flex items-center justify-center bg-gradient-to-b from-white to-indigo-50">
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="w-full max-w-sm rounded-2xl border border-indigo-100 bg-white p-8 shadow-sm"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500" />
          <h1 className="text-xl font-semibold">Yeni Şifrə Təyin Et</h1>
          <p className="text-sm text-indigo-900/70 mt-1">Yeni şifrənizi daxil edin</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Yeni Şifrə</label>
            <input 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type="password" 
              required 
              className="w-full rounded-lg border border-indigo-200 p-3" 
              placeholder="••••••••" 
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Şifrəni Təsdiq Et</label>
            <input 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              type="password" 
              required 
              className="w-full rounded-lg border border-indigo-200 p-3" 
              placeholder="••••••••" 
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <motion.button 
            whileHover={{ scale: 1.01 }} 
            whileTap={{ scale: 0.98 }} 
            disabled={loading} 
            type="submit" 
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-sm"
          >
            {loading ? 'Yenilənir...' : 'Şifrəni Yenilə'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
