import {
  AuthSession,
  CreatedDevice,
  CreateDeviceInput,
  CreateUserInput,
  DashboardData,
  DashboardRangeFilter,
  ChartGranularity,
  Device,
  DeviceHistoryReading,
  DeviceRealtimeReading,
  ComparisonsData,
  MonitoringConfig,
  PaginatedResponse,
  StatisticsData,
  User,
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";
const AUTH_STORAGE_KEY = "solarmonitor.auth";

async function request<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const session = getStoredSession();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    const payload = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(payload?.message ?? `API error ${response.status}: ${endpoint}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  config: {
    baseUrl: API_BASE_URL,
  },

  async login(email: string, password: string): Promise<AuthSession> {
    if (!email || !password) {
      throw new Error("Correo y contraseña son obligatorios");
    }

    if (password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error("No se pudo conectar con el servidor. Verifica tu red o que el backend este iniciado.");
    }

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { message?: string } | null;
      if (payload?.message) {
        throw new Error(payload.message);
      }

      if (response.status >= 500) {
        throw new Error("El servidor no pudo procesar el inicio de sesión. Intenta nuevamente en unos momentos.");
      }

      if (response.status === 401) {
        throw new Error("Credenciales incorrectas");
      }

      throw new Error(`No se pudo iniciar sesión (código ${response.status}).`);
    }

    const session = await response.json() as AuthSession;
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  logout(): void {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  },

  getSession(): AuthSession | null {
    return getStoredSession();
  },

  getDashboard(params?: {
    range?: DashboardRangeFilter;
    granularity?: ChartGranularity;
  }): Promise<DashboardData> {
    const search = new URLSearchParams();
    if (params?.range) search.set("range", params.range);
    if (params?.granularity) search.set("granularity", params.granularity);

    return request<DashboardData>(`/dashboard${search.size ? `?${search.toString()}` : ""}`);
  },

  getStatistics(): Promise<StatisticsData> {
    return request<StatisticsData>("/statistics");
  },

  getComparisons(): Promise<ComparisonsData> {
    return request<ComparisonsData>("/comparisons");
  },

  getUsers(): Promise<User[]> {
    return request<User[]>("/users");
  },

  getDevices(): Promise<Device[]> {
    return request<Device[]>("/devices");
  },

  getDeviceRealtime(): Promise<DeviceRealtimeReading[]> {
    return request<DeviceRealtimeReading[]>("/realtime/devices");
  },

  getDeviceHistory(params: {
    page?: number;
    limit?: number;
    deviceId?: string;
    dataSource?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<PaginatedResponse<DeviceHistoryReading>> {
    const search = new URLSearchParams();
    if (params.page) search.set("page", String(params.page));
    if (params.limit) search.set("limit", String(params.limit));
    if (params.deviceId) search.set("deviceId", params.deviceId);
    if (params.dataSource) search.set("dataSource", params.dataSource);
    if (params.startDate) search.set("startDate", params.startDate);
    if (params.endDate) search.set("endDate", params.endDate);

    return request<PaginatedResponse<DeviceHistoryReading>>(`/history/devices${search.size ? `?${search.toString()}` : ""}`);
  },

  getMonitoringConfig(): Promise<MonitoringConfig> {
    return request<MonitoringConfig>("/monitoring/config");
  },

  async updateMonitoringConfig(config: MonitoringConfig): Promise<MonitoringConfig> {
    return request<MonitoringConfig>("/monitoring/config", {
      method: "PUT",
      body: JSON.stringify(config),
    });
  },

  async createUser(input: CreateUserInput): Promise<User> {
    return request<User>("/users", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async deleteUser(id: string): Promise<{ id: string }> {
    return request<{ id: string }>(`/users/${id}`, {
      method: "DELETE",
    });
  },

  async createDevice(input: CreateDeviceInput): Promise<CreatedDevice> {
    return request<CreatedDevice>("/devices", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};

function getStoredSession(): AuthSession | null {
  const saved = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!saved) return null;

  try {
    const session = JSON.parse(saved) as AuthSession;
    if (!isValidSession(session) || new Date(session.expiresAt).getTime() <= Date.now()) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function isValidSession(session: AuthSession | null) {
  return Boolean(
    session?.token
      && session.expiresAt
      && session.user
      && (session.user.role === "admin" || session.user.role === "user"),
  );
}

export const login = api.login;
export const logout = async () => api.logout();
export const getCurrentUser = () => api.getSession()?.user ?? null;
