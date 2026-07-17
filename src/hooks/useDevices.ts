import useSWR from "swr";
import { api } from "@/services/api";

export function useDevices() {
  return useSWR("devices", () => api.getDevices(), {
    refreshInterval: 15_000,
    revalidateOnFocus: true,
  });
}
