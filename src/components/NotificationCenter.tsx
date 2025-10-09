'use client';

import { useEffect, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { tClient, useLocale } from '@/lib/i18n/client';

type Notification = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
};

export function NotificationCenter() {
  const [locale] = useLocale();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createSupabaseBrowserClient();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Identify current user then load notifications
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id || null;
      setUserId(uid);

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }

      // Realtime channel for this user's notifications
      if (uid) {
        const channel = supabase
          .channel(`notifications-${uid}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `target_user_id=eq.${uid}` }, (payload) => {
            setNotifications(prev => {
              let next = prev;
              if (payload.eventType === 'INSERT') {
                const inserted = payload.new as Notification;
                next = [inserted, ...prev];
              } else if (payload.eventType === 'UPDATE') {
                const updated = payload.new as Notification;
                next = prev.map(n => n.id === updated.id ? updated : n);
              } else if (payload.eventType === 'DELETE') {
                const oldId = (payload.old as { id: string } | null)?.id;
                next = oldId ? prev.filter(n => n.id !== oldId) : prev;
              }
              setUnreadCount(next.filter(n => !n.read).length);
              return next;
            });
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };

    const cleanupPromise = init();
    return () => {
      // cleanup handled in channel subscribe return
      void cleanupPromise;
    };
  }, [supabase]);

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);
    
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-8 h-8 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414-1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-900 hover:bg-cyan-50 rounded-xl transition-all duration-200 hover:shadow-md"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 3h5v6h-5V3z" />
          </svg>
          {unreadCount > 0 && (
            <motion.span 
              className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {unreadCount}
            </motion.span>
          )}
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="absolute right-0 mt-2 w-90 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-cyan-100 z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 3h5v6h-5V3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{tClient('nc_title', locale)}</h3>
                </div>
                {unreadCount > 0 && (
                  <motion.button
                    onClick={markAllAsRead}
                    className="text-sm text-gray-900 hover:text-cyan-800 font-semibold px-3 py-1 rounded-lg hover:bg-cyan-100 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tClient('nc_mark_all', locale)}
                  </motion.button>
                )}
              </div>
            </div>
            
            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <motion.div 
                  className="p-8 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 3h5v6h-5V3z" />
                    </svg>
                  </div>
                  <p className="text-gray-900 font-bold">{tClient('nc_empty_title', locale)}</p>
                  <p className="text-sm text-gray-400 mt-1">{tClient('nc_empty_desc', locale)}</p>
                </motion.div>
              ) : (
                notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    className={`p-4 border-b border-cyan-50 hover:bg-cyan-50/50 cursor-pointer transition-all duration-200 ${
                      !notification.read ? 'bg-cyan-50/30' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-bold text-gray-900 mb-1">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(notification.created_at).toLocaleString('az-AZ')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}