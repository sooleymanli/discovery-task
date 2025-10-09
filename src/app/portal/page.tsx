'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { tClient, useLocale } from '@/lib/i18n/client';

export default function PortalPage() {
  const [locale] = useLocale();
  const router = useRouter();
  const [applicationId, setApplicationId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [app, setApp] = useState<any>(null);
  const [agent, setAgent] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ id: string; created_at: string; sender: 'applicant'|'agent'; body: string }>>([]);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const portalChannelRef = useRef<any>(null);

  const loadStatus = async (idArg?: string, emailArg?: string) => {
    setLoading(true);
    setStatus(null);
    setSuccess(null);
    try {
      const idToUse = (idArg ?? applicationId).trim();
      const emailToUse = (emailArg ?? email).trim();
      if (!idToUse || !emailToUse) throw new Error(tClient('portal_error_incomplete', locale));
      const res = await fetch('/api/portal/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: idToUse, email: emailToUse }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || tClient('portal_error_notfound', locale));
      setApp(j.application);
      setAgent(j.agent);
      // Write params to URL so refresh restores state
      try {
        const params = new URLSearchParams();
        if (idToUse) params.set('applicationId', idToUse);
        if (emailToUse) params.set('email', emailToUse);
        router.replace(`/portal${params.toString() ? `?${params.toString()}` : ''}`);
      } catch {}
      // load conversation
      const mres = await fetch('/api/portal/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: idToUse, email: emailToUse }),
      });
      const mj = await mres.json();
      if (mres.ok) setMessages(mj.messages || []);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : tClient('portal_error', locale));
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    setStatus(null);
    setSuccess(null);
    const messageText = message;
    try {
      const res = await fetch('/api/portal/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, email, body: messageText }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || tClient('portal_error_failed', locale));
      setSuccess(tClient('portal_msg_sent', locale));
      setMessage('');
      
      // Auto-refresh chat after sending message
      setTimeout(async () => {
        try {
          const mres = await fetch('/api/portal/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId, email }),
          });
          const mj = await mres.json();
          if (mres.ok) setMessages(mj.messages || []);
        } catch (e) {
          console.error('Failed to refresh messages:', e);
        }
      }, 1000);

      // Broadcast to admin listeners
      try {
        (portalChannelRef.current as any)?.send?.({ type: 'broadcast', event: 'new_message', payload: { applicationId } });
      } catch {}
    } catch (e) {
      setStatus(e instanceof Error ? e.message : tClient('portal_error', locale));
    }
  };



  const statusColor = (s: string | null) => {
    if (!s) return 'bg-gray-100 text-gray-700 border-gray-200';
    if (s === 'pending') return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    if (s === 'assigned') return 'bg-cyan-50 text-cyan-800 border-cyan-200';
    if (s === 'in_progress') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (s === 'closed') return 'bg-purple-50 text-purple-800 border-purple-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Auto-scroll to the latest message whenever messages update
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // On first load, read applicationId and email from search params and auto-load
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const id = sp.get('applicationId') || '';
      const em = sp.get('email') || '';
      if (id && em) {
        setApplicationId(id);
        setEmail(em);
        setTimeout(() => {
          loadStatus(id, em);
        }, 0);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime subscription for new messages (postgres changes if available) and broadcast fallback
  useEffect(() => {
    if (!app?.id) return;
    const supabase = createSupabaseBrowserClient();
    const channel = (supabase as any)
      .channel(`portal-messages-${app.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'application_messages', filter: `application_id=eq.${app.id}` }, (payload: any) => {
        const row = (payload.new || payload.record) as { id: string; created_at: string; sender: 'applicant'|'agent'; body: string; author_role?: 'superadmin'|'agent' };
        if (!row) return;
        setMessages(prev => (prev.some(m => m.id === (row as any).id) ? prev : [...prev, row as any]));
      })
      .on('broadcast', { event: 'new_message' }, async () => {
        try {
          const mres = await fetch('/api/portal/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId: app.id, email }),
          });
          const mj = await mres.json();
          if (mres.ok) setMessages(mj.messages || []);
        } catch {}
      })
      .subscribe();

    portalChannelRef.current = channel;

    return () => {
      try { (supabase as any).removeChannel(channel); } catch {}
    };
  }, [app?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-cyan-50 to-emerald-50">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-200 to-emerald-200 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-200 to-cyan-200 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/70 px-3 py-1 text-xs font-semibold text-cyan-700 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              {tClient('portal_badge', locale)}
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">{tClient('portal_title', locale)}</h1>
            <p className="mt-2 text-gray-600">{tClient('portal_subtitle', locale)}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 text-white flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11zm0 0c-3.866 0-7 2.358-7 5.263C5 18.403 7.239 20 12 20s7-1.597 7-3.737C19 13.358 15.866 11 12 11z"/></svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{tClient('portal_login_title', locale)}</h2>
                    <p className="text-sm text-gray-600">{tClient('portal_login_desc', locale)}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="text-sm text-gray-700">{tClient('portal_app_id', locale)}</label>
                    <input value={applicationId} onChange={e => setApplicationId(e.target.value)} className="mt-1 w-full rounded-xl border border-cyan-200/70 bg-white px-3 py-2 shadow-inner focus:border-cyan-400 focus:outline-none" placeholder={tClient('portal_app_id_ph', locale)} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">{tClient('apply_email', locale)}</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-cyan-200/70 bg-white px-3 py-2 shadow-inner focus:border-cyan-400 focus:outline-none" placeholder={tClient('portal_email_ph', locale)} />
                  </div>
                  <button onClick={() => loadStatus()} disabled={loading} className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-white font-semibold shadow-lg transition-all ${loading ? 'bg-cyan-400 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:shadow-xl'}`}>
                    {loading && (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    )}
                    {loading ? tClient('loading', locale) : tClient('portal_show_status', locale)}
                  </button>
                  {status && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {status}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {!app ? (
                <div className="h-full rounded-2xl border border-dashed border-cyan-200 bg-white/70 p-8 flex items-center justify-center text-center">
                  <div>
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-200 to-emerald-200 flex items-center justify-center">
                      <svg className="w-7 h-7 text-cyan-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18"/></svg>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">{tClient('portal_empty_title', locale)}</h3>
                    <p className="mt-1 text-sm text-gray-600">{tClient('portal_empty_desc', locale)}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Modern Chat Card */}
                  <div className="rounded-2xl border border-cyan-100 bg-white shadow-sm flex flex-col h-[70vh]">
                    {/* Chat Header */}
                    <div className="px-4 py-3 border-b border-cyan-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 text-white flex items-center justify-center">
                          <span className="text-sm font-bold">{(agent?.full_name || 'A')?.slice(0,1)}</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{agent?.full_name || tClient('portal_agent', locale)}</div>
                          <div className="text-xs text-gray-500">{tClient('portal_status', locale)}: {app.status}</div>
                        </div>
                      </div>
                      <button onClick={() => loadStatus()} className="text-xs text-cyan-700 hover:text-cyan-900 underline">{tClient('portal_refresh', locale)}</button>
                    </div>

                    {/* Chat Messages */}
                    <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-b from-white to-cyan-50/50">
                      {messages.length === 0 ? (
                        <div className="text-sm text-gray-500 text-center py-16">{tClient('portal_no_messages', locale)}</div>
                      ) : (
                        <div className="space-y-3">
                          {messages.map(m => (
                            <div key={m.id} className={`flex ${m.sender === 'applicant' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${m.sender === 'applicant' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-white border border-cyan-100 text-gray-800'}`}>
                                <div className="text-xs opacity-80 mb-0.5">
                                  {m.sender === 'applicant' ? tClient('portal_you', locale) : (m as any).author_role === 'superadmin' ? tClient('portal_admin', locale) : tClient('portal_agent', locale)}
                                </div>
                                <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.body}</div>
                                <div className={`text-[10px] mt-1 ${m.sender === 'applicant' ? 'text-white/80' : 'text-gray-500'}`}>{new Date(m.created_at).toLocaleString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="px-4 py-3 border-t border-cyan-100 bg-white">
                      <div className="flex flex-col gap-3">
                        <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full rounded-xl border border-cyan-200/70 bg-white p-3 h-28 shadow-inner focus:border-cyan-400 focus:outline-none" placeholder={tClient('portal_message_ph', locale)} />
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                     
                          <div className="sm:w-48">
                            {success && (
                              <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                </svg>
                                {success}
                              </div>
                            )}
                            <button onClick={sendMessage} className="inline-flex w-full justify-center items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl h-10">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                              {tClient('portal_send', locale)}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


