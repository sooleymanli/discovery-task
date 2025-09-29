'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { calculatePremiumEstimate, defaultCalculatorConfig, type CalculatorConfig } from '@/lib/calculator';
import { createSupabaseBrowserClient } from '@/lib/supabase';

const quoteSchema = z.object({
  age: z.coerce.number().min(18).max(65),
  gender: z.enum(['male', 'female']),
  coverageAmount: z.coerce.number().min(10000),
  termYears: z.coerce.number().int().positive(),
  smoker: z.boolean().optional(),
});

type QuoteValues = z.infer<typeof quoteSchema>;

export default function Home() {
  const [premium, setPremium] = useState<number | null>(null);
  const [calcConfig, setCalcConfig] = useState<CalculatorConfig | null>(null);
  const [calcVersion, setCalcVersion] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [calculationStep, setCalculationStep] = useState(0);
  const quoteForm = useForm<QuoteValues>({
    resolver: zodResolver(quoteSchema) as any,
    defaultValues: { termYears: 10, gender: 'male' },
  });

  const buildApplyHref = (): string => {
    const v = quoteForm.getValues();
    const q = new URLSearchParams({
      age: v.age != null ? String(v.age) : '',
      gender: v.gender ?? '',
      coverageAmount: v.coverageAmount != null ? String(v.coverageAmount) : '',
      termYears: v.termYears != null ? String(v.termYears) : '',
      smoker: String(!!v.smoker),
    });
    return `/apply?${q.toString()}`;
  };

  const onQuoteSubmit: SubmitHandler<QuoteValues> = async (data) => {
    setIsCalculating(true);
    setShowResult(false);
    setCalculationStep(0);
    
    // Simulate calculation steps with animations
    const steps = [
      "Məlumatları yoxlayır...",
      "Risk faktörlərini hesablayır...",
      "Yaş və cins analizi...",
      "Sığorta məbləğini qiymətləndirir...",
      "Yekun hesablama..."
    ];
    
    for (let i = 0; i < steps.length; i++) {
      setCalculationStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    const p = calculatePremiumEstimate({
      age: data.age,
      gender: data.gender,
      coverageAmount: data.coverageAmount,
      termYears: data.termYears,
      smoker: data.smoker,
      config: calcConfig ?? defaultCalculatorConfig,
    });
    
    setPremium(p);
    setIsCalculating(false);
    setShowResult(true);
    
    // Auto-hide result after 10 seconds
    setTimeout(() => {
      setShowResult(false);
    }, 10000);

    // Log calculator usage to analytics
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'calculator_used',
          event_properties: {
            age: data.age,
            gender: data.gender,
            coverageAmount: data.coverageAmount,
            termYears: data.termYears,
            smoker: data.smoker,
            premium: p,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to log calculator usage:', error);
    }
  };

  // Auto-calculate on change (debounced)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const subscription = quoteForm.watch((values) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const parsed = quoteSchema.safeParse({
          age: Number(values.age),
          gender: values.gender as 'male' | 'female',
          coverageAmount: Number(values.coverageAmount),
          termYears: Number(values.termYears),
          smoker: Boolean(values.smoker),
        });
        if (parsed.success) {
          const p = calculatePremiumEstimate({
            age: parsed.data.age,
            gender: parsed.data.gender,
            coverageAmount: parsed.data.coverageAmount,
            termYears: parsed.data.termYears,
            smoker: parsed.data.smoker,
            config: calcConfig ?? defaultCalculatorConfig,
          });
          setPremium(p);
        } else {
          setPremium(null);
        }
      }, 300);
    });
    return () => subscription.unsubscribe();
  }, [quoteForm, calcConfig]);

  // Load active calculator config from DB (public read)
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('calculator_config')
          .select('version, config, description')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          console.warn('Calculator config yüklənə bilmədi, default config istifadə edilir:', error.message);
          setCalcConfig(defaultCalculatorConfig);
          setCalcVersion('default');
          return;
        }
        
        if (data && data.length > 0) {
          const row = data[0] as unknown as { 
            version?: string; 
            config?: CalculatorConfig;
            description?: string;
          };
          if (row.config) {
            setCalcConfig(row.config);
            setCalcVersion(row.version ?? 'unknown');
            console.log('Calculator config yükləndi:', row.version, row.description);
          } else {
            console.warn('Calculator config məlumatı düzgün deyil, default config istifadə edilir');
            setCalcConfig(defaultCalculatorConfig);
            setCalcVersion('default');
          }
        } else {
          console.warn('Aktiv calculator config tapılmadı, default config istifadə edilir');
          setCalcConfig(defaultCalculatorConfig);
          setCalcVersion('default');
        }
      } catch (e) {
        console.error('Calculator config yüklənərkən xəta:', e);
        setCalcConfig(defaultCalculatorConfig);
        setCalcVersion('default');
      }
    };
    loadConfig();
  }, []);

  return (
    <div className="relative min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Enhanced decorative gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-tr from-cyan-200 via-teal-200 to-emerald-200 blur-3xl opacity-60 animate-pulse" />
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-gradient-to-tr from-purple-200 via-violet-200 to-indigo-200 blur-3xl opacity-50 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-200 via-cyan-200 to-blue-200 blur-3xl opacity-30 animate-pulse" />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0">
        {[...Array(20)].map((_, i) => {
          // Predefined positions to avoid hydration mismatch
          const positions = [
            { left: 10, top: 20 }, { left: 20, top: 80 }, { left: 30, top: 40 },
            { left: 40, top: 60 }, { left: 50, top: 30 }, { left: 60, top: 70 },
            { left: 70, top: 50 }, { left: 80, top: 25 }, { left: 90, top: 85 },
            { left: 15, top: 45 }, { left: 25, top: 65 }, { left: 35, top: 15 },
            { left: 45, top: 75 }, { left: 55, top: 35 }, { left: 65, top: 55 },
            { left: 75, top: 10 }, { left: 85, top: 90 }, { left: 5, top: 50 },
            { left: 95, top: 40 }, { left: 12, top: 85 }
          ];
          const pos = positions[i] || { left: 50, top: 50 };
          
          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-cyan-300 rounded-full opacity-20"
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          );
        })}
      </div>

        {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pt-14 pb-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-50 to-teal-50 px-4 py-2 text-sm font-medium text-cyan-700 border border-cyan-200"
            >
              <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse"></span>
              PlanB Sığorta • Gənclər üçün
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-cyan-900 to-teal-900 bg-clip-text "
            >
              Plan A ilə{'  '}
              <span className="relative">
                risk alırsan
                <motion.div
                  className="absolute -bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-300 to-teal-300 rounded-full opacity-60"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                />
              </span>
              <br />
              <span className="text-cyan-600">PlanB var!</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl text-gray-900/80 leading-relaxed"
            >
              <span className="font-semibold text-cyan-600">“Gənclər üçün həyat sığortası - ” </span> 
              <span className="font-semibold text-gray-900"> 2 dəqiqəyə qiymət</span> 
              <span className="font-semibold text-gray-900"> 5 dəqiqəyə PlanB!</span> 
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <motion.a 
                href="#calculator" 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-8 py-4 text-white font-bold shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                PlanB qiymətini al
              </motion.a>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={buildApplyHref()} className="inline-flex items-center justify-center rounded-xl border-2 border-cyan-200 bg-white/80 backdrop-blur px-8 py-4 text-gray-900 font-bold transition-all duration-300 hover:bg-cyan-50 hover:border-cyan-300">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PlanB al
              </Link>
              </motion.div>
          </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex items-center gap-6 text-sm text-gray-900/70"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span>Tez nəticə</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span>24/7 müraciət</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Gənclər üçün</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-3xl bg-gradient-to-br from-cyan-50 to-teal-50 p-8 border border-cyan-100">
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-cyan-100"
                >
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-sm font-semibold text-gray-900">Sürətli</div>
                  <div className="text-xs text-cyan-600">2 dəqiqə</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-cyan-100"
                >
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-sm font-semibold text-gray-900">Gənclər</div>
                  <div className="text-xs text-cyan-600">18-30 yaş</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-cyan-100"
                >
                  <div className="text-3xl mb-2">💎</div>
                  <div className="text-sm font-semibold text-gray-900">Şəffaf</div>
                  <div className="text-xs text-cyan-600">Gizli yox</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-cyan-100"
                >
                  <div className="text-3xl mb-2">🚀</div>
                  <div className="text-sm font-semibold text-gray-900">PlanB</div>
                  <div className="text-xs text-cyan-600">Risk yox</div>
                </motion.div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full flex items-center justify-center text-white text-sm font-bold"
              >
                B
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full flex items-center justify-center text-white text-sm font-bold"
              >
                ✓
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Calculator (separate section) */}
      <section id="calculator" className="mx-auto max-w-6xl px-4 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-50 to-teal-50 px-4 py-2 text-sm font-medium text-cyan-700 border border-cyan-200 mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            PlanB Kalkulyatoru
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent">
            PlanB qiymətini hesabla
          </h2>
          <p className="mt-4 text-xl text-gray-900/80 max-w-2xl mx-auto">
            Sadə formla təxmini aylıq ödənişi öyrənin. 
            <span className="font-semibold text-cyan-600">100% pulsuz</span> və 
            <span className="font-semibold text-cyan-600"> dəqiq</span>.
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6 }} 
          className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-white/90 p-8 shadow-xl backdrop-blur"
        >
          <div className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-gradient-to-tr from-cyan-200 to-teal-200 blur-3xl opacity-50" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-60 w-60 rounded-full bg-gradient-to-tr from-purple-200 to-indigo-200 blur-3xl opacity-40" />

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Form */}
            <form onSubmit={quoteForm.handleSubmit(onQuoteSubmit)} className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-semibold text-gray-900">Yaş</label>
                  <input 
                    placeholder="məs: 25" 
                    type="number" 
                    className="w-full rounded-xl border-2 border-cyan-200 p-4 text-lg transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" 
                    {...quoteForm.register('age')} 
                  />
                  <p className="text-xs text-cyan-600">18–65 yaş aralığı</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-semibold text-gray-900">Cins</label>
                  <select 
                    className="w-full rounded-xl border-2 border-cyan-200 p-4 h-16 text-lg transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" 
                    {...quoteForm.register('gender')}
                  >
                    <option value="male">Kişi</option>
                    <option value="female">Qadın</option>
                  </select>
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <label className="block text-sm font-semibold text-gray-900">Sığorta məbləği (AZN)</label>
                <input 
                  placeholder="məs: 100000" 
                  type="number" 
                  className="w-full rounded-xl border-2 border-cyan-200 p-4 text-lg transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" 
                  {...quoteForm.register('coverageAmount')} 
                />
                <p className="text-xs text-cyan-600">Minimum 10,000 AZN</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-semibold text-gray-900">Müddət (il)</label>
                  <input 
                    placeholder="məs: 20" 
                    type="number" 
                    className="w-full rounded-xl border-2 border-cyan-200 p-4 text-lg transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" 
                    {...quoteForm.register('termYears')} 
                  />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                   className="space-y-2"
                >
                  <div className="flex items-center space-x-3 h-[64px] px-4 rounded-xl border-2 border-cyan-200 bg-cyan-50/50">
                    <input 
                      type="checkbox" 
                      id="smoker2" 
                      className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500" 
                      {...quoteForm.register('smoker')} 
                    />
                    <label htmlFor="smoker2" className="text-md font-semibold text-gray-900">Siqaret çəkir</label>
                  </div>
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }} 
                  whileTap={{ scale: 0.98 }} 
                  type="submit" 
                  disabled={isCalculating}
                  className={`w-full rounded-xl px-8 py-4 text-white font-bold text-lg shadow-lg transition-all duration-300 hover:shadow-xl ${
                    isCalculating 
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:shadow-2xl'
                  }`}
                >
                  <span className="flex items-center justify-center">
                    {isCalculating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 mr-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </motion.div>
                        Hesablanır...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        PlanB qiymətini hesabla
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>


            {/* Calculation Progress */}
            {isCalculating && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-1"
              >
                <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-teal-50 p-6">
                  <div className="text-center mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </motion.div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">PlanB Hesablanır</h3>
                    <p className="text-sm text-gray-600">Zəhmət olmasa gözləyin...</p>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      "Məlumatları yoxlayır...",
                      "Risk faktörlərini hesablayır...",
                      "Yaş və cins analizi...",
                      "Sığorta məbləğini qiymətləndirir...",
                      "Yekun hesablama..."
                    ].map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0.3 }}
                        animate={{ 
                          opacity: index <= calculationStep ? 1 : 0.3,
                          scale: index === calculationStep ? 1.05 : 1
                        }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-center space-x-3 p-2 rounded-lg ${
                          index <= calculationStep 
                            ? 'bg-white shadow-sm border border-cyan-200' 
                            : 'bg-gray-50'
                        }`}
                      >
                        <motion.div
                          animate={{ 
                            scale: index === calculationStep ? [1, 1.2, 1] : 1,
                            rotate: index === calculationStep ? [0, 360] : 0
                          }}
                          transition={{ 
                            duration: index === calculationStep ? 0.8 : 0,
                            repeat: index === calculationStep ? Infinity : 0
                          }}
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            index < calculationStep 
                              ? 'bg-emerald-500' 
                              : index === calculationStep 
                                ? 'bg-cyan-500' 
                                : 'bg-gray-300'
                          }`}
                        >
                          {index < calculationStep ? (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : index === calculationStep ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </motion.div>
                        <span className={`text-sm font-medium ${
                          index <= calculationStep ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Result Display */}
            {showResult && premium && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="lg:col-span-1"
              >
                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-lg">
                  <div className="text-center mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </motion.div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">PlanB Qiyməti Hazırdır!</h3>
                    <p className="text-sm text-gray-600">Təbriklər! Sizin üçün ən yaxşı qiymət</p>
                  </div>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    className="text-center mb-6"
                  >
                    <div className="text-4xl font-bold text-emerald-600 mb-2">
                      {premium.toLocaleString('az-AZ')} AZN
                    </div>
                    <div className="text-sm text-gray-600">aylıq ödəniş</div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link 
                        href={buildApplyHref()} 
                        className="block w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 px-4 rounded-xl font-bold text-center shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        PlanB al - İndi müraciət et!
                  </Link>
                    </motion.div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowResult(false)}
                      className="block w-full bg-white border-2 border-emerald-200 text-emerald-600 py-2 px-4 rounded-xl font-semibold text-center hover:bg-emerald-50 transition-all duration-300"
                    >
                      Yenidən hesabla
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Info side */}
            {!isCalculating && !showResult && (
              <div className="lg:col-span-1">
                <div className="rounded-2xl border border-cyan-100 bg-white/70 p-4">
                  <div className="text-sm font-semibold text-cyan-700 mb-3">💡 İpucu</div>
                <ul className="mt-2 space-y-3 text-sm text-gray-700">
                  <motion.li 
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                    <span>Daha yüksək məbləğ → daha çox ödəniş</span>
                  </motion.li>
                  <motion.li 
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                    <span>Uzun müddət → faktor artır</span>
                  </motion.li>
                  <motion.li 
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    <span>Siqaret çəkən → əlavə risk</span>
                  </motion.li>
                </ul>
                <div className="mt-6 text-sm font-semibold text-cyan-700">📊 Seçilən dəyərlər</div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-center"
                  >
                    <div className="font-semibold text-cyan-700">Yaş</div>
                    <div className="text-gray-900">{quoteForm.watch('age') ?? '-'}</div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-center"
                  >
                    <div className="font-semibold text-teal-700">Cins</div>
                    <div className="text-gray-900">{quoteForm.watch('gender') === 'male' ? 'Kişi' : quoteForm.watch('gender') === 'female' ? 'Qadın' : '-'}</div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center"
                  >
                    <div className="font-semibold text-emerald-700">Məbləğ</div>
                    <div className="text-gray-900">{quoteForm.watch('coverageAmount') ? `${quoteForm.watch('coverageAmount')?.toLocaleString('az-AZ')} AZN` : '-'}</div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-center"
                  >
                    <div className="font-semibold text-purple-700">Müddət</div>
                    <div className="text-gray-900">{quoteForm.watch('termYears') ? `${quoteForm.watch('termYears')} il` : '-'}</div>
                  </motion.div>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-center"
                >
                  <div className="font-semibold text-orange-700">Siqaret</div>
                  <div className="text-gray-900">{quoteForm.watch('smoker') ? 'Bəli' : 'Xeyr'}</div>
                </motion.div>
              </div>
              </div>
            )}
          </div>
        </motion.div>
      </section>

     

      {/* Benefits Section */}
      <section  id="features" className="mx-auto max-w-7xl px-4 pb-16 mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-50 to-teal-50 px-4 py-2 text-sm font-medium text-cyan-700 border border-cyan-200 mb-6">
            <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse"></span>
            PlanB Xüsusiyyətləri
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent">
            Niyə PlanB?
          </h2>
          <p className="mt-4 text-xl text-gray-900/80 max-w-3xl mx-auto">
            Gənclər üçün xüsusi hazırlanmış <span className="font-semibold text-cyan-600">modern sığorta həlləri</span>. 
            <span className="font-semibold text-gray-900"> Sadə</span>, 
            <span className="font-semibold text-gray-900"> sürətli</span> və 
            <span className="font-semibold text-gray-900"> etibarlı</span>.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Benefit 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-teal-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-500"
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-200 to-teal-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="relative text-center">
              <motion.div 
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ duration: 0.3 }}
                className="text-6xl mb-4"
              >
                ⚡
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sürətli Proses</h3>
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold text-cyan-600">2 dəqiqədə</span> qiymət al, 
                <span className="font-semibold text-cyan-600"> 5 dəqiqədə</span> PlanB al!
              </p>
            </div>
          </motion.div>

          {/* Benefit 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-500"
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="relative text-center">
              <motion.div 
                whileHover={{ scale: 1.2, rotate: -10 }}
                transition={{ duration: 0.3 }}
                className="text-6xl mb-4"
              >
                🔒
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Təhlükəsizlik</h3>
              <p className="text-gray-700 leading-relaxed">
                Məlumatlarınız <span className="font-semibold text-emerald-600">256-bit şifrələmə</span> ilə qorunur. 
                <span className="font-semibold text-emerald-600"> 100% təhlükəsiz</span>.
              </p>
            </div>
          </motion.div>

          {/* Benefit 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-500"
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="relative text-center">
              <motion.div 
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ duration: 0.3 }}
                className="text-6xl mb-4"
              >
                📱
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mobil Uyğun</h3>
              <p className="text-gray-700 leading-relaxed">
                İstənilən cihazdan istifadə edin. 
                <span className="font-semibold text-purple-600">iOS</span>, 
                <span className="font-semibold text-purple-600"> Android</span>, 
                <span className="font-semibold text-purple-600"> Desktop</span>.
              </p>
            </div>
          </motion.div>

          {/* Benefit 4 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 to-yellow-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-500"
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="relative text-center">
              <motion.div 
                whileHover={{ scale: 1.2, rotate: -10 }}
                transition={{ duration: 0.3 }}
                className="text-6xl mb-4"
              >
                💎
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Şəffaflıq</h3>
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold text-orange-600">Gizli yox</span>! Bütün şərtlər 
                <span className="font-semibold text-orange-600"> açıq və şəffaf</span>.
              </p>
            </div>
          </motion.div>

          {/* Benefit 5 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-500"
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="relative text-center">
              <motion.div 
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ duration: 0.3 }}
                className="text-6xl mb-4"
              >
                🎯
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gənclər üçün</h3>
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold text-pink-600">18-30 yaş</span> arası üçün xüsusi 
                <span className="font-semibold text-pink-600"> qiymətlər</span>.
              </p>
            </div>
          </motion.div>

          {/* Benefit 6 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-500"
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-teal-200 to-cyan-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="relative text-center">
              <motion.div 
                whileHover={{ scale: 1.2, rotate: -10 }}
                transition={{ duration: 0.3 }}
                className="text-6xl mb-4"
              >
                🚀
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">PlanB</h3>
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold text-teal-600">Plan A ilə risk alırsan</span>, 
                <span className="font-semibold text-teal-600"> PlanB var</span>!
              </p>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-teal-50 p-8 shadow-lg">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-tr from-cyan-200 to-teal-200 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-gradient-to-tr from-purple-200 to-indigo-200 rounded-full blur-3xl opacity-50" />
            
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Hazırsan PlanB almağa?
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                Gənc peşəkarlar üçün ən yaxşı sığorta həlli
              </p>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/apply" 
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-8 py-4 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  PlanB al - İndi başla!
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>



      {/* FAQ Section */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-50 to-teal-50 px-4 py-2 text-sm font-medium text-cyan-700 border border-cyan-200 mb-6">
            <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse"></span>
            PlanB FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent">
            Tez-tez verilən suallar
          </h2>
          <p className="mt-4 text-xl text-gray-900/80 max-w-3xl mx-auto">
            PlanB haqqında ən çox soruşulan suallar və cavabları. 
            <span className="font-semibold text-cyan-600">Hər şey açıq və şəffaf</span>.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {/* FAQ 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <details className="group rounded-2xl border border-cyan-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold text-gray-900 hover:bg-cyan-50/50 transition-colors duration-300">
                  <span className="text-lg">PlanB kalkulyatoru nə qədər dəqiqdir?</span>
                  <motion.span 
                    className="text-2xl text-cyan-600 transition-transform duration-300 group-open:rotate-45"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    +
                  </motion.span>
                </summary>
                <div className="px-6 pb-6">
                  <div className="pt-2 text-gray-700 leading-relaxed">
                    PlanB kalkulyatoru <span className="font-semibold text-cyan-600">%95 dəqiqlik</span> ilə təxmini qiymət verir. 
                    Dəqiq qiymət üçün mütəxəssisimiz sizinlə əlaqə saxlayaraq məlumatları təsdiqləyir.
                  </div>
                </div>
              </details>
            </motion.div>

            {/* FAQ 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <details className="group rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold text-gray-900 hover:bg-emerald-50/50 transition-colors duration-300">
                  <span className="text-lg">Məlumatlarım təhlükəsizdirmi?</span>
                  <motion.span 
                    className="text-2xl text-emerald-600 transition-transform duration-300 group-open:rotate-45"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    +
                  </motion.span>
                </summary>
                <div className="px-6 pb-6">
                  <div className="pt-2 text-gray-700 leading-relaxed">
                    Bəli, <span className="font-semibold text-emerald-600">100% təhlükəsizdir</span>! 
                    Bank səviyyəli <span className="font-semibold text-emerald-600">256-bit şifrələmə</span> tətbiq olunur. 
                    Yalnız yetkili heyətimiz məlumatlarınızı görə bilər.
                  </div>
                </div>
              </details>
            </motion.div>

            {/* FAQ 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <details className="group rounded-2xl border border-purple-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold text-gray-900 hover:bg-purple-50/50 transition-colors duration-300">
                  <span className="text-lg">PlanB almaq üçün nə qədər vaxt lazımdır?</span>
                  <motion.span 
                    className="text-2xl text-purple-600 transition-transform duration-300 group-open:rotate-45"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    +
                  </motion.span>
                </summary>
                <div className="px-6 pb-6">
                  <div className="pt-2 text-gray-700 leading-relaxed">
                    <span className="font-semibold text-purple-600">2 dəqiqədə</span> qiymət al, 
                    <span className="font-semibold text-purple-600"> 5 dəqiqədə</span> PlanB al! 
                    Bütün proses <span className="font-semibold text-purple-600">onlayn</span> həyata keçirilir.
                  </div>
                </div>
              </details>
            </motion.div>

            {/* FAQ 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <details className="group rounded-2xl border border-orange-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold text-gray-900 hover:bg-orange-50/50 transition-colors duration-300">
                  <span className="text-lg">Gənclər üçün xüsusi qiymətlər varmı?</span>
                  <motion.span 
                    className="text-2xl text-orange-600 transition-transform duration-300 group-open:rotate-45"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    +
                  </motion.span>
                </summary>
                <div className="px-6 pb-6">
                  <div className="pt-2 text-gray-700 leading-relaxed">
                    Bəli! <span className="font-semibold text-orange-600">18-30 yaş</span> arası üçün 
                    <span className="font-semibold text-orange-600"> xüsusi endirimlər</span> təklif edirik. 
                    Gənc peşəkarlar üçün daha uyğun qiymətlər.
                  </div>
                </div>
              </details>
            </motion.div>

            {/* FAQ 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <details className="group rounded-2xl border border-pink-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold text-gray-900 hover:bg-pink-50/50 transition-colors duration-300">
                  <span className="text-lg">Müraciətdən sonra nə baş verir?</span>
                  <motion.span 
                    className="text-2xl text-pink-600 transition-transform duration-300 group-open:rotate-45"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    +
                  </motion.span>
                </summary>
                <div className="px-6 pb-6">
                  <div className="pt-2 text-gray-700 leading-relaxed">
                    Mütəxəssisimiz <span className="font-semibold text-pink-600">24 saat ərzində</span> sizinlə əlaqə saxlayır. 
                    Sənədləri yoxlayır, <span className="font-semibold text-pink-600">dəqiq qiymət</span> verir və 
                    <span className="font-semibold text-pink-600"> PlanB</span> aktivləşdirir.
                  </div>
                </div>
              </details>
            </motion.div>

            {/* FAQ 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <details className="group rounded-2xl border border-teal-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold text-gray-900 hover:bg-teal-50/50 transition-colors duration-300">
                  <span className="text-lg">PlanB nə üçün fərqlidir?</span>
                  <motion.span 
                    className="text-2xl text-teal-600 transition-transform duration-300 group-open:rotate-45"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    +
                  </motion.span>
                </summary>
                <div className="px-6 pb-6">
                  <div className="pt-2 text-gray-700 leading-relaxed">
                    <span className="font-semibold text-teal-600">Plan A ilə risk alırsan, PlanB var!</span> 
                    Gənclər üçün xüsusi hazırlanmış, <span className="font-semibold text-teal-600">şəffaf</span>, 
                    <span className="font-semibold text-teal-600"> sürətli</span> və 
                    <span className="font-semibold text-teal-600"> etibarlı</span> sığorta həlli.
                  </div>
                </div>
              </details>
            </motion.div>
          </div>

          {/* Contact CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 text-center"
          >
            <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-teal-50 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Sualınız yoxdur?
              </h3>
              <p className="text-gray-700 mb-6">
                PlanB komandası sizinlə əlaqə saxlayaraq bütün suallarınızı cavablandıracaq
              </p>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/apply" 
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-6 py-3 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  PlanB al - Suallarınızı soruşun
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
