import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { Topbar } from "@/components/navigation/Topbar";
import { useAuth } from "@/context/AuthContext";

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell-bg relative min-h-screen text-slate-900">
      <div className="app-shell-grid absolute inset-0" />
      <div className="relative flex min-h-screen">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 px-4 py-6 md:px-8 lg:px-10 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
