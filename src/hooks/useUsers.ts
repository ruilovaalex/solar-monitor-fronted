import useSWR from "swr";
import { api } from "@/services/api";

export function useUsers() {
  return useSWR("users", () => api.getUsers(), {
    revalidateOnFocus: false,
  });
}
