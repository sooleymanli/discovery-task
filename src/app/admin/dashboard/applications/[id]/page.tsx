'use client';

import { useEffect, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { useParams } from 'next/navigation';

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const applicationId = params?.id;
  const [messages, setMessages] = useState<{ id: string; created_at: string; sender: string; body: string }[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const adminChannelRef = useRef<any>(null);

  const loadMessages = async () => {
    try {
      const supa = (await import('@/lib/supabase')).createSupabaseBrowserClient();
      const { data: { session } } = await supa.auth.getSession();
      setCurrentUserId(session?.user?.id ?? null);
      const res = await fetch(`/api/admin/applications/${applicationId}/messages`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      const j = await res.json();
      if (res.ok) {
        setMessages(j.messages || []);
      } else {
        console.error('Failed to load messages:', j);
        setToast(`Mesajları yükləmək alınmadı: ${j.error || 'Naməlum xəta'}`);
        setTimeout(() => setToast(null), 5000);
      }
    } catch (error) {
      console.error('Load messages error:', error);
      setToast(`Xəta: ${error instanceof Error ? error.message : 'Naməlum xəta'}`);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const sendMessage = async () => {
    if (!msg.trim()) return;
    setLoading(true);
    try {
      const { data: { session } } = await (await import('@/lib/supabase')).createSupabaseBrowserClient().auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
      
      const res = await fetch(`/api/admin/applications/${applicationId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ body: msg }),
      });
      const j = await res.json();
      if (!res.ok) {
        console.error('Failed to send message:', j);
        throw new Error(j.error || 'Göndərmə alınmadı');
      }
      setMsg('');
      await loadMessages();
      setToast('Mesaj göndərildi');
      setTimeout(() => setToast(null), 2500);
      try {
        adminChannelRef.current?.send?.({ type: 'broadcast', event: 'new_message', payload: { applicationId } });
      } catch {}
    } catch (error) {
      console.error('Send message error:', error);
      setToast(`Mesaj göndərmək alınmadı: ${error instanceof Error ? error.message : 'Naməlum xəta'}`);
      setTimeout(() => setToast(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) loadMessages();
  }, [applicationId]);

  // Auto-scroll to latest message on updates
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Realtime subscription for admin view (postgres changes + broadcast fallback)
  useEffect(() => {
    if (!applicationId) return;
    const supabase = createSupabaseBrowserClient();
    const channel = (supabase as any)
      .channel(`admin-messages-${applicationId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'application_messages', filter: `application_id=eq.${applicationId}` }, (payload: any) => {
        const row = (payload.new || payload.record) as any;
        if (!row) return;
        setMessages(prev => (prev.some(m => (m as any).id === row.id) ? prev : [...prev, row]));
      })
      .on('broadcast', { event: 'new_message' }, async () => {
        await loadMessages();
      })
      .subscribe();

    adminChannelRef.current = channel;

    return () => {
      try { (supabase as any).removeChannel(channel); } catch {}
    };
  }, [applicationId]);

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-2xl border border-cyan-100 bg-white shadow-sm flex flex-col h-[78vh]">
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-cyan-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 text-white flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Müraciət Yazışması</div>
              <div className="text-xs text-gray-500">Agent cavabları solda, müraciətçi mesajları sağda</div>
            </div>
          </div>
          <button onClick={loadMessages} className="text-xs text-cyan-700 hover:text-cyan-900 underline">Yenilə</button>
        </div>

        {/* Chat Messages */}
        <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-b from-white to-cyan-50/50">
          {messages.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-16">Hələ mesaj yoxdur</div>
          ) : (
            <div className="space-y-3">
              {messages.map((m: any) => {
                const isOwn = m.author_user_id && currentUserId && m.author_user_id === currentUserId;
                const alignClass = isOwn ? 'justify-end' : 'justify-start';
                const bubbleClass = isOwn ? 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 text-white' : 'bg-white border border-cyan-100 text-gray-800';
                const who = m.sender !== 'agent' ? 'Müraciətçi' : (m.author_role === 'superadmin' ? 'Admin' : 'Agent');
                return (
                  <div key={m.id} className={`flex ${alignClass}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${bubbleClass}`}>
                      <div className="text-xs opacity-80 mb-0.5">{isOwn ? 'Siz' : who}</div>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.body}</div>
                      <div className={`text-[10px] mt-1 ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>{new Date(m.created_at).toLocaleString('az-AZ')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="px-4 py-3 border-t border-cyan-100 bg-white">
          <div className="flex flex-col items-end gap-3">
            <textarea value={msg} onChange={e => setMsg(e.target.value)} className="w-full sm:flex-1 rounded-xl border border-cyan-200 p-3 h-24 shadow-inner focus:border-cyan-400 focus:outline-none" placeholder="Cavab yazın..." />
            <button onClick={sendMessage} disabled={loading} className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold shadow-lg ${loading ? 'bg-cyan-400 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:shadow-xl'}`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              {loading ? 'Göndərilir...' : 'Göndər'}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg">{toast}</div>
        </div>
      )}
    </div>
  );
}


