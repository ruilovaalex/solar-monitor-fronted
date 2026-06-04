import { MapPin, PanelsTopLeft, Zap } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusPill } from "@/components/common/StatusPill";
import { useSystems } from "@/hooks/useSystems";
import { formatEnergy, formatPercent, formatPower } from "@/utils/formatters";

export function SystemsPage() {
  const { data: systems = [], isLoading } = useSystems();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Portafolio solar"
        title="Sistemas fotovoltaicos"
        description="Vista multi-sistema preparada para instalaciones residenciales, comerciales o distribuidas."
      />

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : (
        <section className="grid gap-4 lg:grid-cols-3">
          {systems.map((system) => (
            <article key={system.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">{system.name}</h2>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="h-4 w-4" />
                    {system.location}
                  </p>
                </div>
                <StatusPill status={system.status} />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <SystemFact label="Capacidad" value={formatPower(system.capacityKw)} />
                <SystemFact label="Paneles" value={String(system.panels)} />
                <SystemFact label="Produccion diaria" value={formatEnergy(system.dailyProductionKwh)} />
                <SystemFact label="Eficiencia" value={formatPercent(system.efficiency)} />
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                  <PanelsTopLeft className="h-4 w-4 text-emerald-300" />
                  Inversor
                </div>
                <p className="mt-1 text-sm text-slate-400">{system.inverter}</p>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <span className="flex items-center gap-2 text-sm font-bold text-emerald-200">
                  <Zap className="h-4 w-4" />
                  Balance
                </span>
                <span className="text-lg font-black text-white">{formatEnergy(system.energyBalanceKwh)}</span>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function SystemFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}
