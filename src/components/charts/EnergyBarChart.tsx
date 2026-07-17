import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EnergyPoint } from "@/types";

type AxisValueFormatter = (value: number) => string;
type LabelFormatter = (value: string) => string;
type AxisDomainValue = number | string | ((value: number) => number);
type TooltipPayloadItem = {
  dataKey?: string | number;
  value?: unknown;
};

interface EnergyBarChartProps {
  data: EnergyPoint[];
  height?: number;
  showBalance?: boolean;
  xTickFormatter?: LabelFormatter;
  tooltipLabelFormatter?: LabelFormatter;
  yTickFormatter?: AxisValueFormatter;
  yDomain?: [AxisDomainValue, AxisDomainValue];
}

export function EnergyBarChart({
  data,
  height = 360,
  showBalance = false,
  xTickFormatter = (value) => new Date(value).getHours().toString().padStart(2, "0"),
  tooltipLabelFormatter = (value) => new Date(value).toLocaleString("es-EC", { timeStyle: "short" }),
  yTickFormatter = (value) => `${Number(value).toFixed(1)} kW`,
  yDomain,
}: EnergyBarChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={xTickFormatter}
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            tickMargin={10}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={yTickFormatter}
            domain={yDomain}
            width={56}
          />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
            content={<EnergyTooltip labelFormatter={tooltipLabelFormatter} />}
          />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Bar name="Generación" dataKey="generationPowerKw" fill="#34d399" radius={[5, 5, 0, 0]} />
          <Bar name="Consumo" dataKey="consumptionPowerKw" fill="#38bdf8" radius={[5, 5, 0, 0]} />
          {showBalance ? <Bar name="Balance" dataKey="powerBalanceKw" fill="#f59e0b" radius={[5, 5, 0, 0]} /> : null}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EnergyTooltip({
  active,
  payload,
  label,
  labelFormatter,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  labelFormatter: LabelFormatter;
}) {
  if (!active || !payload?.length) return null;

  const rows = [
    { key: "generationPowerKw", label: "Generación", color: "#059669" },
    { key: "consumptionPowerKw", label: "Consumo", color: "#2563eb" },
    { key: "powerBalanceKw", label: "Comparación", color: "#d97706" },
  ]
    .map((row) => {
      const item = payload.find((entry) => entry.dataKey === row.key);
      return item ? { ...row, value: item.value } : null;
    })
    .filter(Boolean) as Array<{ key: string; label: string; color: string; value: unknown }>;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-xl">
      <p className="mb-2 font-medium text-slate-900">{label ? labelFormatter(label) : "Lectura"}</p>
      <div className="space-y-1.5">
        {rows.map((row) => (
          <p key={row.key} style={{ color: row.color }}>
            {row.label}: {formatTooltipValue(row.value)} kW
          </p>
        ))}
      </div>
    </div>
  );
}

function formatTooltipValue(value: unknown) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : "0.00";
}
