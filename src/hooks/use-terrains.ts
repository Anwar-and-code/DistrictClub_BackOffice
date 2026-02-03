import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTerrains,
  getTerrainById,
  createTerrain,
  updateTerrain,
  deleteTerrain,
} from "@/lib/services/terrains";

export const terrainKeys = {
  all: ["terrains"] as const,
  lists: () => [...terrainKeys.all, "list"] as const,
  list: () => [...terrainKeys.lists()] as const,
  details: () => [...terrainKeys.all, "detail"] as const,
  detail: (id: number) => [...terrainKeys.details(), id] as const,
};

export function useTerrains() {
  return useQuery({
    queryKey: terrainKeys.list(),
    queryFn: getTerrains,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTerrain(id: number) {
  return useQuery({
    queryKey: terrainKeys.detail(id),
    queryFn: () => getTerrainById(id),
    enabled: id > 0,
  });
}

export function useCreateTerrain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTerrain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: terrainKeys.all });
    },
  });
}

export function useUpdateTerrain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Parameters<typeof updateTerrain>[1] }) =>
      updateTerrain(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: terrainKeys.all });
    },
  });
}

export function useDeleteTerrain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTerrain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: terrainKeys.all });
    },
  });
}
