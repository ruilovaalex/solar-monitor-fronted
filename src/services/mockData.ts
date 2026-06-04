import {
  AuthSession,
  ComparisonsData,
  DashboardData,
  EnergyPoint,
  SolarSystem,
  StatisticsData,
  User,
} from "@/types";

const now = new Date("2026-06-03T12:00:00-05:00");

const buildEnergyPoints = (hours: number): EnergyPoint[] =>
  Array.from({ length: hours }, (_, index) => {
    const hour = index % 24;
    const daylightFactor = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
    const generation = Number((daylightFactor * (2.2 + (index % 5) * 0.18)).toFixed(2));
    const consumption = Number((0.65 + Math.sin((hour / 24) * Math.PI * 2) * 0.22 + (hour > 18 ? 0.5 : 0)).toFixed(2));
    const balance = generation - consumption;

    return {
      timestamp: new Date(now.getTime() - (hours - index - 1) * 60 * 60 * 1000).toISOString(),
      generationKwh: generation,
      consumptionKwh: consumption,
      gridImportKwh: Number(Math.max(-balance, 0).toFixed(2)),
      gridExportKwh: Number(Math.max(balance, 0).toFixed(2)),
      selfConsumptionKwh: Number(Math.min(generation, consumption).toFixed(2)),
      powerKw: Number((generation * 0.92).toFixed(2)),
    };
  });

const dashboardChart = buildEnergyPoints(24);

export const mockUsers: User[] = [
  {
    id: "usr_admin",
    name: "Administrador Solar",
    email: "admin@solarmonitor.local",
    role: "admin",
    permissions: [
      "dashboard:read",
      "systems:read",
      "statistics:read",
      "comparisons:read",
      "settings:manage",
      "users:manage",
    ],
  },
  {
    id: "usr_viewer",
    name: "Operador Energia",
    email: "operador@solarmonitor.local",
    role: "operator",
    permissions: ["dashboard:read", "systems:read", "statistics:read", "comparisons:read"],
  },
];

export const mockSession: AuthSession = {
  token: "mock.jwt.token.ready-for-backend",
  user: mockUsers[0],
  expiresAt: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
};

export const mockDashboard: DashboardData = {
  metrics: {
    generatedTodayKwh: {
      id: "generatedTodayKwh",
      label: "Energia generada hoy",
      value: 28.6,
      unit: "kWh",
      trend: 12.4,
      status: "positive",
    },
    consumedTodayKwh: {
      id: "consumedTodayKwh",
      label: "Energia consumida hoy",
      value: 19.3,
      unit: "kWh",
      trend: -4.1,
      status: "positive",
    },
    currentPowerKw: {
      id: "currentPowerKw",
      label: "Potencia instantanea",
      value: 4.8,
      unit: "kW",
      trend: 8.7,
      status: "positive",
    },
    energyBalanceKwh: {
      id: "energyBalanceKwh",
      label: "Balance energetico",
      value: 9.3,
      unit: "kWh",
      trend: 15.2,
      status: "positive",
    },
    systemYield: {
      id: "systemYield",
      label: "Rendimiento del sistema",
      value: 91.8,
      unit: "%",
      trend: 2.6,
      status: "positive",
    },
    carbonSavedKg: {
      id: "carbonSavedKg",
      label: "CO2 evitado",
      value: 13.7,
      unit: "kg",
      trend: 6.3,
      status: "neutral",
    },
  },
  health: {
    status: "optimal",
    performanceRatio: 91.8,
    availability: 99.2,
    lastSync: "Hace 3 min",
    alerts: 0,
  },
  energyFlow: {
    solarToHomeKwh: 16.4,
    solarToGridKwh: 12.2,
    gridToHomeKwh: 2.9,
    selfConsumptionRate: 57.3,
  },
  chart: dashboardChart,
};

export const mockSystems: SolarSystem[] = [
  {
    id: "sys-home",
    name: "Residencial Norte",
    location: "Quito, EC",
    capacityKw: 6.4,
    panels: 16,
    inverter: "SolarEdge SE6000H",
    status: "online",
    dailyProductionKwh: 28.6,
    monthlyProductionKwh: 812,
    efficiency: 91.8,
    energyBalanceKwh: 9.3,
  },
  {
    id: "sys-lab",
    name: "Laboratorio Solar",
    location: "Guayaquil, EC",
    capacityKw: 4.8,
    panels: 12,
    inverter: "Huawei SUN2000",
    status: "attention",
    dailyProductionKwh: 19.4,
    monthlyProductionKwh: 540,
    efficiency: 84.6,
    energyBalanceKwh: 3.1,
  },
  {
    id: "sys-office",
    name: "Oficina Central",
    location: "Cuenca, EC",
    capacityKw: 9.2,
    panels: 24,
    inverter: "Fronius Primo",
    status: "online",
    dailyProductionKwh: 41.9,
    monthlyProductionKwh: 1184,
    efficiency: 94.1,
    energyBalanceKwh: 14.7,
  },
];

export const mockStatistics: StatisticsData = {
  range: "month",
  generation: buildEnergyPoints(30 * 24),
  consumption: buildEnergyPoints(30 * 24).map((point) => ({
    ...point,
    generationKwh: point.consumptionKwh,
  })),
  annualGeneration: [
    ["Ene", 694, 587],
    ["Feb", 720, 563],
    ["Mar", 842, 602],
    ["Abr", 866, 624],
    ["May", 914, 648],
    ["Jun", 812, 611],
    ["Jul", 785, 636],
    ["Ago", 802, 628],
    ["Sep", 850, 618],
    ["Oct", 879, 631],
    ["Nov", 824, 604],
    ["Dic", 768, 598],
  ].map(([month, generationKwh, consumptionKwh]) => ({
    month: String(month),
    generationKwh: Number(generationKwh),
    consumptionKwh: Number(consumptionKwh),
  })),
  totals: {
    generationKwh: 812,
    consumptionKwh: 611,
    exportedKwh: 246,
    importedKwh: 45,
    savingsUsd: 132.8,
  },
};

export const mockComparisons: ComparisonsData = {
  benchmark: {
    averageEfficiency: 90.2,
    bestSystemName: "Oficina Central",
    portfolioProductionKwh: 2536,
  },
  systems: mockSystems.map((system) => ({
    systemId: system.id,
    systemName: system.name,
    productionDailyKwh: system.dailyProductionKwh,
    productionMonthlyKwh: system.monthlyProductionKwh,
    efficiency: system.efficiency,
    energyBalanceKwh: system.energyBalanceKwh,
  })),
};
