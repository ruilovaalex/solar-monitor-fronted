import { Activity, BatteryCharging, Gauge, Leaf, RefreshCw, Scale, Sun, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnergyAreaChart } from "@/components/charts/EnergyAreaChart";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { EnergyFlowPanel } from "@/components/dashboard/EnergyFlowPanel";
import { SystemHealthPanel } from "@/components/dashboard/SystemHealthPanel";
import { useDashboard } from "@/hooks/useDashboard";

export function DashboardPage() {
  const { data, isLoading, mutate } = useDashboard();

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  const metrics = data.metrics;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Operacion fotovoltaica"
        title="Dashboard energetico"
        description="Monitoreo simulado de generacion, consumo, potencia instantanea, balance y estado general del sistema."
        action={
          <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => mutate()}>
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard {...metrics.generatedTodayKwh} icon={Sun} tone="emerald" />
        <StatCard {...metrics.consumedTodayKwh} icon={Zap} tone="blue" />
        <StatCard {...metrics.currentPowerKw} icon={Gauge} tone="cyan" />
        <StatCard {...metrics.energyBalanceKwh} icon={Scale} tone="emerald" />
        <StatCard {...metrics.systemYield} icon={Activity} tone="amber" />
        <StatCard {...metrics.carbonSavedKg} icon={Leaf} tone="slate" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Generacion vs consumo diario</h2>
              <p className="text-sm text-slate-400">Curvas simuladas por hora con Recharts.</p>
            </div>
            <BatteryCharging className="h-5 w-5 text-emerald-300" />
          </div>
          <EnergyAreaChart data={data.chart} />
        </div>
        <SystemHealthPanel health={data.health} />
      </section>

      <EnergyFlowPanel {...data.energyFlow} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="h-28 animate-pulse rounded-3xl bg-white/5" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-2xl bg-white/5" />
    </div>
  );
}
