import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: "online" | "attention" | "offline" | "optimal";
}

const labels = {
  online: "En linea",
  attention: "Atencion",
  offline: "Sin conexion",
  optimal: "Optimo",
};

const classes = {
  online: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  optimal: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  attention: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  offline: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

export function StatusPill({ status }: StatusPillProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-bold", classes[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  );
}
