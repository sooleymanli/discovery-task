'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 backdrop-blur-md border-b border-orange-200/60 shadow-lg'
        : 'bg-white/80 backdrop-blur-sm border-b border-orange-100/40 shadow-sm'
        }`}
    >
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center"
        >
          <Link href="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-lg">B</span>
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-900">PlanB</span>
              <span className="text-xs text-cyan-600 -mt-1 font-medium">Sığorta</span>
            </div>
          </Link>
        </motion.div>

        <div className="hidden md:flex items-center space-x-8">
          <motion.div whileHover={{ y: -2 }}>
            <Link href="/#calculator" className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
              Hesablama
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }}> ̰
            <Link href="/#features" className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
              Xüsusiyyətlər
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }}>
            <Link href="/#faq" className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
              Suallar
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }}>
            <Link href="/portal" className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
              Müraciəti izlə
            </Link>
          </motion.div>

          <Link href="/apply" className="inline-block">
            <motion.div
              className="bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Apply — PlanB al"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>PlanB al</span>
              </span>
            </motion.div>
          </Link>

        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-3">
          <Link href="/apply">
            <motion.div
              className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              PlanB al
            </motion.div>
          </Link>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-cyan-600 hover:bg-cyan-50 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-cyan-100/60"
          >
            <div className="px-4 py-6 space-y-4">
              <motion.div whileHover={{ x: 5 }}>
                <Link
                  href="/#calculator"
                  className="block text-gray-700 hover:text-cyan-600 transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Hesablama
                </Link>
              </motion.div>
              <motion.div whileHover={{ x: 5 }}>
                <Link
                  href="/#features"
                  className="block text-gray-700 hover:text-cyan-600 transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Xüsusiyyətlər
                </Link>
              </motion.div>
              <motion.div whileHover={{ x: 5 }}>
                <Link
                  href="/#faq"
                  className="block text-gray-700 hover:text-cyan-600 transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Suallar
                </Link>
              </motion.div>
              <motion.div whileHover={{ x: 5 }}>
                <Link
                  href="/portal"
                  className="block text-gray-700 hover:text-cyan-600 transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Müraciəti izlə
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="pt-2"
              >
                <Link
                  href="/apply"
                  className="block bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold text-center shadow-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    PlanB al
                  </span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
