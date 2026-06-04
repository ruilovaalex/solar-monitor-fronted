import { BatteryCharging, Home, Network } from "lucide-react";
import { formatEnergy, formatPercent } from "@/utils/formatters";

interface EnergyFlowPanelProps {
  solarToHomeKwh: number;
  solarToGridKwh: number;
  gridToHomeKwh: number;
  selfConsumptionRate: number;
}

export function EnergyFlowPanel({
  solarToHomeKwh,
  solarToGridKwh,
  gridToHomeKwh,
  selfConsumptionRate,
}: EnergyFlowPanelProps) {
  const items = [
    { label: "Solar a vivienda", value: formatEnergy(solarToHomeKwh), icon: Home, color: "text-emerald-300" },
    { label: "Solar a red", value: formatEnergy(solarToGridKwh), icon: Network, color: "text-cyan-300" },
    { label: "Red a vivienda", value: formatEnergy(gridToHomeKwh), icon: BatteryCharging, color: "text-blue-300" },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Flujo energetico</h2>
          <p className="text-sm text-slate-400">Autoconsumo y excedentes simulados para integracion futura.</p>
        </div>
        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-black text-emerald-200">
          {formatPercent(selfConsumptionRate)}
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
              <Icon className={`h-5 w-5 ${item.color}`} />
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
              <p className="mt-1 text-xl font-black text-white">{item.value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
