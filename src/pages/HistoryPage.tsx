import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Clock3,
  Database,
  Gauge,
  RefreshCw,
  Save,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMonitoringConfig } from "@/hooks/useMonitoringConfig";
import { useStatistics } from "@/hooks/useStatistics";
import { api } from "@/services/api";
import { EnergyPoint, MonitoringConfig } from "@/types";
import logo2 from "@/assets/logo2.png";

const SUGGESTED_MONITORING_VALUES: Pick<
  MonitoringConfig,
  | "averageWindowMinutes"
  | "upperDeviationPoints"
  | "lowerDeviationPoints"
  | "regularStorageMinutes"
  | "anomalyStorageSeconds"
  | "significantChangePoints"
> = {
  averageWindowMinutes: 15,
  upperDeviationPoints: 4,
  lowerDeviationPoints: 4,
  regularStorageMinutes: 15,
  anomalyStorageSeconds: 10,
  significantChangePoints: 0.25,
};

export function HistoryPage() {
  const {
    data: statistics,
    isLoading: statisticsLoading,
    error: statisticsError,
    mutate: mutateStatistics,
  } = useStatistics();
  const {
    data: savedConfig,
    isLoading: configLoading,
    error: configError,
    mutate,
  } = useMonitoringConfig();
  const [config, setConfig] = useState<MonitoringConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (savedConfig) setConfig(savedConfig);
  }, [savedConfig]);

  const chartData = useMemo(
    () => statistics?.chart?.slice(-48) ?? [],
    [statistics],
  );

  const latestReading = chartData.length ? chartData[chartData.length - 1]?.timestamp : null;
  const yDomain = useMemo(() => computeChartDomain(chartData), [chartData]);

  const retryLoad = async () => {
    try {
      await Promise.all([mutateStatistics(), mutate()]);
      toast.success("Monitoreo recargado");
    } catch {
      toast.error("No se pudo recargar el monitoreo");
    }
  };

  if (statisticsError || configError) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="surface-card rounded-[1.75rem] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-slate-950">No se pudo cargar el monitoreo</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Ocurrió un error al consultar tu configuración o las lecturas históricas.
          </p>
          <Button className="mt-5 rounded-2xl" onClick={retryLoad}>
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (statisticsLoading || configLoading || !statistics || !config) {
    return <HistorySkeleton />;
  }

  const updateNumber = (key: keyof MonitoringConfig, value: string) => {
    const min = key === "significantChangePoints" ? 0.01 : 1;
    setConfig((current) => current ? { ...current, [key]: Math.max(min, Number(value)) } : current);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const updated = await api.updateMonitoringConfig(config);
      await mutate(updated, false);
      toast.success("Configuración de monitoreo guardada");
    } catch {
      toast.error("No se pudo guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  const restoreSuggestedValues = () => {
    setConfig((current) => current ? {
      ...current,
      ...SUGGESTED_MONITORING_VALUES,
    } : current);
    toast.success("Valores sugeridos cargados en el formulario");
  };

  return (
    <div className="relative mx-auto max-w-7xl pb-20">
      <img
        src={logo2}
        alt="Instituto de Tecnologias Sudamericano"
        className="pointer-events-none absolute bottom-4 left-2 z-0 hidden h-16 w-auto max-w-[170px] object-contain opacity-10 xl:block"
      />

      <div className="relative z-10 space-y-5">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">Monitoreo personal</p>
          <p className="text-sm text-slate-500">
            Configuración del promedio móvil, reglas de guardado y comportamiento reciente de las lecturas.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <InfoCard
            icon={<Gauge className="h-4 w-4" />}
            label="Promedio móvil"
            value={`${config.averageWindowMinutes} min`}
            description="Ventana actual de calculo."
          />
          <InfoCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Límites"
            value={`${config.upperDeviationPoints} / ${config.lowerDeviationPoints} pts`}
            description="Desviacion superior e inferior."
          />
          <InfoCard
            icon={<Clock3 className="h-4 w-4" />}
            label="Guardado normal"
            value={`${config.regularStorageMinutes} min`}
            description="Frecuencia base de almacenamiento."
          />
          <InfoCard
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Fuera de rango"
            value={`${config.anomalyStorageSeconds} s`}
            description="Frecuencia para anomalias."
          />
          <InfoCard
            icon={<Activity className="h-4 w-4" />}
            label="Cambio significativo"
            value={`${config.significantChangePoints} kW`}
            description="Umbral de cambio del promedio."
          />
          <InfoCard
            icon={<Database className="h-4 w-4" />}
            label="Última lectura"
            value={latestReading ? formatDateTime(latestReading) : "Sin lecturas"}
            description={latestReading ? "Dato más reciente en el gráfico." : "Todavía no hay lecturas disponibles."}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <form className="surface-card rounded-[1.75rem] p-5" onSubmit={handleSubmit}>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 shadow-sm">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-black text-slate-900">Reglas configurables</h2>
                <p className="text-sm text-slate-500">Configuración personal usada para detectar cambios y decidir el almacenamiento.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <NumberField
                label="Ventana para calcular promedio"
                unit="min"
                value={config.averageWindowMinutes}
                onChange={(value) => updateNumber("averageWindowMinutes", value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Limite superior"
                  unit="pts"
                  value={config.upperDeviationPoints}
                  onChange={(value) => updateNumber("upperDeviationPoints", value)}
                />
                <NumberField
                  label="Limite inferior"
                  unit="pts"
                  value={config.lowerDeviationPoints}
                  onChange={(value) => updateNumber("lowerDeviationPoints", value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Guardado normal"
                  unit="min"
                  value={config.regularStorageMinutes}
                  onChange={(value) => updateNumber("regularStorageMinutes", value)}
                />
                <NumberField
                  label="Fuera de rango"
                  unit="s"
                  value={config.anomalyStorageSeconds}
                  onChange={(value) => updateNumber("anomalyStorageSeconds", value)}
                />
              </div>
              <NumberField
                label="Cambio significativo de promedio"
                unit="kW"
                value={config.significantChangePoints}
                onChange={(value) => updateNumber("significantChangePoints", value)}
                step={0.01}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/90 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Nota operativa</p>
                  <p className="text-xs leading-5 text-amber-800">
                    Los límites superior e inferior se aplican sobre el promedio móvil, no como umbrales absolutos del gráfico.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button className="h-11 flex-1 rounded-2xl" disabled={isSaving} type="submit">
                <Save className="h-4 w-4" />
                {isSaving ? "Guardando..." : "Guardar configuración"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl"
                onClick={restoreSuggestedValues}
              >
                Restaurar sugeridos
              </Button>
            </div>
          </form>

          <div className="surface-card rounded-[1.75rem] p-5">
            <div className="mb-5 flex flex-col gap-2">
              <h2 className="text-lg font-black text-slate-900">Generación y consumo registrados</h2>
              <p className="text-sm leading-6 text-slate-500">
                Potencia medida en lecturas historicas recientes. Referencia actual del promedio: {config.averageWindowMinutes} minutos.
              </p>
            </div>

            {statisticsLoading ? (
              <div className="h-[360px] animate-pulse rounded-[1.5rem] bg-slate-100" />
            ) : !chartData.length ? (
              <ChartFeedbackState
                title="Sin datos de monitoreo"
                description="Todavía no hay lecturas suficientes para mostrar el comportamiento de generación y consumo."
              />
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 font-medium">
                    <Activity className="h-3.5 w-3.5" />
                    {chartData.length} puntos visibles
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700">
                    <Gauge className="h-3.5 w-3.5" />
                    Ventana actual: {config.averageWindowMinutes} min
                  </span>
                </div>

                <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="historyGeneration" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.38} />
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="historyConsumption" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.34} />
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={formatHistoryXAxis}
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
                        tickFormatter={formatKwTick}
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
                        labelFormatter={(value) => formatDateTime(value)}
                        formatter={(value: number, name) => [`${Number(value).toFixed(2)} kW`, name]}
                      />
                      <Legend wrapperStyle={{ paddingTop: 10 }} />
                      <ReferenceLine
                        y={0}
                        stroke="#cbd5e1"
                        strokeDasharray="4 4"
                        ifOverflow="extendDomain"
                      />
                      <Area
                        type="monotone"
                        name="Generación"
                        dataKey="generationPowerKw"
                        stroke="#34d399"
                        strokeWidth={3}
                        fill="url(#historyGeneration)"
                      />
                      <Area
                        type="monotone"
                        name="Consumo"
                        dataKey="consumptionPowerKw"
                        stroke="#38bdf8"
                        strokeWidth={3}
                        fill="url(#historyConsumption)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (value: string) => void;
  step?: number;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-slate-700">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          min={step}
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 rounded-2xl border-slate-200 bg-white pr-14 text-slate-900 shadow-sm"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <article className="surface-card rounded-[1.5rem] p-4">
      <div className="flex items-center gap-2 text-emerald-700">
        {icon}
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      </div>
      <p className="mt-3 text-lg font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
    </article>
  );
}

function ChartFeedbackState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-[360px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
      <div className="rounded-2xl bg-white p-3 shadow-sm">
        <Activity className="h-5 w-5 text-slate-500" />
      </div>
      <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function computeChartDomain(data: EnergyPoint[]): [number, number] {
  const values = data.flatMap((point) => [
    point.generationPowerKw,
    point.consumptionPowerKw,
    point.powerBalanceKw ?? 0,
  ]).filter((value) => Number.isFinite(value));

  if (!values.length) return [0, 1];

  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);

  if (min === max) {
    const padding = Math.max(Math.abs(max) * 0.25, 1);
    return [Math.min(0, min - padding), max + padding];
  }

  const padding = Math.max((max - min) * 0.12, 0.35);
  return [Math.min(0, min - padding), max + padding];
}

function formatHistoryXAxis(value: string) {
  return new Date(value).toLocaleString("es-EC", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
  });
}

function formatKwTick(value: number) {
  return `${Number(value).toFixed(Math.abs(value) >= 10 ? 0 : 1)} kW`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-EC", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function HistorySkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="surface-card h-28 animate-pulse rounded-[1.5rem]" />
        ))}
      </div>
      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="surface-card h-[520px] animate-pulse rounded-[1.75rem]" />
        <div className="surface-card h-[520px] animate-pulse rounded-[1.75rem]" />
      </section>
    </div>
  );
}
