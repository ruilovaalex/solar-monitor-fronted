import useSWR from "swr";
import { api } from "@/services/api";

export function useMonitoringConfig() {
  return useSWR("monitoring-config", () => api.getMonitoringConfig(), {
    revalidateOnFocus: false,
  });
}
