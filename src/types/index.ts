export type TimeRange = "day" | "week" | "month" | "year";

export type UserRole = "admin" | "operator" | "viewer";

export type Permission =
  | "dashboard:read"
  | "systems:read"
  | "statistics:read"
  | "comparisons:read"
  | "settings:manage"
  | "users:manage";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: string;
}

export interface EnergyPoint {
  timestamp: string;
  generationKwh: number;
  consumptionKwh: number;
  gridImportKwh: number;
  gridExportKwh: number;
  selfConsumptionKwh: number;
  powerKw: number;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: number;
  status: "positive" | "warning" | "neutral";
}

export interface SystemHealth {
  status: "optimal" | "attention" | "offline";
  performanceRatio: number;
  availability: number;
  lastSync: string;
  alerts: number;
}

export interface DashboardData {
  metrics: {
    generatedTodayKwh: DashboardMetric;
    consumedTodayKwh: DashboardMetric;
    currentPowerKw: DashboardMetric;
    energyBalanceKwh: DashboardMetric;
    systemYield: DashboardMetric;
    carbonSavedKg: DashboardMetric;
  };
  health: SystemHealth;
  energyFlow: {
    solarToHomeKwh: number;
    solarToGridKwh: number;
    gridToHomeKwh: number;
    selfConsumptionRate: number;
  };
  chart: EnergyPoint[];
}

export interface SolarSystem {
  id: string;
  name: string;
  location: string;
  capacityKw: number;
  panels: number;
  inverter: string;
  status: "online" | "attention" | "offline";
  dailyProductionKwh: number;
  monthlyProductionKwh: number;
  efficiency: number;
  energyBalanceKwh: number;
}

export interface StatisticsData {
  range: TimeRange;
  generation: EnergyPoint[];
  consumption: EnergyPoint[];
  annualGeneration: Array<{ month: string; generationKwh: number; consumptionKwh: number }>;
  totals: {
    generationKwh: number;
    consumptionKwh: number;
    exportedKwh: number;
    importedKwh: number;
    savingsUsd: number;
  };
}

export interface ComparisonItem {
  systemId: string;
  systemName: string;
  productionDailyKwh: number;
  productionMonthlyKwh: number;
  efficiency: number;
  energyBalanceKwh: number;
}

export interface ComparisonsData {
  benchmark: {
    averageEfficiency: number;
    bestSystemName: string;
    portfolioProductionKwh: number;
  };
  systems: ComparisonItem[];
}

export interface ApiClientConfig {
  baseUrl: string;
  useMockData: boolean;
}
