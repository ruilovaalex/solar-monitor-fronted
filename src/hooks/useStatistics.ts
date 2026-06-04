import useSWR from "swr";
import { api } from "@/services/api";

export function useStatistics() {
  return useSWR("statistics", () => api.getStatistics(), {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  });
}
