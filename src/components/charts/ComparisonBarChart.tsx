import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ComparisonItem } from "@/types";

interface ComparisonBarChartProps {
  data: ComparisonItem[];
}

export function ComparisonBarChart({ data }: ComparisonBarChartProps) {
  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 18, left: 32, bottom: 0 }}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="systemName"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
            contentStyle={{
              background: "#020617",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: 12,
              color: "#e2e8f0",
            }}
            formatter={(value: number) => [`${Number(value).toFixed(1)} kWh`, "Produccion diaria"]}
          />
          <Bar dataKey="productionDailyKwh" fill="#34d399" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
