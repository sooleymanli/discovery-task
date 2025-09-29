export type CalculatorConfig = {
  baseRate: number; // base monthly premium per 10k coverage
  ageMultipliers: { min: number; max: number; factor: number }[];
  genderMultipliers: Record<'male' | 'female', number>;
  smokerFactor: number; // multiplicative factor if smoker
  termMultipliers: { years: number; factor: number }[];
};

export const defaultCalculatorConfig: CalculatorConfig = {
  baseRate: 5, // $5 per 10k coverage
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

export function calculatePremiumEstimate(params: {
  age: number;
  gender: 'male' | 'female';
  coverageAmount: number; // in AZN
  termYears: number;
  smoker?: boolean;
  config?: CalculatorConfig;
}): number {
  const cfg = params.config ?? defaultCalculatorConfig;
  const coverageUnits = Math.max(0, params.coverageAmount) / 10000;
  const ageFactor =
    cfg.ageMultipliers.find((r) => params.age >= r.min && params.age <= r.max)?.factor ?? 1.0;
  const genderFactor = cfg.genderMultipliers[params.gender];
  const termFactor = cfg.termMultipliers.find((t) => t.years === params.termYears)?.factor ?? 1.0;
  const smokerFactor = params.smoker ? cfg.smokerFactor : 1.0;

  const monthly = cfg.baseRate * coverageUnits * ageFactor * genderFactor * termFactor * smokerFactor;
  return Math.round(monthly * 100) / 100;
}
