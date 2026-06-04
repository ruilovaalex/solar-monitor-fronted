import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface AnnualBarChartProps {
  data: Array<{ month: string; generationKwh: number; consumptionKwh: number }>;
}

export function AnnualBarChart({ data }: AnnualBarChartProps) {
  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
            contentStyle={{
              background: "#020617",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: 12,
              color: "#e2e8f0",
            }}
            formatter={(value: number) => [`${Number(value).toFixed(0)} kWh`]}
          />
          <Legend />
          <Bar name="Generacion" dataKey="generationKwh" fill="#34d399" radius={[6, 6, 0, 0]} />
          <Bar name="Consumo" dataKey="consumptionKwh" fill="#38bdf8" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
