import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReservations,
  getReservationById,
  getAvailableSlots,
  createReservation,
  createReservationWithClient,
  updateReservationStatus,
  deleteReservation,
} from "@/lib/services/reservations";
import type { Reservation } from "@/types/database";

export const reservationKeys = {
  all: ["reservations"] as const,
  lists: () => [...reservationKeys.all, "list"] as const,
  list: (filters: Record<string, string | undefined>) =>
    [...reservationKeys.lists(), filters] as const,
  details: () => [...reservationKeys.all, "detail"] as const,
  detail: (id: number) => [...reservationKeys.details(), id] as const,
  availableSlots: (date: string) =>
    [...reservationKeys.all, "available", date] as const,
};

export function useReservations(filters?: {
  date?: string;
  status?: string;
  terrainId?: string;
}) {
  return useQuery({
    queryKey: reservationKeys.list(filters ?? {}),
    queryFn: () => getReservations(filters),
  });
}

export function useReservation(id: number) {
  return useQuery({
    queryKey: reservationKeys.detail(id),
    queryFn: () => getReservationById(id),
    enabled: id > 0,
  });
}

export function useAvailableSlots(date: string) {
  return useQuery({
    queryKey: reservationKeys.availableSlots(date),
    queryFn: () => getAvailableSlots(date),
    enabled: !!date,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}

export function useCreateReservationWithClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReservationWithClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateReservationStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: reservationKeys.detail(id) });

      const previousReservation = queryClient.getQueryData<Reservation>(
        reservationKeys.detail(id)
      );

      if (previousReservation) {
        queryClient.setQueryData(reservationKeys.detail(id), {
          ...previousReservation,
          status,
        });
      }

      return { previousReservation };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousReservation) {
        queryClient.setQueryData(
          reservationKeys.detail(id),
          context.previousReservation
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}

export function useDeleteReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}
