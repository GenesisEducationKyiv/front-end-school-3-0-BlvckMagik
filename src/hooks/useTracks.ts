import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trackApiClient, getErrorMessage } from '@/lib/api-client';
import { type CreateTrackDto, type TrackFormData, type TrackQueryParams } from '@/lib/validators';

export const trackKeys = {
  all: ['tracks'] as const,
  lists: () => [...trackKeys.all, 'list'] as const,
  list: (params: TrackQueryParams) => [...trackKeys.lists(), params] as const,
  details: () => [...trackKeys.all, 'detail'] as const,
  detail: (id: string) => [...trackKeys.details(), id] as const,
  genres: () => [...trackKeys.all, 'genres'] as const,
};

export function useTracks(params: TrackQueryParams) {
  return useQuery({
    queryKey: trackKeys.list(params),
    queryFn: async () => {
      const result = await trackApiClient.getTracks(params);
      if (result.isErr()) {
        throw new Error(getErrorMessage(result.error));
      }
      return result.value;
    },
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
  });
}

export function useGenres() {
  return useQuery({
    queryKey: trackKeys.genres(),
    queryFn: async () => {
      const result = await trackApiClient.getGenres();
      if (result.isErr()) {
        throw new Error(getErrorMessage(result.error));
      }
      return result.value.map(genre => ({ value: genre, label: genre }));
    },
    staleTime: 30 * 60 * 1000, 
    gcTime: 60 * 60 * 1000, 
  });
}

export function useCreateTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTrackDto) => {
      const result = await trackApiClient.createTrack(data);
      if (result.isErr()) {
        throw new Error(getErrorMessage(result.error));
      }
      return result.value;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trackKeys.lists() });
    },
  });
}

export function useUpdateTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TrackFormData }) => {
      const result = await trackApiClient.updateTrack(id, data);
      if (result.isErr()) {
        throw new Error(getErrorMessage(result.error));
      }
      return result.value;
    },
    onSuccess: (updatedTrack) => {
      queryClient.setQueryData(trackKeys.detail(updatedTrack.id), { data: updatedTrack });
      void queryClient.invalidateQueries({ queryKey: trackKeys.lists() });
    },
  });
}

export function useDeleteTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await trackApiClient.deleteTrack(id);
      if (result.isErr()) {
        throw new Error(getErrorMessage(result.error));
      }
      return result.value;
    },
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: trackKeys.detail(deletedId) });
      void queryClient.invalidateQueries({ queryKey: trackKeys.lists() });
    },
  });
}

export function useUploadAudioFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const result = await trackApiClient.uploadFile(id, file);
      if (result.isErr()) {
        throw new Error(getErrorMessage(result.error));
      }
      return result.value;
    },
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: trackKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: trackKeys.lists() });
    },
  });
} 