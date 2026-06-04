import { Award, BarChart3, Gauge, PanelsTopLeft } from "lucide-react";
import { ComparisonBarChart } from "@/components/charts/ComparisonBarChart";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { useComparisons } from "@/hooks/useComparisons";
import { formatEnergy, formatPercent } from "@/utils/formatters";

export function ComparisonsPage() {
  const { data, isLoading } = useComparisons();

  if (isLoading || !data) {
    return <div className="mx-auto max-w-7xl"><div className="h-96 animate-pulse rounded-2xl bg-white/5" /></div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Benchmark solar"
        title="Comparacion de sistemas"
        description="Contrasta produccion diaria, produccion mensual, eficiencia y balance energetico entre instalaciones."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Eficiencia promedio" value={data.benchmark.averageEfficiency} unit="%" icon={Gauge} tone="emerald" />
        <StatCard title="Produccion portafolio" value={data.benchmark.portfolioProductionKwh} unit="kWh" icon={PanelsTopLeft} tone="blue" />
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
          <Award className="h-5 w-5 text-amber-200" />
          <p className="mt-5 text-sm text-amber-100/80">Sistema destacado</p>
          <p className="mt-2 text-2xl font-black text-white">{data.benchmark.bestSystemName}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-300" />
            <h2 className="text-lg font-bold text-white">Produccion diaria comparada</h2>
          </div>
          <ComparisonBarChart data={data.systems} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-bold text-white">Ranking operativo</h2>
          <div className="mt-4 space-y-3">
            {data.systems.map((system, index) => (
              <div key={system.systemId} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-white">{index + 1}. {system.systemName}</p>
                  <span className="text-sm font-black text-emerald-300">{formatPercent(system.efficiency)}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-500">Mensual</span>
                  <span className="text-right font-bold text-slate-200">{formatEnergy(system.productionMonthlyKwh)}</span>
                  <span className="text-slate-500">Balance</span>
                  <span className="text-right font-bold text-slate-200">{formatEnergy(system.energyBalanceKwh)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
