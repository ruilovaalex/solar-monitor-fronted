import { LogOut, Menu, RefreshCw } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import logo1 from "@/assets/logo1.jpeg";
import logo2 from "@/assets/logo2.png";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === "/app/dashboard";

  function refreshDashboard() {
    window.dispatchEvent(new Event("solar-monitor:refresh-dashboard"));
  }

  return (
    <header className="sticky top-0 z-30 mx-4 mt-4 flex h-[4.5rem] items-center justify-between rounded-[1.75rem] border border-white/70 bg-white/82 px-4 backdrop-blur-xl shadow-[0_18px_40px_rgba(15,23,42,0.08)] md:mx-8 md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-slate-600 md:hidden" onClick={onMenuClick} aria-label="Abrir menu lateral">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden items-center gap-3 rounded-full border border-slate-200/80 bg-white/75 px-4 py-2 shadow-sm sm:flex">
          <img
            src={logo2}
            alt="Instituto de Tecnologias Sudamericano"
            className="h-7 w-auto max-w-[220px] object-contain opacity-85"
          />
          {isDashboard ? (
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-full border-slate-200 bg-white/90 px-3 text-slate-900 hover:bg-slate-50"
              onClick={refreshDashboard}
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-3 rounded-full border border-slate-200/90 bg-white/80 px-3 py-2 lg:flex">
          <img src={logo1} alt="Solar Monitor" className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Solar Monitor</p>
            <p className="text-xs text-slate-500">Dashboard IoT</p>
          </div>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-bold text-slate-900">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.role === "admin" ? "Administrador" : "Usuario operativo"}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-black text-slate-900 shadow-sm">
          {user?.name.slice(0, 2).toUpperCase()}
        </div>
        <Button variant="ghost" size="icon" className="rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-700" onClick={logout} aria-label="Cerrar sesión">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
