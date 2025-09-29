'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type NavItem = { href: string; label: string; icon: React.ReactNode; roles?: string[] };

export function AdminSidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('agent');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const getUserRole = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userData.user.id)
          .single();
        setUserRole(profile?.role || 'agent');
      }
    };
    getUserRole();
  }, []);

  const allItems: NavItem[] = [
    {
      href: '/admin/dashboard',
      label: 'İcmal',
      roles: ['superadmin', 'agent'],
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      href: '/admin/dashboard/applications',
      label: 'Müraciətlər',
      roles: ['superadmin', 'agent'],
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M8 6v14" />
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      ),
    },
    {
      href: '/admin/dashboard/agents',
      label: 'Agentlər',
      roles: ['superadmin'], // Yalnız superadmin görə bilər
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
        </svg>
      ),
    },
    {
      href: '/admin/dashboard/calculator-settings',
      label: 'Kalkulyator',
      roles: ['superadmin'], // Yalnız superadmin görə bilər
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h6v6H9z" />
          <path d="M9 1v3" />
          <path d="M15 1v3" />
          <path d="M9 20v3" />
          <path d="M15 20v3" />
          <path d="M20 9h3" />
          <path d="M20 14h3" />
          <path d="M1 9h3" />
          <path d="M1 14h3" />
        </svg>
      ),
    },
    {
      href: '/admin/dashboard/settings',
      label: 'Tənzimləmələr',
      roles: ['superadmin',"agent"], 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .67.26 1.3.73 1.77.47.47 1.1.73 1.77.73h.09a2 2 0 1 1 0 4h-.09a2.5 2.5 0 0 1-1.68-.5Z" />
        </svg>
      ),
    },
  ];

  // Role-ə görə filter et
  const items = allItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <motion.button
        className="md:hidden fixed top-3 right-26 z-50 p-2 bg-white/90 backdrop-blur-sm rounded-xl border border-cyan-200 shadow-lg"
        onClick={toggleMobileMenu}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            className="md:hidden fixed top-0 left-0 z-50 w-80 h-full bg-white/95 backdrop-blur-md border-r border-cyan-100/60"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Mobile Header */}
            <div className="p-6 border-b border-cyan-100/60">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">P</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">B</span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-900 via-teal-900 to-emerald-900 bg-clip-text text-transparent">
                      PlanB Admin
                    </h2>
                    <p className="text-xs text-cyan-600">Plan A ilə risk alırsan, PlanB var!</p>
                  </div>
                </div>
                <motion.button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-xl hover:bg-cyan-50 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="p-4 h-[calc(100vh-120px)] overflow-y-auto">
              <nav className="space-y-2">
                {items.map((item, index) => {
                  const active = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <motion.div
                        className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
                          active 
                            ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/25' 
                            : 'text-gray-700 hover:bg-cyan-50 hover:text-cyan-900'
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        whileHover={{ x: 4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`flex-shrink-0 transition-colors duration-200 ${
                          active ? 'text-white' : 'text-cyan-600 group-hover:text-cyan-700'
                        }`}>
                          {item.icon}
                        </div>
                        <span className="flex-1">{item.label}</span>
                        {active && (
                          <motion.div
                            className="w-2 h-2 bg-white rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cyan-100/60 bg-white/95">
              <div className="text-center">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500 font-medium">PlanB Admin Panel</p>
                <p className="text-xs text-gray-400">v1.0</p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside 
        className="hidden md:block md:w-64 shrink-0 border-r border-cyan-100/60 bg-white/80 backdrop-blur-sm"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="h-[calc(100vh-86px)] overflow-y-auto">
          {/* Navigation */}
          <div className="p-4">
            <nav className="space-y-2">
              <AnimatePresence>
                {items.map((item, index) => {
                  const active = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <motion.div
                        className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
                          active 
                            ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/25' 
                            : 'text-gray-700 hover:bg-cyan-50 hover:text-cyan-900'
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        whileHover={{ x: 4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`flex-shrink-0 transition-colors duration-200 ${
                          active ? 'text-white' : 'text-cyan-600 group-hover:text-cyan-700'
                        }`}>
                          {item.icon}
                        </div>
                        <span className="flex-1">{item.label}</span>
                        {active && (
                          <motion.div
                            className="w-2 h-2 bg-white rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </AnimatePresence>
            </nav>
          </div>

          {/* Footer Section */}
          <motion.div 
            className="mt-auto p-4 border-t border-cyan-100/60"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-xs text-gray-500 font-medium">PlanB Admin Panel</p>
              <p className="text-xs text-gray-400">v1.0</p>
            </div>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
}


