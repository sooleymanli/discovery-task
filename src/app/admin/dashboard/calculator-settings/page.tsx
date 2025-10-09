'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { CalculatorConfig } from '@/lib/calculator';
import { motion } from 'framer-motion';
import { tClient, useLocale } from '@/lib/i18n/client';

export default function CalculatorSettingsPage() {
  const [locale] = useLocale();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('agent');
  const [roleLoading, setRoleLoading] = useState(true);
  
  const [configs, setConfigs] = useState<any[]>([]);
  const [activeConfig, setActiveConfig] = useState<CalculatorConfig | null>(null);
  const [editingConfig, setEditingConfig] = useState<CalculatorConfig | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace('/admin/login');
        return;
      }

      // Check user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();
      
      const role = profile?.role || 'agent';
      setUserRole(role);
      
      if (role !== 'superadmin') {
        router.push('/admin/dashboard');
        return;
      }

      await loadConfigs();
      setRoleLoading(false);
    };
    init();
  }, [supabase, router]);

  const loadConfigs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('calculator_config')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    
    setConfigs(data || []);
    const active = data?.find(c => c.is_active);
    
    if (active) {
      setActiveConfig(active.config);
      setEditingConfig(active.config);
    } else if (data && data.length === 0) {
      // If no configs exist, create default config
      await createDefaultConfig();
    }
    
    setLoading(false);
  };

  const createDefaultConfig = async () => {
    const defaultConfig = {
      baseRate: 50, // 50 AZN per 10k coverage
      ageMultipliers: [
        { min: 18, max: 25, factor: 0.9 },
        { min: 26, max: 35, factor: 1.0 },
        { min: 36, max: 45, factor: 1.3 },
        { min: 46, max: 55, factor: 1.7 },
        { min: 56, max: 65, factor: 2.3 },
      ],
      genderMultipliers: { male: 1.05, female: 0.95 },
      smokerFactor: 1.6,
      termMultipliers: [
        { years: 5, factor: 0.9 },
        { years: 10, factor: 1.0 },
        { years: 15, factor: 1.1 },
        { years: 20, factor: 1.2 },
        { years: 30, factor: 1.35 },
      ],
    };

    const { error } = await supabase
      .from('calculator_config')
      .insert({
        version: 'v1.0',
        is_active: true,
        effective_from: new Date().toISOString(),
        description: tClient('calc_settings_default_desc', locale),
        config: defaultConfig
      });

    if (error) {
      setError(error.message);
      return;
    }

    setActiveConfig(defaultConfig);
    setEditingConfig(defaultConfig);
    await loadConfigs(); // Reload to get the new config
  };

  const saveConfig = async () => {
    if (!editingConfig) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Deactivate all existing configs
    await supabase
      .from('calculator_config')
      .update({ is_active: false })
      .eq('is_active', true);

    // Create new active config
    const { error } = await supabase
      .from('calculator_config')
      .insert({
        version: `v${Date.now()}`,
        is_active: true,
        effective_from: new Date().toISOString(),
        description: tClient('calc_settings_admin_update', locale),
        config: editingConfig
      });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setSuccess(tClient('calc_settings_success', locale));
    setActiveConfig(editingConfig);
    await loadConfigs();
    setSaving(false);
  };

  const updateConfig = (field: keyof CalculatorConfig, value: unknown) => {
    if (!editingConfig) return;
    setEditingConfig({ ...editingConfig, [field]: value });
  };

  const addAgeMultiplier = () => {
    if (!editingConfig) return;
    setEditingConfig({
      ...editingConfig,
      ageMultipliers: [...editingConfig.ageMultipliers, { min: 18, max: 25, factor: 1.0 }]
    });
  };

  const removeAgeMultiplier = (index: number) => {
    if (!editingConfig) return;
    setEditingConfig({
      ...editingConfig,
      ageMultipliers: editingConfig.ageMultipliers.filter((_, i) => i !== index)
    });
  };

  const addTermMultiplier = () => {
    if (!editingConfig) return;
    setEditingConfig({
      ...editingConfig,
      termMultipliers: [...editingConfig.termMultipliers, { years: 10, factor: 1.0 }]
    });
  };

  const removeTermMultiplier = (index: number) => {
    if (!editingConfig) return;
    setEditingConfig({
      ...editingConfig,
      termMultipliers: editingConfig.termMultipliers.filter((_, i) => i !== index)
    });
  };

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-teal-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="text-center">
            <p className="text-gray-700 font-semibold text-lg">{tClient('dashboard_loading', locale)}</p>
            <p className="text-gray-500 text-sm mt-1">{tClient('dashboard_wait', locale)}</p>
          </div>
        </div>
      </div>
    );
  }

  if (userRole !== 'superadmin') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-100 to-pink-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{tClient('agents_no_access', locale)}</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {tClient('calc_settings_no_access_desc', locale)}
          </p>
          <motion.button 
            onClick={() => router.push('/admin/dashboard')} 
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {tClient('calc_settings_back', locale)}
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-teal-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="text-center">
            <p className="text-gray-700 font-semibold text-lg">{tClient('dashboard_loading', locale)}</p>
            <p className="text-gray-500 text-sm mt-1">{tClient('dashboard_wait', locale)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-3xl blur opacity-20"></div>
        <div className="relative rounded-3xl border border-cyan-100 bg-white/90 backdrop-blur-sm p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-50 to-teal-50 px-4 py-2 text-sm font-medium text-cyan-700 border border-cyan-200 mb-4">
                <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse"></span>
                {tClient('brand_name', locale)} {tClient('calc_badge', locale)}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent">
                {tClient('calc_settings_title', locale)}
              </h1>
              <p className="text-lg text-gray-700 mt-2">
                {tClient('calc_settings_subtitle', locale)}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">{tClient('calc_settings_active', locale)}</div>
                <div className="text-2xl font-bold text-cyan-600">{activeConfig ? '1' : '0'}</div>
              </div>
              <div className="flex items-center gap-3">
                {!activeConfig && (
                  <motion.button
                    onClick={createDefaultConfig}
                    className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {tClient('calc_settings_create_default', locale)}
                    </div>
                  </motion.button>
                )}
                <button
                  onClick={loadConfigs}
                  className="rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {tClient('calc_settings_refresh', locale)}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Formula */}
      <div className="relative">
        <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-teal-50 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{tClient('calc_settings_calculation', locale)}</h2>
          </div>
          <div className="bg-white/60 rounded-xl p-4 border border-cyan-200 mb-4">
            <p className="text-lg font-bold text-gray-900 text-center">
              {tClient('calc_settings_formula', locale)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-cyan-200">
              <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1.0</div>
              <div>
                <p className="font-semibold text-gray-900">{tClient('calc_settings_factor_1', locale)}</p>
                <p className="text-sm text-gray-600">{tClient('calc_settings_factor_1_desc', locale)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-cyan-200">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1.5</div>
              <div>
                <p className="font-semibold text-gray-900">{tClient('calc_settings_factor_15', locale)}</p>
                <p className="text-sm text-gray-600">{tClient('calc_settings_factor_15_desc', locale)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-cyan-200">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">0.8</div>
              <div>
                <p className="font-semibold text-gray-900">{tClient('calc_settings_factor_08', locale)}</p>
                <p className="text-sm text-gray-600">{tClient('calc_settings_factor_08_desc', locale)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm shadow-lg"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm shadow-lg"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        </motion.div>
      )}

      {editingConfig && (
        <div className="max-w-4xl space-y-6">
          {/* Base Rate */}
          <div className="rounded-2xl border border-cyan-100 bg-white/90 backdrop-blur-sm p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{tClient('calc_settings_base_tariff', locale)}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">{tClient('calc_settings_base_rate', locale)}</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingConfig.baseRate}
                  onChange={(e) => updateConfig('baseRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500">{tClient('calc_settings_base_rate_desc', locale)}</p>
              </div>
            </div>
          </div>

          {/* Age Multipliers */}
          <div className="rounded-2xl border border-cyan-100 bg-white/90 backdrop-blur-sm p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{tClient('calc_settings_age_factors', locale)}</h3>
              </div>
              <motion.button
                onClick={addAgeMultiplier}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {tClient('calc_settings_add', locale)}
                </div>
              </motion.button>
            </div>
            <div className="space-y-4">
              {editingConfig.ageMultipliers.map((age, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-cyan-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">{tClient('calc_settings_min_age', locale)}</label>
                      <input
                        type="number"
                        placeholder="18"
                        value={age.min}
                        onChange={(e) => {
                          const newAgeMultipliers = [...editingConfig.ageMultipliers];
                          newAgeMultipliers[index] = { ...age, min: parseInt(e.target.value) || 0 };
                          updateConfig('ageMultipliers', newAgeMultipliers);
                        }}
                        className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">{tClient('calc_settings_max_age', locale)}</label>
                      <input
                        type="number"
                        placeholder="25"
                        value={age.max}
                        onChange={(e) => {
                          const newAgeMultipliers = [...editingConfig.ageMultipliers];
                          newAgeMultipliers[index] = { ...age, max: parseInt(e.target.value) || 0 };
                          updateConfig('ageMultipliers', newAgeMultipliers);
                        }}
                        className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">{tClient('calc_settings_factor', locale)}</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="1.0"
                        value={age.factor}
                        onChange={(e) => {
                          const newAgeMultipliers = [...editingConfig.ageMultipliers];
                          newAgeMultipliers[index] = { ...age, factor: parseFloat(e.target.value) || 0 };
                          updateConfig('ageMultipliers', newAgeMultipliers);
                        }}
                        className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80 text-sm"
                      />
                    </div>
                  </div>
                  <motion.button
                    onClick={() => removeAgeMultiplier(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {tClient('calc_settings_delete', locale)}
                    </div>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Gender Multipliers */}
          <div className="rounded-2xl border border-cyan-100 bg-white/90 backdrop-blur-sm p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{tClient('calc_settings_gender_factors', locale)}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">{tClient('calc_settings_male_factor', locale)}</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingConfig.genderMultipliers.male}
                  onChange={(e) => updateConfig('genderMultipliers', {
                    ...editingConfig.genderMultipliers,
                    male: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80"
                  placeholder="1.0"
                />
                <p className="text-xs text-gray-500">{tClient('calc_settings_male_desc', locale)}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">{tClient('calc_settings_female_factor', locale)}</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingConfig.genderMultipliers.female}
                  onChange={(e) => updateConfig('genderMultipliers', {
                    ...editingConfig.genderMultipliers,
                    female: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80"
                  placeholder="1.0"
                />
                <p className="text-xs text-gray-500">{tClient('calc_settings_female_desc', locale)}</p>
              </div>
            </div>
          </div>

          {/* Smoker Factor */}
          <div className="rounded-2xl border border-cyan-100 bg-white/90 backdrop-blur-sm p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{tClient('calc_settings_smoker_factor', locale)}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">{tClient('calc_settings_smoker_label', locale)}</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingConfig.smokerFactor}
                  onChange={(e) => updateConfig('smokerFactor', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80"
                  placeholder="1.5"
                />
                <p className="text-xs text-gray-500">{tClient('calc_settings_smoker_desc', locale)}</p>
              </div>
            </div>
          </div>

          {/* Term Multipliers */}
          <div className="rounded-2xl border border-cyan-100 bg-white/90 backdrop-blur-sm p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{tClient('calc_settings_term_factors', locale)}</h3>
              </div>
              <motion.button
                onClick={addTermMultiplier}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {tClient('calc_settings_add', locale)}
                </div>
              </motion.button>
            </div>
            <div className="space-y-4">
              {editingConfig.termMultipliers.map((term, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-cyan-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">{tClient('calc_settings_term', locale)}</label>
                      <input
                        type="number"
                        placeholder="10"
                        value={term.years}
                        onChange={(e) => {
                          const newTermMultipliers = [...editingConfig.termMultipliers];
                          newTermMultipliers[index] = { ...term, years: parseInt(e.target.value) || 0 };
                          updateConfig('termMultipliers', newTermMultipliers);
                        }}
                        className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">{tClient('calc_settings_factor', locale)}</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="1.0"
                        value={term.factor}
                        onChange={(e) => {
                          const newTermMultipliers = [...editingConfig.termMultipliers];
                          newTermMultipliers[index] = { ...term, factor: parseFloat(e.target.value) || 0 };
                          updateConfig('termMultipliers', newTermMultipliers);
                        }}
                        className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white/80 text-sm"
                      />
                    </div>
                  </div>
                  <motion.button
                    onClick={() => removeTermMultiplier(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {tClient('calc_settings_delete', locale)}
                    </div>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <motion.button
              onClick={saveConfig}
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: saving ? 1 : 1.05 }}
              whileTap={{ scale: saving ? 1 : 0.95 }}
            >
              <div className="flex items-center gap-2">
                {saving ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {tClient('calc_settings_saving', locale)}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {tClient('calc_settings_update', locale)}
                  </>
                )}
              </div>
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
