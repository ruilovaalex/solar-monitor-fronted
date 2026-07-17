export type TimeRange = "day" | "week" | "month" | "year";

export type UserRole = "admin" | "user";

export type Permission =
  | "dashboard:read"
  | "systems:read"
  | "statistics:read"
  | "comparisons:read"
  | "settings:manage"
  | "monitoring:manage"
  | "users:manage"
  | "devices:read"
  | "monitoring:read"
  | "thresholds:manage"
  | "users:read"
  | "users:create"
  | "users:update"
  | "users:delete"
  | "history:read"
  | "stats:read"
  | "realtime:read"
  | "devices:create";

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
  generationPowerKw: number;
  consumptionPowerKw: number;
  powerBalanceKw?: number;
  outOfRange?: boolean;
}

export type DashboardRangeFilter = "today" | "24h" | "7d" | "30d";
export type ChartGranularity = "minute" | "hour" | "day" | "month";

export interface DashboardEnergyPoint {
  timestamp: string;
  generationPowerKw: number | null;
  consumptionPowerKw: number | null;
  powerBalanceKw: number | null;
  outOfRange?: boolean;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend?: number;
  status: "positive" | "warning" | "neutral";
}

export interface NullableDashboardMetric extends Omit<DashboardMetric, "value"> {
  value: number | null;
}

export interface SystemHealth {
  status: "optimal" | "attention" | "offline" | "empty";
  lastSync: string | null;
  alerts: number;
  onlineDevices: number;
  totalDevices: number;
  hasGeneration?: boolean;
  hasConsumption?: boolean;
  comparisonAvailable?: boolean;
}

export interface DashboardData {
  metrics: {
    generationPower: DashboardMetric;
    consumptionPower: DashboardMetric;
    powerBalance: NullableDashboardMetric;
    connectedDevices: DashboardMetric;
  };
  health: SystemHealth;
  metricsTimestamp?: string | null;
  selection?: {
    range: DashboardRangeFilter;
    granularity: ChartGranularity;
    start: string;
    end: string;
    truncated: boolean;
  };
  chart: DashboardEnergyPoint[];
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
  chart: EnergyPoint[];
  hourlyPower?: EnergyPoint[];
  dailyPower?: EnergyPoint[];
  monthlyPower: Array<{ month: string; generationPowerKw: number; consumptionPowerKw: number; powerBalanceKw?: number }>;
  totals: {
    generationSamples: number;
    consumptionSamples: number;
    anomalies: number;
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
  devices?: {
    today: DeviceComparisonSummary;
    month: DeviceComparisonSummary;
  };
}

export interface DeviceComparisonSummary {
  generationPowerKw: number;
  consumptionPowerKw: number;
  powerBalanceKw: number;
  comparisonAvailable: boolean;
}

export interface ApiClientConfig {
  baseUrl: string;
}

export type DeviceType = "esp32" | "raspberry" | "other";

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  model: string;
  dataSource: "generation" | "consumption" | "bidirectional";
  status: "online" | "attention" | "offline";
  lastSeen: string | null;
  sampleIntervalSeconds: number;
  readings: {
    voltage: number;
    current: number;
    power: number;
    generationPower?: number;
    consumptionPower?: number;
    generationVoltage?: number;
    consumptionVoltage?: number;
  };
}

export interface MonitoringConfig {
  averageWindowMinutes: number;
  upperDeviationPoints: number;
  lowerDeviationPoints: number;
  regularStorageMinutes: number;
  anomalyStorageSeconds: number;
  significantChangePoints: number;
  retentionRawReadingsDays?: number;
  retentionHistoryDays?: number;
  retentionSummariesMonths?: number;
  connectionProtocol: string;
  generationFormulaStatus: string;
  consumptionFormulaStatus: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface CreateDeviceInput {
  name: string;
  type: DeviceType;
  model?: string;
  dataSource?: "generation" | "consumption" | "bidirectional";
  sampleIntervalSeconds?: number;
}

export interface CreatedDevice extends Device {
  ingestion: {
    key: string;
    header: string;
    endpoint: string;
    method?: string;
    contentType?: string;
    examplePayload?: DeviceReadingPayload;
    note: string;
  };
}

export interface DeviceReadingPayload {
  timestamp?: string;
  power?: number;
  potencia?: number;
  voltage?: number;
  voltaje?: number;
  current?: number;
  corriente?: number;
  energy?: number;
  energia?: number;
  dataSource?: "GENERATION" | "CONSUMPTION";
  fuenteDatos?: "GENERATION" | "CONSUMPTION";
  generation?: {
    power?: number;
    voltage?: number;
    current?: number;
    energy?: number;
  };
  consumption?: {
    power?: number;
    voltage?: number;
    current?: number;
    energy?: number;
  };
}

export interface DeviceRealtimeReading {
  id: string;
  deviceId: string;
  deviceName?: string;
  deviceType?: string;
  deviceStatus?: string;
  dataSource: "GENERATION" | "CONSUMPTION" | "BIDIRECTIONAL";
  voltage: number | null;
  current: number | null;
  power: number | null;
  energy: number | null;
  average: number | null;
  outOfRange: boolean;
  fechaLectura: string;
}

export interface DeviceHistoryReading extends DeviceRealtimeReading {
  reason: string;
  timestamp: string;
  generationPowerKw: number | null;
  consumptionPowerKw: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
