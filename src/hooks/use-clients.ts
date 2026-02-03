import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClientByPhone,
  createNewClient,
  getOrCreateClient,
} from "@/lib/services/clients";

export const clientKeys = {
  all: ["clients"] as const,
  lists: () => [...clientKeys.all, "list"] as const,
  byPhone: (phone: string) => [...clientKeys.all, "phone", phone] as const,
};

export function useClientByPhone(phone: string) {
  return useQuery({
    queryKey: clientKeys.byPhone(phone),
    queryFn: () => getClientByPhone(phone),
    enabled: phone.length >= 10,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fullName, phone }: { fullName: string; phone: string }) =>
      createNewClient(fullName, phone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

export function useGetOrCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fullName, phone }: { fullName: string; phone: string }) =>
      getOrCreateClient(fullName, phone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}
