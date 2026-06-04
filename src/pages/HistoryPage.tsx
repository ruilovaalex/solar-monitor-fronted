import { AnnualBarChart } from "@/components/charts/AnnualBarChart";
import { EnergyAreaChart } from "@/components/charts/EnergyAreaChart";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { useStatistics } from "@/hooks/useStatistics";
import { formatCurrency } from "@/utils/formatters";
import { BatteryCharging, Download, PiggyBank, Sun, Upload } from "lucide-react";

export function HistoryPage() {
  const { data, isLoading } = useStatistics();

  if (isLoading || !data) {
    return <div className="mx-auto max-w-7xl space-y-4"><div className="h-96 animate-pulse rounded-2xl bg-white/5" /></div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Analitica historica"
        title="Estadisticas energeticas"
        description="Generacion diaria, semanal, mensual y anual simulada para validar reportes antes de conectar APIs reales."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Generacion mensual" value={data.totals.generationKwh} unit="kWh" icon={Sun} tone="emerald" />
        <StatCard title="Consumo mensual" value={data.totals.consumptionKwh} unit="kWh" icon={BatteryCharging} tone="blue" />
        <StatCard title="Exportado" value={data.totals.exportedKwh} unit="kWh" icon={Upload} tone="cyan" />
        <StatCard title="Importado" value={data.totals.importedKwh} unit="kWh" icon={Download} tone="amber" />
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <PiggyBank className="h-5 w-5 text-emerald-300" />
          <p className="mt-5 text-sm text-slate-400">Ahorro estimado</p>
          <p className="mt-2 text-3xl font-black text-white">{formatCurrency(data.totals.savingsUsd)}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-bold text-white">Comportamiento diario</h2>
          <p className="mb-5 text-sm text-slate-400">Muestra representativa de generacion y consumo.</p>
          <EnergyAreaChart data={data.generation.slice(-24)} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-bold text-white">Resumen anual</h2>
          <p className="mb-5 text-sm text-slate-400">Comparativa mensual de generacion y consumo.</p>
          <AnnualBarChart data={data.annualGeneration} />
        </div>
      </section>
    </div>
  );
}
