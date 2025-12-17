export interface CalculationData {
  hourlyRate: number;
  monthlyVolume: number;
  hoursPerDocManual: number;
  minutesPerDocAuto: number;
  setupCost: number;
}

export interface CalculationResults {
  annualSavings: number;
  monthlySavings: number;
  hoursSavedAnnually: number;
  opportunityCost: number;
  roiDays: number;
}

export interface InsightRequest {
  results: CalculationResults;
  inputs: CalculationData;
}