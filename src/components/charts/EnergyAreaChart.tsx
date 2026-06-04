import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EnergyPoint } from "@/types";

interface EnergyAreaChartProps {
  data: EnergyPoint[];
  height?: number;
}

export function EnergyAreaChart({ data, height = 360 }: EnergyAreaChartProps) {
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
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => new Date(value).getHours().toString().padStart(2, "0")}
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "#020617",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: 12,
              color: "#e2e8f0",
            }}
            labelFormatter={(value) => new Date(value).toLocaleString("es-EC", { timeStyle: "short" })}
            formatter={(value: number, name) => [`${Number(value).toFixed(2)} kWh`, name]}
          />
          <Legend />
          <Area
            type="monotone"
            name="Generacion"
            dataKey="generationKwh"
            stroke="#34d399"
            strokeWidth={3}
            fill="url(#generation)"
          />
          <Area
            type="monotone"
            name="Consumo"
            dataKey="consumptionKwh"
            stroke="#38bdf8"
            strokeWidth={3}
            fill="url(#consumption)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
