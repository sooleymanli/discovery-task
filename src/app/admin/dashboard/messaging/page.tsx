'use client';

import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';

export default function MessagingPage() {
  const supabase = createSupabaseBrowserClient();
  const [role, setRole] = useState<'superadmin' | 'agent' | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'slack' | 'tg_channel' | 'tg_agents' | 'email_agents'>('slack');

  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [sendSlack, setSendSlack] = useState(true);
  const [mentionAgents, setMentionAgents] = useState(false);

  // Data for selects
  const [agents, setAgents] = useState<{ id: string; full_name: string | null; email: string | null; telegram_chat_id: string | null }[]>([]);
  const [selectedEmailAgents, setSelectedEmailAgents] = useState<string[]>([]);
  const [selectedTelegramAgents, setSelectedTelegramAgents] = useState<string[]>([]);

  const selectedEmailAgentsLabels = useMemo(() => agents.filter(a => selectedEmailAgents.includes(a.id)).map(a => a.full_name || a.email || a.id).join(', '), [agents, selectedEmailAgents]);
  const selectedTelegramAgentsLabels = useMemo(() => agents.filter(a => selectedTelegramAgents.includes(a.id)).map(a => a.full_name || a.email || a.id).join(', '), [agents, selectedTelegramAgents]);
  const [status, setStatus] = useState<string | null>(null);
  const [loadingSlack, setLoadingSlack] = useState(false);
  const [loadingTgChannel, setLoadingTgChannel] = useState(false);
  const [loadingTgAgents, setLoadingTgAgents] = useState(false);
  const [loadingEmailAgents, setLoadingEmailAgents] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setRole(null);
          setLoading(false);
          return;
        }
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', userData.user.id).single();
        setRole(profile?.role ?? null);
        // Fetch via internal API (service role) to avoid client RLS limitations
        const res = await fetch('/api/admin/agents/names');
        if (res.ok) {
          const j = await res.json();
          setAgents(j.agents || []);
        } else {
          // Fallback to direct select
          const { data: agentRows } = await supabase
            .from('profiles')
            .select('id, full_name, email, telegram_chat_id')
            .eq('role', 'agent')
            .eq('status', 'active')
            .order('full_name', { ascending: true });
          setAgents(agentRows || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  const onSendSlack = async () => {
    setStatus(null);
    setLoadingSlack(true);
    try {
      const res = await fetch('/api/admin/messaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sendSlack: true,
          mentionAgents,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Göndərmə alınmadı');
      setStatus('Mesaj(lar) uğurla göndərildi');
      setToast('Slack: Uğurla göndərildi');
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Xəta baş verdi');
    } finally {
      setLoadingSlack(false);
    }
  };

  const onSendTelegramChannel = async () => {
    setStatus(null);
    setLoadingTgChannel(true);
    try {
      const res = await fetch('/api/admin/messaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sendTelegramChannel: true, mentionAgents }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Göndərmə alınmadı');
      setStatus('Telegram kanalına göndərildi');
      setToast('Telegram kanalına göndərildi');
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Xəta baş verdi');
    } finally {
      setLoadingTgChannel(false);
    }
  };

  const onSendTelegramAgents = async () => {
    setStatus(null);
    setLoadingTgAgents(true);
    try {
      const res = await fetch('/api/admin/messaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sendTelegramToAgents: true, agentIdsForTelegram: selectedTelegramAgents, mentionAgents }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Göndərmə alınmadı');
      setStatus('Agentlərin Telegram-ına göndərildi');
      setToast('Agentlərin Telegram-ına göndərildi');
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Xəta baş verdi');
    } finally {
      setLoadingTgAgents(false);
    }
  };

  const onSendEmailAgents = async () => {
    setStatus(null);
    setLoadingEmailAgents(true);
    try {
      const res = await fetch('/api/admin/messaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, subject, sendEmailToAgents: true, agentIdsForEmail: selectedEmailAgents, mentionAgents }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Göndərmə alınmadı');
      setStatus('Agentlərə email göndərildi');
      setToast('Agentlərə email göndərildi');
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Xəta baş verdi');
    } finally {
      setLoadingEmailAgents(false);
    }
  };

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-teal-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <div className="text-cyan-700 font-semibold">Yüklənir...</div>
        <div className="text-xs text-gray-500">Mesajlaşdırma paneli hazırlanır</div>
      </div>
    </div>
  );
  if (role !== 'superadmin') return <div className="p-6 text-red-600">Giriş icazəsi yoxdur</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Mesaj Göndər</h1>
        {/* Quick external links */}
        <div className="mb-4 flex flex-wrap gap-3">
          <a
            href="https://discovery-jrl1251.slack.com/archives/C09H79VULR1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-cyan-200 text-cyan-700 hover:bg-cyan-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a2 2 0 1 0-2-2v2h2zM10 8H8V6a2 2 0 1 1 2 2zM8 10v2H6a2 2 0 1 1 2-2zM8 14h2v2a2 2 0 1 1-2-2zM14 16v-2h2a2 2 0 1 1-2 2zM16 10h-2V8h2a2 2 0 1 1 0 2zM10 16v-2h2v2a2 2 0 1 1-2 0zM12 8v2h-2V8a2 2 0 1 1 2 0z"/></svg>
            Slack Kanalı
          </a>
          <a
            href="https://t.me/insuranceplleads"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-cyan-200 text-cyan-700 hover:bg-cyan-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            Telegram Kanalı
          </a>
        </div>
        <div className="mb-4 flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={mentionAgents} onChange={e => setMentionAgents(e.target.checked)} /> Agent adlarını mention et</label>
        </div>
        <div>
          <div className="border-b border-cyan-100 mb-4">
            <div className="flex gap-2 text-sm">
              <button onClick={() => setActiveTab('slack')} className={`px-4 py-2 rounded-t-lg ${activeTab==='slack' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100 border-b-0' : 'text-gray-600'}`}>Slack Kanalı</button>
              <button onClick={() => setActiveTab('tg_channel')} className={`px-4 py-2 rounded-t-lg ${activeTab==='tg_channel' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100 border-b-0' : 'text-gray-600'}`}>Telegram Kanalı</button>
              <button onClick={() => setActiveTab('tg_agents')} className={`px-4 py-2 rounded-t-lg ${activeTab==='tg_agents' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100 border-b-0' : 'text-gray-600'}`}>Telegram (Agentlər)</button>
              <button onClick={() => setActiveTab('email_agents')} className={`px-4 py-2 rounded-t-lg ${activeTab==='email_agents' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100 border-b-0' : 'text-gray-600'}`}>Email (Agentlər)</button>
            </div>
          </div>

          {/* Shared Message Input */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">Mesaj</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} className="mt-1 w-full rounded border border-cyan-200 p-2 h-40" placeholder="Mesaj mətni..." />
          </div>

          {activeTab === 'slack' && (
            <div className="space-y-4">
              <button onClick={onSendSlack} disabled={loadingSlack} className={`px-4 py-2 rounded text-white ${loadingSlack ? 'bg-cyan-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'}`}>
                {loadingSlack ? 'Göndərilir...' : 'Slack-a göndər'}
              </button>
            </div>
          )}

          {activeTab === 'tg_channel' && (
            <div className="space-y-4">
              <button onClick={onSendTelegramChannel} disabled={loadingTgChannel} className={`px-4 py-2 rounded text-white ${loadingTgChannel ? 'bg-cyan-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'}`}>
                {loadingTgChannel ? 'Göndərilir...' : 'Telegram kanalına göndər'}
              </button>
            </div>
          )}

          {activeTab === 'tg_agents' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Agentlər</label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-auto rounded border border-cyan-200 p-2">
                  {agents.map(a => {
                    const disabled = !a.telegram_chat_id;
                    const checked = selectedTelegramAgents.includes(a.id);
                    const labelText = `${a.full_name || 'Adsız'} — ${a.email || '-'}`;
                    return (
                      <label key={a.id} className={`inline-flex items-center gap-2 text-sm rounded px-2 py-1 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-cyan-50'}`}>
                        <input
                          type="checkbox"
                          disabled={disabled}
                          checked={checked}
                          onChange={e => {
                            if (e.target.checked) setSelectedTelegramAgents(prev => Array.from(new Set([...prev, a.id])));
                            else setSelectedTelegramAgents(prev => prev.filter(id => id !== a.id));
                          }}
                        />
                        <span className="flex-1 truncate" title={labelText}>{labelText}</span>
                        {!a.telegram_chat_id && <span className="text-xs text-gray-500">chat_id yoxdur</span>}
                      </label>
                    );
                  })}
                </div>
                <div className="text-xs text-cyan-700 mt-1">Seçilən: {selectedTelegramAgentsLabels || '-'}</div>
              </div>
              <button onClick={onSendTelegramAgents} disabled={loadingTgAgents} className={`px-4 py-2 rounded text-white ${loadingTgAgents ? 'bg-cyan-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'}`}>
                {loadingTgAgents ? 'Göndərilir...' : 'Seçilən agentlərə Telegram'}
              </button>
            </div>
          )}

          {activeTab === 'email_agents' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Agentlər</label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-auto rounded border border-cyan-200 p-2">
                  {agents.map(a => {
                    const checked = selectedEmailAgents.includes(a.id);
                    const labelText = `${a.full_name || 'Adsız'} — ${a.email || '-'}`;
                    return (
                      <label key={a.id} className={`inline-flex items-center gap-2 text-sm rounded px-2 py-1 cursor-pointer hover:bg-cyan-50`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            if (e.target.checked) setSelectedEmailAgents(prev => Array.from(new Set([...prev, a.id])));
                            else setSelectedEmailAgents(prev => prev.filter(id => id !== a.id));
                          }}
                        />
                        <span className="flex-1 truncate" title={labelText}>{labelText}</span>
                        {!a.email && <span className="text-xs text-gray-500">email yoxdur</span>}
                      </label>
                    );
                  })}
                </div>
                <div className="text-xs text-cyan-700 mt-1">Seçilən: {selectedEmailAgentsLabels || '-'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Başlıq</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 w-full rounded border border-cyan-200 p-2" placeholder="Mövzu" />
              </div>
              <button onClick={onSendEmailAgents} disabled={loadingEmailAgents} className={`px-4 py-2 rounded text-white ${loadingEmailAgents ? 'bg-cyan-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'}`}>
                {loadingEmailAgents ? 'Göndərilir...' : 'Seçilən agentlərə Email'}
              </button>
            </div>
          )}
        </div>
        {status && <div className="mt-3 text-sm text-cyan-700">{status}</div>}
        {toast && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg">
              {toast}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


