import { NavLink } from "react-router-dom";
import { ChartNoAxesCombined, CloudSun, Cpu, LayoutDashboard, ShieldCheck, Sun, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import logo1 from "@/assets/logo1.jpeg";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const userNavItems = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Dispositivos", href: "/app/devices", icon: Cpu },
  { label: "Monitoreo", href: "/app/monitoring", icon: ChartNoAxesCombined },
  { label: "Meteorología", href: "/app/weather-station", icon: CloudSun },
];

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const { user } = useAuth();
  const navItems = user?.role === "admin"
    ? [{ label: "Usuarios", href: "/app/users", icon: Users }]
    : userNavItems;

  return (
    <>
      {isOpen && <button aria-label="Cerrar menu" className="fixed inset-0 z-40 bg-slate-900/20 md:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "surface-panel fixed inset-y-0 left-0 z-50 flex w-72 flex-col px-4 py-5 transition-transform md:static md:translate-x-0 md:m-4 md:mr-0 md:h-[calc(100vh-2rem)] md:rounded-[2rem]",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-start gap-3 px-2">
          <img src={logo1} alt="Solar Monitor" className="brand-image h-14 w-14 rounded-2xl object-cover ring-1 ring-slate-200/80" />
          <div className="min-w-0">
            <p className="font-display text-2xl leading-none text-slate-950">Solar Monitor</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-700">Energy Platform</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">Monitoreo visual de generación, consumo e históricos IoT.</p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto text-slate-500 md:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition",
                  isActive
                    ? "bg-slate-950 text-white shadow-[0_16px_30px_rgba(15,23,42,0.14)]"
                    : "text-slate-500 hover:bg-white/75 hover:text-slate-900",
                )
              }
            >
              <span className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl transition",
                "bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700",
              )}>
                <item.icon className="h-5 w-5" />
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-[1.75rem] border border-emerald-100 bg-[linear-gradient(180deg,rgba(236,253,245,0.96)_0%,rgba(248,250,252,0.96)_100%)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_14px_28px_rgba(16,185,129,0.22)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Sesión activa</p>
              <p className="text-sm font-black text-slate-900">
                {user?.role === "admin" ? "Administrador" : "Usuario operativo"}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Acceso protegido por rol. El backend valida JWT y permisos para cada vista.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-xs font-bold text-slate-600">
            <Sun className="h-3.5 w-3.5 text-emerald-600" />
            Plataforma universitaria de monitoreo solar
          </div>
        </div>
      </aside>
    </>
  );
}
