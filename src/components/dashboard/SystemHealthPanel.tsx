import { Activity, AlertTriangle, Clock, Gauge } from "lucide-react";
import { SystemHealth } from "@/types";
import { StatusPill } from "@/components/common/StatusPill";
import { formatPercent } from "@/utils/formatters";

interface SystemHealthPanelProps {
  health: SystemHealth;
}

export function SystemHealthPanel({ health }: SystemHealthPanelProps) {
  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/10">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Estado general</h2>
          <p className="text-sm text-slate-400">Resumen operacional simulado.</p>
        </div>
        <StatusPill status={health.status} />
      </div>
      <div className="mt-6 space-y-4">
        <HealthRow icon={Gauge} label="Performance ratio" value={formatPercent(health.performanceRatio)} />
        <HealthRow icon={Activity} label="Disponibilidad" value={formatPercent(health.availability)} />
        <HealthRow icon={Clock} label="Ultima sincronizacion" value={health.lastSync} />
        <HealthRow icon={AlertTriangle} label="Alertas activas" value={String(health.alerts)} />
      </div>
    </aside>
  );
}

function HealthRow({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/40 p-3">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-slate-400" />
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}
