'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { tClient, useLocale } from '@/lib/i18n/client';

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5).optional(),
  age: z.coerce.number().min(18).max(65),
  gender: z.enum(['male', 'female']),
  coverageAmount: z.coerce.number().min(10000),
  termYears: z.coerce.number().int().positive(),
  smoker: z.boolean().optional(),
  consent: z.literal(true, { message: 'Razılıq tələb olunur' }),
});

type FormValues = z.infer<typeof schema>;

function ApplyPageContent() {
  const [locale] = useLocale();
  const search = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const baseDefaults = { termYears: 10 as number | undefined, gender: 'male' as 'male' | 'female' | undefined };
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { ...baseDefaults },
  });

  // Prefill from query params on mount
  useEffect(() => {
    const preset = {
      age: search.get('age') ? Number(search.get('age')) : undefined,
      gender: (search.get('gender') as 'male' | 'female' | null) ?? undefined,
      coverageAmount: search.get('coverageAmount') ? Number(search.get('coverageAmount')) : undefined,
      termYears: search.get('termYears') ? Number(search.get('termYears')) : undefined,
      smoker: search.get('smoker') ? search.get('smoker') === 'true' : undefined,
    } as Partial<FormValues>;
    reset({ ...baseDefaults, ...preset });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const onSubmit = async (data: FormValues) => {
    setIsError(false);
    setIsSuccess(false);
    
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        setIsSuccess(true);
        reset();
        // Auto-hide success message after 5 seconds
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        const j = await res.json().catch(() => ({}));
        setErrorMessage(j.error ?? res.statusText);
        setIsError(true);
        // Auto-hide error message after 5 seconds
        setTimeout(() => setIsError(false), 5000);
      }
    } catch (error) {
      setErrorMessage(tClient('apply_error_default', locale));
      setIsError(true);
      setTimeout(() => setIsError(false), 5000);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50">
      {/* Floating Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-tr from-cyan-200 via-teal-200 to-emerald-200 blur-3xl opacity-60 animate-pulse" />
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-gradient-to-tr from-purple-200 via-indigo-200 to-cyan-200 blur-3xl opacity-50 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-200 via-teal-200 to-cyan-200 blur-3xl opacity-40 animate-pulse" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-12">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-50 to-teal-50 px-4 py-2 text-sm font-medium text-cyan-700 border border-cyan-200 mb-6">
            <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse"></span>
            {tClient('apply_badge', locale)}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent mb-4">
            {tClient('apply_title', locale)}
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            <span className="font-semibold text-cyan-600">{tClient('slogan', locale)}</span> 
            {tClient('apply_subtitle', locale)}
          </p>
        </motion.div>

        {/* Success Message */}
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-8 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-6 shadow-lg"
          >
            <div className="flex items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex-shrink-0 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-emerald-900">{tClient('apply_success_title', locale)}</h3>
                <p className="text-emerald-700">{tClient('apply_success_desc', locale)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {isError && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-8 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-6 shadow-lg"
          >
            <div className="flex items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-900">{tClient('apply_error_title', locale)}</h3>
                <p className="text-red-700">{errorMessage}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-3xl blur opacity-20"></div>
          <div className="relative rounded-3xl border border-cyan-100 bg-white/90 backdrop-blur-sm p-8 shadow-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">1</span>
                  {tClient('apply_section1', locale)}
                </h3>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">{tClient('apply_full_name', locale)} *</label>
                <input 
                  className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80" 
                  placeholder={tClient('apply_full_name_ph', locale)}
                  {...register('fullName')} 
                />
                {errors.fullName && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.fullName.message as string}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">{tClient('apply_email', locale)} *</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80" 
                  placeholder="email@example.com"
                  {...register('email')} 
                />
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email.message as string}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">{tClient('apply_phone', locale)}</label>
                <input 
                  className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80" 
                  placeholder={tClient('apply_phone_ph', locale)}
                  {...register('phone')} 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">{tClient('form_age', locale)} *</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80" 
                  placeholder={tClient('apply_age_ph', locale)}
                  {...register('age')} 
                />
                {errors.age && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.age.message as string}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">{tClient('form_gender', locale)} *</label>
                <select 
                  className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80" 
                  {...register('gender')}
                >
                  <option value="male">{tClient('form_gender_m', locale)}</option>
                  <option value="female">{tClient('form_gender_f', locale)}</option>
                </select>
              </div>

              {/* Insurance Information */}
              <div className="md:col-span-2 mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">2</span>
                  {tClient('apply_section2', locale)}
                </h3>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">{tClient('form_amount', locale)} *</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80" 
                  placeholder={tClient('form_amount_helper', locale)}
                  {...register('coverageAmount')} 
                />
                {errors.coverageAmount && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.coverageAmount.message as string}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">{tClient('form_term', locale)} *</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80" 
                  placeholder={tClient('apply_term_ph', locale)}
                  {...register('termYears')} 
                />
                {errors.termYears && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.termYears.message as string}
                  </motion.p>
                )}
              </div>

              {/* Additional Information */}
              <div className="md:col-span-2 mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">3</span>
                  {tClient('apply_section3', locale)}
                </h3>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 p-4 rounded-xl border border-cyan-100 bg-cyan-50/50">
                  <input 
                    type="checkbox" 
                    id="smoker" 
                    className="w-5 h-5 text-cyan-600 border-cyan-300 rounded focus:ring-cyan-500" 
                    {...register('smoker')} 
                  />
                  <label htmlFor="smoker" className="text-sm font-medium text-gray-700">
                    {tClient('apply_smoker_label', locale)}
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-start space-x-3 p-4 rounded-xl border border-cyan-100 bg-cyan-50/50">
                  <input 
                    type="checkbox" 
                    id="consent" 
                    className="w-5 h-5 text-cyan-600 border-cyan-300 rounded focus:ring-cyan-500 mt-1" 
                    {...register('consent')} 
                  />
                  <label htmlFor="consent" className="text-sm font-medium text-gray-700">
                    {tClient('apply_consent', locale)}
                  </label>
                </div>
                {errors.consent && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-sm flex items-center mt-2"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.consent.message as string}
                  </motion.p>
                )}
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 mt-8">
                <motion.button 
                  disabled={isSubmitting} 
                  type="submit" 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-8 py-4 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {tClient('apply_submitting', locale)}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {tClient('apply_submit', locale)}
                    </div>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-8"
        >
          <Link 
            href="/" 
            className="inline-flex items-center text-cyan-600 hover:text-cyan-700 font-medium transition-colors duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {tClient('apply_back', locale)}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function ApplyPageLoader() {
  const [locale] = useLocale();
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-cyan-200 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-cyan-600 font-medium">{tClient('loading', locale)}</p>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<ApplyPageLoader />}>
      <ApplyPageContent />
    </Suspense>
  );
}
