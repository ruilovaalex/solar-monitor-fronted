export type SupportedDashboardRange = "today" | "24h" | "7d" | "30d";

export type DashboardAvailabilityKind =
  | "available"
  | "disconnected"
  | "connected-empty"
  | "never"
  | "query-error";

const RANGE_LABELS: Record<SupportedDashboardRange, string> = {
  today: "Hoy",
  "24h": "24 horas",
  "7d": "7 días",
  "30d": "30 días",
};

const RANGE_DURATIONS_MS: Partial<Record<SupportedDashboardRange, number>> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

export interface DashboardAvailabilityInput {
  hasChartData: boolean;
  hasQueryError: boolean;
  lastReadingAt: string | null;
  selectedRange: SupportedDashboardRange;
  deviceName?: string;
  deviceStatus?: "online" | "attention" | "offline";
  now?: Date;
}

export interface DashboardAvailability {
  kind: DashboardAvailabilityKind;
  title: string;
  description: string;
  fallbackRange: SupportedDashboardRange | null;
}

export function getDashboardAvailability({
  hasChartData,
  hasQueryError,
  lastReadingAt,
  selectedRange,
  deviceName,
  deviceStatus,
  now = new Date(),
}: DashboardAvailabilityInput): DashboardAvailability {
  if (hasQueryError) {
    return {
      kind: "query-error",
      title: "Error al consultar los datos",
      description: "No se pudieron obtener las lecturas del rango seleccionado.",
      fallbackRange: null,
    };
  }

  if (hasChartData) {
    return {
      kind: "available",
      title: "Datos disponibles",
      description: "Hay lecturas para el rango seleccionado.",
      fallbackRange: null,
    };
  }

  if (!isValidTimestamp(lastReadingAt)) {
    const disconnectedText = deviceStatus === "offline" && deviceName
      ? ` El dispositivo ${deviceName} está sin conexión.`
      : "";

    return {
      kind: "never",
      title: "Aún no hay lecturas registradas",
      description: `El sistema todavía no ha recibido datos de generación o consumo.${disconnectedText}`,
      fallbackRange: null,
    };
  }

  const fallbackRange = isTimestampInRange(lastReadingAt, selectedRange, now)
    ? null
    : getShortestRangeContainingTimestamp(lastReadingAt, now);
  const lastReadingText = `La última lectura se recibió el ${formatDashboardDateTime(lastReadingAt)}.`;

  if (deviceStatus === "offline") {
    return {
      kind: "disconnected",
      title: `No hay lecturas en ${RANGE_LABELS[selectedRange]}`,
      description: `${lastReadingText}${deviceName ? ` El dispositivo ${deviceName} está sin conexión.` : " El dispositivo está sin conexión."}`,
      fallbackRange,
    };
  }

  return {
    kind: "connected-empty",
    title: `No hay lecturas en ${RANGE_LABELS[selectedRange]}`,
    description: `${lastReadingText}${deviceName ? ` El dispositivo ${deviceName}` : " El dispositivo"} no envió lecturas utilizables en este rango.`,
    fallbackRange,
  };
}

export function isTimestampInRange(
  timestamp: string,
  range: SupportedDashboardRange,
  now = new Date(),
) {
  const timestampMs = new Date(timestamp).getTime();
  const nowMs = now.getTime();
  if (!Number.isFinite(timestampMs) || timestampMs > nowMs) return false;

  if (range === "today") {
    const startOfTodayUtc = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );
    return timestampMs >= startOfTodayUtc;
  }

  return timestampMs >= nowMs - (RANGE_DURATIONS_MS[range] ?? 0);
}

export function getShortestRangeContainingTimestamp(
  timestamp: string,
  now = new Date(),
): SupportedDashboardRange | null {
  const ranges: SupportedDashboardRange[] = ["today", "24h", "7d", "30d"];
  return ranges.find((range) => isTimestampInRange(timestamp, range, now)) ?? null;
}

export function getStaleThresholdMs(sampleIntervalSeconds?: number | null) {
  const intervalSeconds = Number(sampleIntervalSeconds);
  const safeIntervalSeconds = Number.isFinite(intervalSeconds) && intervalSeconds > 0
    ? intervalSeconds
    : 60;
  return Math.max(safeIntervalSeconds * 3, 60) * 1000;
}

export function isReadingStale(
  timestamp: string | null,
  sampleIntervalSeconds?: number | null,
  now = new Date(),
) {
  if (!isValidTimestamp(timestamp)) return false;
  return now.getTime() - new Date(timestamp).getTime() > getStaleThresholdMs(sampleIntervalSeconds);
}

export function formatElapsedTime(timestamp: string, now = new Date()) {
  const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - new Date(timestamp).getTime()) / 1000));

  if (elapsedSeconds < 60) return `${elapsedSeconds} ${elapsedSeconds === 1 ? "segundo" : "segundos"}`;

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes} ${elapsedMinutes === 1 ? "minuto" : "minutos"}`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} ${elapsedHours === 1 ? "hora" : "horas"}`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays} ${elapsedDays === 1 ? "día" : "días"}`;
}

export function formatDashboardDateTime(timestamp: string) {
  return new Date(timestamp).toLocaleString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isValidTimestamp(timestamp: string | null): timestamp is string {
  return Boolean(timestamp && Number.isFinite(new Date(timestamp).getTime()));
}
