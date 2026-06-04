import useSWR from "swr";
import { api } from "@/services/api";

export function useSystems() {
  return useSWR("systems", () => api.getSystems(), {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  });
}
