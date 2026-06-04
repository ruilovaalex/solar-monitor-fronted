import { NavLink } from "react-router-dom";
import { BarChart3, GitCompare, LayoutDashboard, PanelsTopLeft, Settings, Shield, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Sistemas", href: "/app/systems", icon: PanelsTopLeft },
  { label: "Estadisticas", href: "/app/statistics", icon: BarChart3 },
  { label: "Comparaciones", href: "/app/comparisons", icon: GitCompare },
  { label: "Configuracion", href: "/app/settings", icon: Settings },
];

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  return (
    <>
      {isOpen && <button aria-label="Cerrar menu" className="fixed inset-0 z-40 bg-slate-950/70 md:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-slate-950/95 px-4 py-5 backdrop-blur-xl transition-transform md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20">
            <Sun className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-white">SolarMonitor</p>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Energy Platform</p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto text-slate-400 md:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition",
                  isActive
                    ? "bg-white text-slate-950 shadow-lg shadow-white/10"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
          <Shield className="h-5 w-5 text-emerald-300" />
          <p className="mt-3 text-sm font-bold text-white">Listo para JWT y roles</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            La sesion actual es simulada, con permisos preparados para un backend futuro.
          </p>
        </div>
      </aside>
    </>
  );
}
