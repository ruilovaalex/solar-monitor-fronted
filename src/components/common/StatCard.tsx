import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/utils/formatters";

interface StatCardProps {
  title?: string;
  label?: string;
  value: number;
  unit: string;
  trend?: number;
  icon: LucideIcon;
  tone?: "emerald" | "blue" | "cyan" | "amber" | "rose" | "slate";
}

const tones = {
  emerald: "from-emerald-400/20 to-emerald-500/5 text-emerald-200 border-emerald-400/20",
  blue: "from-blue-400/20 to-blue-500/5 text-blue-200 border-blue-400/20",
  cyan: "from-cyan-400/20 to-cyan-500/5 text-cyan-200 border-cyan-400/20",
  amber: "from-amber-400/20 to-amber-500/5 text-amber-200 border-amber-400/20",
  rose: "from-rose-400/20 to-rose-500/5 text-rose-200 border-rose-400/20",
  slate: "from-slate-400/10 to-white/5 text-slate-200 border-white/10",
};

export function StatCard({ title, label, value, unit, trend, icon: Icon, tone = "slate" }: StatCardProps) {
  const TrendIcon = (trend ?? 0) >= 0 ? TrendingUp : TrendingDown;
  const displayTitle = title ?? label ?? "Metrica";

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-5 shadow-2xl shadow-black/10 backdrop-blur transition hover:-translate-y-0.5",
        tones[tone],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-xl border border-white/10 bg-white/10 p-2.5">
          <Icon className="h-5 w-5" />
        </div>
        {trend !== undefined && (
          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-2 py-1 text-xs font-bold text-slate-200">
            <TrendIcon className="h-3.5 w-3.5" />
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="mt-5 text-sm font-medium text-slate-400">{displayTitle}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-black tracking-tight text-white">{formatNumber(value)}</span>
        <span className="text-sm font-bold text-slate-400">{unit}</span>
      </div>
    </motion.article>
  );
}
