import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EnergyPoint } from "@/types";

type AxisValueFormatter = (value: number) => string;
type LabelFormatter = (value: string) => string;
type AxisDomainValue = number | string | ((value: number) => number);
type SeriesKey = "generationPowerKw" | "consumptionPowerKw" | "powerBalanceKw";
type TooltipPayloadItem = {
  dataKey?: string | number;
  value?: unknown;
  color?: string;
};

interface EnergyPeakValleyChartProps {
  data: EnergyPoint[];
  height?: number;
  showBalance?: boolean;
  xTickFormatter?: LabelFormatter;
  tooltipLabelFormatter?: LabelFormatter;
  yTickFormatter?: AxisValueFormatter;
  yDomain?: [AxisDomainValue, AxisDomainValue];
}

export function EnergyPeakValleyChart({
  data,
  height = 360,
  showBalance = false,
  xTickFormatter = (value) => new Date(value).getHours().toString().padStart(2, "0"),
  tooltipLabelFormatter = (value) => new Date(value).toLocaleString("es-EC", { timeStyle: "short" }),
  yTickFormatter = (value) => `${Number(value).toFixed(1)} kW`,
  yDomain,
}: EnergyPeakValleyChartProps) {
  const generationExtrema = findExtrema(data, "generationPowerKw");
  const consumptionExtrema = findExtrema(data, "consumptionPowerKw");
  const balanceExtrema = showBalance ? findExtrema(data, "powerBalanceKw") : [];

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 14, left: -18, bottom: 0 }}>
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
            cursor={{ stroke: "#94a3b8", strokeDasharray: "4 4" }}
            content={<EnergyTooltip labelFormatter={tooltipLabelFormatter} />}
          />
          <Line
            type="linear"
            name="Generación"
            dataKey="generationPowerKw"
            stroke="#86a83a"
            strokeWidth={6}
            dot={{ r: 5, fill: "#86a83a", stroke: "#ffffff", strokeWidth: 2 }}
            activeDot={{ r: 7, fill: "#86a83a", stroke: "#ffffff", strokeWidth: 2 }}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Line
            type="linear"
            name="Consumo"
            dataKey="consumptionPowerKw"
            stroke="#4f94bf"
            strokeWidth={6}
            dot={{ r: 5, fill: "#4f94bf", stroke: "#ffffff", strokeWidth: 2 }}
            activeDot={{ r: 7, fill: "#4f94bf", stroke: "#ffffff", strokeWidth: 2 }}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {showBalance ? (
            <Line
              type="linear"
              name="Balance"
              dataKey="powerBalanceKw"
              stroke="#dc1230"
              strokeWidth={6}
              dot={{ r: 5, fill: "#dc1230", stroke: "#ffffff", strokeWidth: 2 }}
              activeDot={{ r: 7, fill: "#dc1230", stroke: "#ffffff", strokeWidth: 2 }}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          <Scatter legendType="none" data={generationExtrema} dataKey="generationPowerKw" fill="#5f7f1f" />
          <Scatter legendType="none" data={consumptionExtrema} dataKey="consumptionPowerKw" fill="#1f6f9f" />
          {showBalance ? <Scatter legendType="none" data={balanceExtrema} dataKey="powerBalanceKw" fill="#b91c1c" /> : null}
        </ComposedChart>
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
    { key: "generationPowerKw", label: "Generación", color: "#86a83a" },
    { key: "consumptionPowerKw", label: "Consumo", color: "#4f94bf" },
    { key: "powerBalanceKw", label: "Comparación", color: "#dc1230" },
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

function findExtrema(data: EnergyPoint[], key: SeriesKey) {
  if (data.length < 3) return [];

  return data.filter((point, index) => {
    if (index === 0 || index === data.length - 1) return false;

    const previous = Number(data[index - 1]?.[key]);
    const current = Number(point[key]);
    const next = Number(data[index + 1]?.[key]);

    if (![previous, current, next].every(Number.isFinite)) return false;

    return (current > previous && current > next) || (current < previous && current < next);
  });
}

function formatTooltipValue(value: unknown) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : "0.00";
}
