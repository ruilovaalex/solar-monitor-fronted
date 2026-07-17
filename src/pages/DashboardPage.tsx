import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  CalendarRange,
  Clock3,
  Download,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EnergyAreaChart } from "@/components/charts/EnergyAreaChart";
import { EnergyBarChart } from "@/components/charts/EnergyBarChart";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useDashboard";
import { useDevices } from "@/hooks/useDevices";
import {
  ChartGranularity,
  DashboardData,
  DashboardEnergyPoint,
  DashboardRangeFilter,
  Device,
  EnergyPoint,
} from "@/types";
import {
  formatElapsedTime,
  getDashboardAvailability,
  isReadingStale,
} from "@/utils/dashboardStatus";

const RANGE_OPTIONS: Array<{ value: DashboardRangeFilter; label: string }> = [
  { value: "today", label: "Hoy" },
  { value: "24h", label: "24 horas" },
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
];

const GRANULARITY_OPTIONS: Array<{ value: ChartGranularity; label: string }> = [
  { value: "minute", label: "Minutos" },
  { value: "hour", label: "Horas" },
  { value: "day", label: "Días" },
  { value: "month", label: "Meses" },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const [selectedRange, setSelectedRange] = useState<DashboardRangeFilter>("24h");
  const [selectedGranularity, setSelectedGranularity] = useState<ChartGranularity>("hour");
  const { data, isLoading, isValidating, error, mutate } = useDashboard(selectedRange, selectedGranularity);
  const { data: deviceData } = useDevices();
  const devices = deviceData ?? [];

  const selectionMatches = !data?.selection
    || (data.selection.range === selectedRange && data.selection.granularity === selectedGranularity);

  const chartData = useMemo(
    () => toRenderableChartData(selectionMatches ? (data?.chart ?? []) : []),
    [data?.chart, selectionMatches],
  );

  const yDomain = useMemo(() => computeChartDomain(chartData), [chartData]);

  useEffect(() => {
    function handleTopbarRefresh() {
      void mutate();
    }

    window.addEventListener("solar-monitor:refresh-dashboard", handleTopbarRefresh);
    return () => window.removeEventListener("solar-monitor:refresh-dashboard", handleTopbarRefresh);
  }, [mutate]);

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <DashboardErrorState
        title="No se pudo cargar el dashboard"
        description="Revisa la conexión con el backend o vuelve a intentarlo."
        onRetry={() => mutate()}
      />
    );
  }

  const metrics = buildSafeMetrics(data.metrics);
  const health = buildSafeHealth(data.health);
  const latestReading = data.metricsTimestamp && isValidDateValue(data.metricsTimestamp)
    ? data.metricsTimestamp
    : health.lastSync;
  const chartReady = chartData.length > 0;
  const contextDevice = getMostRecentlySeenDevice(devices);
  const contextDeviceStatus = contextDevice?.status
    ?? (health.status === "offline" ? "offline" : health.status === "optimal" ? "online" : "attention");
  const elapsedSinceLastReading = latestReading ? formatElapsedTime(latestReading) : null;
  const staleReading = contextDevice
    ? isReadingStale(latestReading, contextDevice.sampleIntervalSeconds)
    : health.status === "offline" && isReadingStale(latestReading, 60);
  const availability = getDashboardAvailability({
    hasChartData: chartReady,
    hasQueryError: Boolean(error),
    lastReadingAt: latestReading,
    selectedRange,
    deviceName: contextDevice?.name,
    deviceStatus: contextDeviceStatus,
  });
  const generationAvailable = Boolean(latestReading && health.hasGeneration);
  const consumptionAvailable = Boolean(latestReading && health.hasConsumption);
  const comparisonTitle = health.comparisonAvailable
    ? "Generación, consumo y balance"
    : health.hasGeneration
      ? "Generación registrada"
      : health.hasConsumption
        ? "Consumo registrado"
        : "Lecturas de potencia";

  async function exportarPDF() {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const selectedRangeLabel = RANGE_OPTIONS.find((option) => option.value === selectedRange)?.label ?? selectedRange;
    const selectedGranularityLabel = GRANULARITY_OPTIONS.find((option) => option.value === selectedGranularity)?.label ?? selectedGranularity;
    let y = 16;

    const writeBlock = (title: string, lines: string[]) => {
      if (y > 265) {
        pdf.addPage();
        y = 16;
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.text(title, 16, y);
      y += 7;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);

      lines.forEach((line) => {
        const wrapped = pdf.splitTextToSize(line, 178);
        if (y + wrapped.length * 5 > 280) {
          pdf.addPage();
          y = 16;
        }
        pdf.text(wrapped, 16, y);
        y += wrapped.length * 5 + 1.5;
      });

      y += 3;
    };

    writeBlock("Reporte Solar Monitor", [
      `Generado: ${new Date().toLocaleString("es-EC")}`,
      `Rango seleccionado: ${selectedRangeLabel}`,
      `Granularidad seleccionada: ${selectedGranularityLabel}`,
      `Generación actual: ${formatMetricValue(metrics.generationPower.value, metrics.generationPower.unit)}`,
      `Consumo actual: ${formatMetricValue(metrics.consumptionPower.value, metrics.consumptionPower.unit)}`,
      `Balance actual: ${formatMetricValue(metrics.powerBalance.value, metrics.powerBalance.unit)}`,
      `Última lectura: ${latestReading ? formatDateTime(latestReading) : "Sin lecturas"}`,
    ]);

    writeBlock(
      "Serie mostrada en dashboard",
      chartData.length
        ? chartData.map((point) => (
            `${formatTooltipLabel(point.timestamp, selectedGranularity)} | Generación: ${point.generationPowerKw.toFixed(2)} kW | Consumo: ${point.consumptionPowerKw.toFixed(2)} kW | Balance: ${point.powerBalanceKw === undefined ? "No comparable" : `${point.powerBalanceKw.toFixed(2)} kW`}`
          ))
        : ["No existen datos para el rango seleccionado."],
    );

    pdf.save(`solar-monitor-${selectedRange}-${selectedGranularity}-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  return (
    <div className="relative mx-auto max-w-7xl space-y-5">
      {staleReading && elapsedSinceLastReading ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold">Datos desactualizados: no se reciben lecturas desde hace {elapsedSinceLastReading}.</p>
            {contextDevice?.name ? <p className="mt-0.5 text-amber-800">Último dispositivo registrado: {contextDevice.name}.</p> : null}
          </div>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetricCard
          label={staleReading ? "Última generación registrada" : "Generación actual"}
          value={generationAvailable ? formatMetricValue(metrics.generationPower.value, metrics.generationPower.unit) : "Sin datos"}
          age={staleReading && generationAvailable && elapsedSinceLastReading ? `hace ${elapsedSinceLastReading}` : undefined}
          description={staleReading ? "Este valor no representa el estado actual del sistema." : "Última potencia disponible del sistema."}
          tone="emerald"
        />
        <MiniMetricCard
          label={staleReading ? "Último consumo registrado" : "Consumo actual"}
          value={consumptionAvailable ? formatMetricValue(metrics.consumptionPower.value, metrics.consumptionPower.unit) : "Sin datos"}
          age={staleReading && consumptionAvailable && elapsedSinceLastReading ? `hace ${elapsedSinceLastReading}` : undefined}
          description={staleReading ? "Este valor no representa el consumo actual." : "Consumo registrado por los monitores activos."}
          tone="blue"
        />
        <BalanceIndicator
          value={formatMetricValue(metrics.powerBalance.value, metrics.powerBalance.unit)}
          rawValue={metrics.powerBalance.value}
          stale={staleReading}
          age={elapsedSinceLastReading}
        />
        <LatestReadingCard
          timestamp={latestReading}
          generation={metrics.generationPower.value}
          consumption={metrics.consumptionPower.value}
          balance={metrics.powerBalance.value}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="surface-card rounded-[1.75rem] p-5">
          <div className="mb-5 flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-950">{comparisonTitle}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Vista {selectedGranularity === "minute" ? "por minutos" : selectedGranularity === "hour" ? "por horas" : selectedGranularity === "day" ? "por días" : "por meses"} dentro del rango {RANGE_OPTIONS.find((option) => option.value === selectedRange)?.label.toLowerCase()}.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex w-fit rounded-2xl border border-slate-200 bg-white/85 p-1.5 shadow-sm">
                  <Button
                    type="button"
                    size="sm"
                    variant={chartType === "area" ? "default" : "ghost"}
                    onClick={() => setChartType("area")}
                  >
                    <Activity className="h-4 w-4" />
                    Área
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={chartType === "bar" ? "default" : "ghost"}
                    onClick={() => setChartType("bar")}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Barras
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
              <FilterGroup
                icon={<Clock3 className="h-4 w-4" />}
                label="Granularidad"
                options={GRANULARITY_OPTIONS}
                value={selectedGranularity}
                onChange={(value) => setSelectedGranularity(value as ChartGranularity)}
              />
              <FilterGroup
                icon={<CalendarRange className="h-4 w-4" />}
                label="Rango"
                options={RANGE_OPTIONS}
                value={selectedRange}
                onChange={(value) => setSelectedRange(value as DashboardRangeFilter)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 font-medium">
                <Activity className="h-3.5 w-3.5" />
                {chartReady ? `${chartData.length} puntos en pantalla` : "Esperando datos"}
              </span>
              {isValidating ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Actualizando gráfico
                </span>
              ) : null}
            </div>
          </div>

          {error ? (
            <ChartFeedbackState
              icon={<TriangleAlert className="h-5 w-5 text-rose-600" />}
              title="Error al cargar datos del gráfico"
              description="No se pudieron obtener las lecturas reales agregadas para el rango seleccionado."
              actionLabel="Reintentar"
              onAction={() => mutate()}
            />
          ) : isValidating && !selectionMatches ? (
            <div className="h-[360px] animate-pulse rounded-[1.5rem] bg-slate-100" />
          ) : !chartReady ? (
            <ChartFeedbackState
              icon={availability.kind === "disconnected"
                ? <TriangleAlert className="h-5 w-5 text-amber-600" />
                : <BarChart3 className="h-5 w-5 text-slate-500" />}
              title={availability.title}
              description={availability.description}
            >
              {availability.fallbackRange && availability.fallbackRange !== selectedRange ? (
                <Button
                  type="button"
                  className="rounded-2xl"
                  onClick={() => setSelectedRange(availability.fallbackRange as DashboardRangeFilter)}
                  aria-label="Ver últimos datos disponibles"
                >
                  Ver últimos datos disponibles
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => navigate("/app/devices")}
                aria-label="Revisar dispositivo"
              >
                Revisar dispositivo
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="rounded-2xl"
                onClick={() => void mutate()}
                aria-label="Actualizar lecturas"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Actualizar
              </Button>
            </ChartFeedbackState>
          ) : chartType === "area" ? (
            <EnergyAreaChart
              data={chartData}
              showBalance
              yDomain={yDomain}
              xTickFormatter={(value) => formatXAxisLabel(value, selectedGranularity)}
              tooltipLabelFormatter={(value) => formatTooltipLabel(value, selectedGranularity)}
              yTickFormatter={formatKwTick}
            />
          ) : (
            <EnergyBarChart
              data={chartData}
              showBalance
              yDomain={yDomain}
              xTickFormatter={(value) => formatXAxisLabel(value, selectedGranularity)}
              tooltipLabelFormatter={(value) => formatTooltipLabel(value, selectedGranularity)}
              yTickFormatter={formatKwTick}
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <article className="surface-card rounded-[1.75rem] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Resumen rápido</p>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              <li className="flex items-start justify-between gap-3">
                <span>Dispositivos conectados</span>
                <strong className="text-slate-950">{formatMetricValue(metrics.connectedDevices.value, metrics.connectedDevices.unit)}</strong>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span>Alertas activas</span>
                <strong className="text-slate-950">{health.alerts}</strong>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span>Estado del monitoreo</span>
                <strong className="text-slate-950">{mapHealthStatus(health.status)}</strong>
              </li>
            </ul>
          </article>

          <article className="surface-card rounded-[1.75rem] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Vista seleccionada</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p><strong className="text-slate-950">Rango:</strong> {RANGE_OPTIONS.find((option) => option.value === selectedRange)?.label}</p>
              <p><strong className="text-slate-950">Granularidad:</strong> {GRANULARITY_OPTIONS.find((option) => option.value === selectedGranularity)?.label}</p>
              <p><strong className="text-slate-950">Última sincronización:</strong> {health.lastSync ? formatDateTime(health.lastSync) : "Sin datos"}</p>
            </div>
          </article>

          <article className="surface-card rounded-[1.75rem] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Exportar</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Descarga un resumen textual del rango y la granularidad que estás viendo ahora mismo.
            </p>
            <Button
              type="button"
              className="mt-4 w-full justify-center rounded-2xl"
              onClick={exportarPDF}
            >
              <Download className="h-4 w-4" />
              Descargar reporte
            </Button>
          </article>
        </div>
      </section>
    </div>
  );
}

function toRenderableChartData(points: DashboardEnergyPoint[]): EnergyPoint[] {
  return points
    .filter((point) => isValidDateValue(point.timestamp))
    .map((point) => ({
      timestamp: point.timestamp,
      generationPowerKw: point.generationPowerKw ?? 0,
      consumptionPowerKw: point.consumptionPowerKw ?? 0,
      powerBalanceKw: point.powerBalanceKw ?? undefined,
      outOfRange: point.outOfRange,
    }));
}

function isValidDate(date: Date) {
  return Number.isFinite(date.getTime());
}

function isValidDateValue(value: unknown) {
  if (!value) return false;
  return isValidDate(new Date(String(value)));
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

function formatXAxisLabel(value: string, granularity: ChartGranularity) {
  const date = new Date(value);

  if (granularity === "minute") {
    return date.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
  }

  if (granularity === "hour") {
    return date.toLocaleString("es-EC", { day: "2-digit", month: "short", hour: "2-digit" });
  }

  if (granularity === "day") {
    return date.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
  }

  return date.toLocaleDateString("es-EC", { month: "short", year: "numeric" });
}

function formatTooltipLabel(value: string, granularity: ChartGranularity) {
  const date = new Date(value);
  if (!isValidDate(date)) return "Fecha no disponible";

  if (granularity === "minute") {
    return date.toLocaleString("es-EC", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (granularity === "hour") {
    return date.toLocaleString("es-EC", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (granularity === "day") {
    return date.toLocaleDateString("es-EC", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return date.toLocaleDateString("es-EC", {
    month: "long",
    year: "numeric",
  });
}

function formatKwTick(value: number) {
  return `${Number(value).toFixed(Math.abs(value) >= 10 ? 0 : 1)} kW`;
}

function formatMetricValue(value: number | null, unit: string) {
  if (value === null) return "Sin datos";
  const numericValue = Number(value);
  return `${Number.isFinite(numericValue) ? numericValue : 0} ${unit ?? ""}`.trim();
}

function formatDateTime(value: string) {
  if (!isValidDateValue(value)) return "Fecha no disponible";

  return new Date(value).toLocaleString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapHealthStatus(status: "optimal" | "attention" | "offline" | "empty") {
  if (status === "optimal") return "Óptimo";
  if (status === "attention") return "Atención";
  if (status === "offline") return "Sin conexión";
  return "Sin datos";
}

function getMostRecentlySeenDevice(devices: Device[]) {
  if (!devices.length) return undefined;

  return [...devices].sort((left, right) => {
    const leftTimestamp = left.lastSeen ? new Date(left.lastSeen).getTime() : 0;
    const rightTimestamp = right.lastSeen ? new Date(right.lastSeen).getTime() : 0;
    return rightTimestamp - leftTimestamp;
  })[0];
}

function buildSafeMetric(metric: {
  id?: string;
  label?: string;
  value?: number | null;
  unit?: string | null;
  status?: "positive" | "warning" | "neutral";
} | undefined, fallback: { id: string; label: string; unit: string }) {
  const value = Number(metric?.value);

  return {
    id: metric?.id ?? fallback.id,
    label: metric?.label ?? fallback.label,
    value: Number.isFinite(value) ? value : 0,
    unit: metric?.unit ?? fallback.unit,
    status: metric?.status ?? "neutral",
  };
}

function buildSafeNullableMetric(metric: {
  id?: string;
  label?: string;
  value?: number | null;
  unit?: string | null;
  status?: "positive" | "warning" | "neutral";
} | undefined, fallback: { id: string; label: string; unit: string }) {
  const numericValue = metric?.value === null || metric?.value === undefined
    ? null
    : Number(metric.value);

  return {
    id: metric?.id ?? fallback.id,
    label: metric?.label ?? fallback.label,
    value: numericValue !== null && Number.isFinite(numericValue) ? numericValue : null,
    unit: metric?.unit ?? fallback.unit,
    status: metric?.status ?? "neutral",
  };
}

function buildSafeMetrics(metrics: Partial<DashboardData["metrics"]> | undefined) {
  return {
    generationPower: buildSafeMetric(metrics?.generationPower, { id: "generationPower", label: "Potencia de generación", unit: "kW" }),
    consumptionPower: buildSafeMetric(metrics?.consumptionPower, { id: "consumptionPower", label: "Potencia de consumo", unit: "kW" }),
    powerBalance: buildSafeNullableMetric(metrics?.powerBalance, { id: "powerBalance", label: "Balance de potencia", unit: "kW" }),
    connectedDevices: buildSafeMetric(metrics?.connectedDevices, { id: "connectedDevices", label: "Dispositivos conectados", unit: "" }),
  };
}

function buildSafeHealth(health: {
  status?: "optimal" | "attention" | "offline" | "empty";
  lastSync?: string | null;
  alerts?: number | null;
  onlineDevices?: number | null;
  totalDevices?: number | null;
  hasGeneration?: boolean;
  hasConsumption?: boolean;
  comparisonAvailable?: boolean;
} | undefined) {
  return {
    status: health?.status ?? "empty",
    lastSync: health?.lastSync && isValidDateValue(health.lastSync) ? health.lastSync : null,
    alerts: Number.isFinite(Number(health?.alerts)) ? Number(health?.alerts) : 0,
    onlineDevices: Number.isFinite(Number(health?.onlineDevices)) ? Number(health?.onlineDevices) : 0,
    totalDevices: Number.isFinite(Number(health?.totalDevices)) ? Number(health?.totalDevices) : 0,
    hasGeneration: Boolean(health?.hasGeneration),
    hasConsumption: Boolean(health?.hasConsumption),
    comparisonAvailable: Boolean(health?.comparisonAvailable),
  };
}

function FilterGroup({
  icon,
  label,
  options,
  value,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        {icon}
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={option.value === value ? "default" : "outline"}
            className="rounded-full"
            onClick={() => onChange(option.value)}
            aria-label={`${label}: ${option.label}`}
            aria-pressed={option.value === value}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function MiniMetricCard({
  label,
  value,
  age,
  description,
  tone,
}: {
  label: string;
  value: string;
  age?: string;
  description: string;
  tone: "emerald" | "blue" | "amber";
}) {
  const toneClasses = tone === "emerald"
    ? "bg-emerald-50 text-emerald-700"
    : tone === "blue"
      ? "bg-blue-50 text-blue-700"
      : "bg-amber-50 text-amber-700";

  return (
    <article className="surface-card rounded-[1.75rem] p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-2 inline-flex max-w-full items-center rounded-xl px-3 py-1.5 text-2xl font-black ${toneClasses}`}>
        {value}
      </p>
      {age ? <p className="mt-2 text-xs font-bold text-amber-700">{age}</p> : null}
      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
    </article>
  );
}

function LatestReadingCard({
  timestamp,
  generation,
  consumption,
  balance,
}: {
  timestamp: string | null;
  generation: number;
  consumption: number;
  balance: number | null;
}) {
  return (
    <article className="surface-card rounded-[1.75rem] p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Última lectura</p>
      <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-lg font-black text-amber-700">
        {timestamp ? formatTooltipLabel(timestamp, "minute") : "Sin lecturas"}
      </p>
      <div className="mt-3 space-y-1.5 text-sm font-semibold">
        <p className="text-emerald-600">Generación: {formatNumberKw(generation)}</p>
        <p className="text-blue-600">Consumo: {formatNumberKw(consumption)}</p>
        <p className={balance === null ? "text-slate-500" : balance >= 0 ? "text-emerald-700" : "text-rose-600"}>
          Comparación: {formatNumberKw(balance)}
        </p>
      </div>
    </article>
  );
}

function formatNumberKw(value: number | null) {
  if (value === null) return "Sin datos comparables";
  const numericValue = Number(value);
  return `${Number.isFinite(numericValue) ? numericValue.toFixed(2) : "0.00"} kW`;
}

function BalanceIndicator({
  value,
  rawValue,
  stale = false,
  age,
}: {
  value: string;
  rawValue: number | null;
  stale?: boolean;
  age?: string | null;
}) {
  if (rawValue === null) {
    return (
      <article className="surface-card rounded-[1.75rem] p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stale ? "Último balance registrado" : "Balance actual"}</p>
        <div className="mt-2 inline-flex items-center rounded-xl bg-slate-100 px-3 py-1.5 text-slate-600">
          <span className="text-xl font-black">{value}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Se mostrará cuando generación y consumo pertenezcan a la misma lectura.
        </p>
      </article>
    );
  }

  const isPositive = rawValue >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const toneClasses = isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700";

  return (
    <article className="surface-card rounded-[1.75rem] p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stale ? "Último balance registrado" : "Balance actual"}</p>
      <div className={`mt-2 inline-flex items-center gap-2 rounded-xl px-3 py-1.5 ${toneClasses}`}>
        <Icon className="h-5 w-5" />
        <span className="text-2xl font-black">{value}</span>
      </div>
      {stale && age ? <p className="mt-2 text-xs font-bold text-amber-700">hace {age}</p> : null}
      <p className="mt-3 text-sm leading-6 text-slate-500">
        {stale
          ? "Este balance corresponde a la última lectura registrada, no al estado actual."
          : isPositive
            ? "La generación supera al consumo en la última lectura disponible."
            : "El consumo está por encima de la generación en la última lectura disponible."}
      </p>
    </article>
  );
}

function ChartFeedbackState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}) {
  return (
    <div
      className="flex min-h-[360px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-2xl bg-white p-3 shadow-sm">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {actionLabel && onAction ? (
        <Button type="button" variant="outline" className="mt-4 rounded-2xl" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
      {children ? <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{children}</div> : null}
    </div>
  );
}

function DashboardErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
      <div className="surface-card w-full rounded-[2rem] p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <TriangleAlert className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-black text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        <Button className="mt-5 rounded-2xl" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="surface-panel h-32 animate-pulse rounded-[2rem]" />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface-card h-40 animate-pulse rounded-[1.75rem]" />
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="surface-card h-[560px] animate-pulse rounded-[1.75rem]" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="surface-card h-36 animate-pulse rounded-[1.75rem]" />
          ))}
        </div>
      </section>
    </div>
  );
}
