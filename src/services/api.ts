import {
  AuthSession,
  ComparisonsData,
  DashboardData,
  SolarSystem,
  StatisticsData,
  User,
} from "@/types";
import {
  mockComparisons,
  mockDashboard,
  mockSession,
  mockStatistics,
  mockSystems,
  mockUsers,
} from "@/services/mockData";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== "false";
const AUTH_STORAGE_KEY = "solarmonitor.auth";

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

async function request<T>(endpoint: string, fallback: T, init?: RequestInit): Promise<T> {
  if (USE_MOCK_DATA) {
    await delay();
    return structuredClone(fallback);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${endpoint}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  config: {
    baseUrl: API_BASE_URL,
    useMockData: USE_MOCK_DATA,
  },

  async login(email: string, password: string): Promise<AuthSession> {
    await delay(450);

    if (!email || !password) {
      throw new Error("Correo y contrasena son obligatorios");
    }

    if (password.length < 6) {
      throw new Error("La contrasena debe tener al menos 6 caracteres");
    }

    const session = {
      ...mockSession,
      user: mockUsers.find((user) => user.email === email) ?? mockSession.user,
    };

    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  logout(): void {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  },

  getSession(): AuthSession | null {
    const saved = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!saved) return null;

    try {
      return JSON.parse(saved) as AuthSession;
    } catch {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  },

  getDashboard(): Promise<DashboardData> {
    return request<DashboardData>("/dashboard", mockDashboard);
  },

  getSystems(): Promise<SolarSystem[]> {
    return request<SolarSystem[]>("/systems", mockSystems);
  },

  getStatistics(): Promise<StatisticsData> {
    return request<StatisticsData>("/statistics", mockStatistics);
  },

  getComparisons(): Promise<ComparisonsData> {
    return request<ComparisonsData>("/comparisons", mockComparisons);
  },

  getUsers(): Promise<User[]> {
    return request<User[]>("/users", mockUsers);
  },
};

export const login = api.login;
export const logout = async () => api.logout();
export const getCurrentUser = () => api.getSession()?.user ?? null;
