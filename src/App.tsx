import { Component, ErrorInfo, ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/layouts/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { LoginPage } from "@/pages/LoginPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SystemsPage } from "@/pages/SystemsPage";
import { WeatherStationPage } from "@/pages/WeatherStationPage";

export default function App() {
  return (
    <AppErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<RoleHome />} />
          <Route path="dashboard" element={<RequireRole role="user"><DashboardPage /></RequireRole>} />
          <Route path="devices" element={<RequireRole role="user"><SystemsPage /></RequireRole>} />
          <Route path="monitoring" element={<RequireRole role="user"><HistoryPage /></RequireRole>} />
          <Route path="weather-station" element={<RequireRole role="user"><WeatherStationPage /></RequireRole>} />
          <Route path="users" element={<RequireRole role="admin"><SettingsPage /></RequireRole>} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="top-right" closeButton richColors />
    </AppErrorBoundary>
  );
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("SolarMonitor render error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900">
          <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl">
            <h1 className="text-xl font-black">No se pudo mostrar esta vista</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Ocurrió un error al actualizar la pantalla. Puedes recargar la vista e iniciar de nuevo la consulta.
            </p>
            <button
              type="button"
              className="mt-5 rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-emerald-400"
              onClick={() => this.setState({ hasError: false })}
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function isKnownRole(role: unknown): role is "admin" | "user" {
  return role === "admin" || role === "user";
}

function RoleHome() {
  const { user } = useAuth();
  if (!user || !isKnownRole(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === "admin" ? "/app/users" : "/app/dashboard"} replace />;
}

function RequireRole({ role, children }: { role: "admin" | "user"; children: ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isKnownRole(user.role)) {
    return <Navigate to="/login" replace />;
  }

  const hasRole = role === "admin" ? user.role === "admin" : user.role === "user";
  if (!hasRole) {
    return <RoleHome />;
  }

  return children;
}
