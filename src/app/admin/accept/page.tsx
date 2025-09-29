'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';

function AgentAcceptContent() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase magic/invite links pass tokens in URL hash (#access_token=...) not query.
    const fromHash = () => {
      if (typeof window === 'undefined') return { at: null as string | null, rt: null as string | null };
      const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
      const sp = new URLSearchParams(hash);
      return { at: sp.get('access_token'), rt: sp.get('refresh_token') };
    };

    let access_token = params.get('access_token');
    let refresh_token = params.get('refresh_token');
    if (!access_token || !refresh_token) {
      const { at, rt } = fromHash();
      access_token = access_token ?? at;
      refresh_token = refresh_token ?? rt;
    }

    if (!access_token || !refresh_token) {
      // Show nicer error if supabase added error in hash
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
        const sp = new URLSearchParams(hash);
        const err = sp.get('error_description') ?? sp.get('error');
        if (err) setError(decodeURIComponent(err));
      }
      if (!access_token || !refresh_token) return;
    }

    (async () => {
      try {
        const { error } = await supabase.auth.setSession({ access_token: access_token!, refresh_token: refresh_token! });
        if (error) throw error;
        setSessionReady(true);
      } catch (e: unknown) {
        setError((e as Error)?.message ?? 'Sessiya qurulmadı');
      }
    })();
  }, [params]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError('Şifrə ən azı 8 simvol olmalıdır');
    if (password !== confirm) return setError('Şifrələr uyğun gəlmir');
    setLoading(true);
    setError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Sessiya yoxdur');
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) throw updErr;
      await supabase.from('profiles').update({ status: 'active' }).eq('id', userData.user.id);
      router.replace('/admin');
    } catch (e: unknown) {
      setError((e as Error)?.message ?? 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-indigo-50">
      <div className="w-full max-w-sm rounded-2xl border border-indigo-100 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Agent hesabını aktivləşdir</h1>
        <p className="text-sm text-indigo-900/70 mt-1">Yeni şifrənizi təyin edin və sistemə daxil olun.</p>

        {!sessionReady && !error && <p className="mt-4 text-sm text-indigo-900/80">Sessiya hazırlanır...</p>}
        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

        {sessionReady && (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm mb-1">Yeni şifrə</label>
              <input type="password" className="w-full rounded-lg border border-indigo-200 p-3" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Təkrar şifrə</label>
              <input type="password" className="w-full rounded-lg border border-indigo-200 p-3" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <button disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-sm">
              {loading ? 'Yüklənir...' : 'Şifrəni təyin et və daxil ol'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AgentAcceptPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-600 font-medium">Yüklənir...</p>
        </div>
      </div>
    }>
      <AgentAcceptContent />
    </Suspense>
  );
}
