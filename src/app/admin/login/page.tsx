'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { tClient, useLocale } from '@/lib/i18n/client';

export default function AdminLogin() {
  const [locale] = useLocale();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace('/admin');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    setForgotPasswordLoading(false);
    if (error) {
      setForgotPasswordMessage(`${tClient('admin_reset_error', locale)}: ${error.message}`);
    } else {
      setForgotPasswordMessage(tClient('admin_reset_success', locale));
    }
  };

  // If already signed in, push to /admin
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/admin/dashboard');
    });
  }, []);

  return (
    <div className="h-[100vh] border  flex items-center justify-center bg-gradient-to-b from-white to-indigo-50">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm rounded-2xl border border-indigo-100 bg-white p-8 shadow-sm">


        {!showForgotPassword ? (
          <>
            <div className="mb-6 text-center">
              <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500" />
              <h1 className="text-xl font-semibold">{tClient('admin_login_title', locale)}</h1>
              <p className="text-sm text-indigo-900/70 mt-1">{tClient('admin_login_desc', locale)}</p>
            </div>
            <form onSubmit={signIn} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">{tClient('admin_email', locale)}</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full rounded-lg border border-indigo-200 p-3" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm mb-1">{tClient('admin_password', locale)}</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="w-full rounded-lg border border-indigo-200 p-3" placeholder={tClient('admin_password_ph', locale)} />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit" className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-sm">
                {loading ? tClient('admin_logging_in', locale) : tClient('admin_login_btn', locale)}
              </motion.button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                >
                  {tClient('admin_forgot_password', locale)}
                </button>
              </div>
            </form>
          </>
        ) : (

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold text-indigo-900">{tClient('admin_reset_title', locale)}</h2>
              <p className="text-sm text-indigo-900/70 mt-1">{tClient('admin_reset_desc', locale)}</p>
            </div>
            <div>
        
              <input
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                type="email"
                required
                className="w-full rounded-lg border border-indigo-200 p-3"
                placeholder={tClient('admin_reset_email_ph', locale)}
              />
            </div>
            {forgotPasswordMessage && (
              <p className={`text-sm ${forgotPasswordMessage.includes(tClient('admin_reset_error', locale)) ? 'text-red-600' : 'text-green-600'}`}>
                {forgotPasswordMessage}
              </p>
            )}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={forgotPasswordLoading}
                type="submit"
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-sm"
              >
                {forgotPasswordLoading ? tClient('admin_reset_sending', locale) : tClient('admin_reset_send', locale)}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="flex-1 rounded-xl border border-indigo-200 px-6 py-3 font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                {tClient('admin_back', locale)}
              </motion.button>
            </div>
          </form>


        )}
      </motion.div>
    </div>
  );
}




