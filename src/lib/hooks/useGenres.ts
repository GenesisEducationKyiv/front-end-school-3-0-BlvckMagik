import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { trackApiClient, getErrorMessage } from "@/lib/api-client";

export interface GenreOption {
  value: string;
  label: string;
}

export const useGenres = (): UseQueryResult<GenreOption[]> => {
  return useQuery({
    queryKey: ["genres"],
    queryFn: async (): Promise<GenreOption[]> => {
      const result = await trackApiClient.getGenres();
      
      if (result.isOk()) {
        return result.value.map((genre: string) => ({
          value: genre,
          label: genre.charAt(0).toUpperCase() + genre.slice(1),
        }));
      } else {
        throw new Error(getErrorMessage(result.error));
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};