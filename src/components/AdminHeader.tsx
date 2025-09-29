'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { NotificationCenter } from './NotificationCenter';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminHeader() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [role, setRole] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
      if (data?.role) setRole(String(data.role));
    };
    load();
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const logout = async () => {
    await fetch('/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  return (
    <motion.header 
      className="sticky top-0 z-50 border-b border-cyan-100/60 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 shadow-sm"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">B</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-900 via-teal-900 to-emerald-900 bg-clip-text text-transparent">
                PlanB Admin
              </h1>
              <p className="text-xs text-cyan-600 -mt-1">Plan A ilə risk alırsan, PlanB var!</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-900 via-teal-900 to-emerald-900 bg-clip-text text-transparent">
                PlanB
              </h1>
            </div>
          </motion.div>

          {/* Navigation Section */}
          <nav className="flex items-center space-x-2 sm:space-x-4">
            {/* Notification Center */}
            <div className="hidden sm:block">
              <NotificationCenter />
            </div>

          

            {/* User Menu */}
            <div ref={menuRef} className="relative">
              <motion.button 
                onClick={() => setOpen((v) => !v)} 
                className="flex items-center space-x-2 sm:space-x-3 rounded-2xl border border-cyan-200 bg-white/80 px-3 py-2 hover:bg-cyan-50 transition-all duration-200 shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm sm:text-base">
                      {(role?.[0] ?? 'A').toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 capitalize">{role ?? 'admin'}</p>
                  <p className="text-xs text-cyan-600">Admin Panel</p>
                </div>
                <motion.div
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {open && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-64 sm:w-72 overflow-hidden rounded-2xl border border-cyan-100 bg-white/95 backdrop-blur-md shadow-xl"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* User Info Section */}
                    <div className="px-4 py-4 bg-gradient-to-r from-cyan-50 to-teal-50 border-b border-cyan-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-lg">
                            {(role?.[0] ?? 'A').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">{role ?? 'admin'}</p>
                          <p className="text-sm text-cyan-600">PlanB Admin Panel</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <a 
                        href="/" 
                        target='_blank'
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-cyan-50 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>Sayta keçid et</span>
                      </a>
                      
                  
                      <div className="border-t border-cyan-100 my-2"></div>
                      
                      <button 
                        onClick={logout} 
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Çıxış</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
        </div>
      </div>
    </motion.header>
  );
}


