import useSWR from "swr";
import { api } from "@/services/api";

export function useDashboard() {
  return useSWR("dashboard", () => api.getDashboard(), {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  });
}
