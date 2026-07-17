import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EnergyPoint } from "@/types";

type AxisValueFormatter = (value: number) => string;
type LabelFormatter = (value: string) => string;
type AxisDomainValue = number | string | ((value: number) => number);

interface EnergyAreaChartProps {
  data: EnergyPoint[];
  height?: number;
  showBalance?: boolean;
  xTickFormatter?: LabelFormatter;
  tooltipLabelFormatter?: LabelFormatter;
  yTickFormatter?: AxisValueFormatter;
  yDomain?: [AxisDomainValue, AxisDomainValue];
}

export function EnergyAreaChart({
  data,
  height = 360,
  showBalance = false,
  xTickFormatter = (value) => new Date(value).getHours().toString().padStart(2, "0"),
  tooltipLabelFormatter = (value) => new Date(value).toLocaleString("es-EC", { timeStyle: "short" }),
  yTickFormatter = (value) => `${Number(value).toFixed(1)} kW`,
  yDomain,
}: EnergyAreaChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="generation" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.42} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="consumption" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.36} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              color: "#0f172a",
            }}
            labelFormatter={tooltipLabelFormatter}
            formatter={(value: number, name) => [`${formatTooltipValue(value)} kW`, name]}
          />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Area
            type="monotone"
            name="Generación"
            dataKey="generationPowerKw"
            stroke="#34d399"
            strokeWidth={3}
            fill="url(#generation)"
          />
          <Area
            type="monotone"
            name="Consumo"
            dataKey="consumptionPowerKw"
            stroke="#38bdf8"
            strokeWidth={3}
            fill="url(#consumption)"
          />
          {showBalance ? (
            <Line
              type="monotone"
              name="Balance"
              dataKey="powerBalanceKw"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatTooltipValue(value: unknown) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : "0.00";
}
