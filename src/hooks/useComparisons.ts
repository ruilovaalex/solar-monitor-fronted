import useSWR from "swr";
import { api } from "@/services/api";

export function useComparisons() {
  return useSWR("comparisons", () => api.getComparisons(), {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  });
}
