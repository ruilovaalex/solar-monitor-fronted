import useSWR from "swr";
import { api } from "@/services/api";
import { ChartGranularity, DashboardRangeFilter } from "@/types";

export function useDashboard(range: DashboardRangeFilter = "24h", granularity: ChartGranularity = "hour") {
  return useSWR(
    ["dashboard", range, granularity],
    ([, selectedRange, selectedGranularity]: readonly [string, DashboardRangeFilter, ChartGranularity]) =>
      api.getDashboard({ range: selectedRange, granularity: selectedGranularity }),
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
      keepPreviousData: true,
    },
  );
}
