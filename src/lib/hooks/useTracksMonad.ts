import { useQuery } from "@tanstack/react-query";
import { R } from "@mobily/ts-belt";
import { trackApiClient as monadApiClient, getErrorMessage, type ApiResult } from "@/lib/api-client-monads";
import { type PaginatedResponse, type Track, type TrackQueryParams } from "@/lib/validators";

export interface UseTracksMonadResult {
  data: PaginatedResponse<Track> | undefined;
  isLoading: boolean;
  error: string | null;
  isError: boolean;
}

export const useTracksMonad = (queryParams: TrackQueryParams): UseTracksMonadResult => {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["tracks-monad", queryParams],
    queryFn: async (): Promise<PaginatedResponse<Track>> => {
      const result = await monadApiClient.getTracks(queryParams);
      
      return R.match(
        result,
        (tracks) => tracks,
        (error) => {
          throw new Error(getErrorMessage(error));
        }
      );
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });

  return {
    data,
    isLoading,
    error: error?.message || null,
    isError,
  };
};

export interface UseGenresMonadResult {
  data: { value: string; label: string }[] | undefined;
  isLoading: boolean;
  error: string | null;
  isError: boolean;
}

export const useGenresMonad = (): UseGenresMonadResult => {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["genres-monad"],
    queryFn: async (): Promise<{ value: string; label: string }[]> => {
      const result = await monadApiClient.getGenres();
      
      return R.match(
        result,
        (genres) => genres.map((genre: string) => ({
          value: genre,
          label: genre.charAt(0).toUpperCase() + genre.slice(1),
        })),
        (error) => {
          throw new Error(getErrorMessage(error));
        }
      );
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  return {
    data,
    isLoading,
    error: error?.message || null,
    isError,
  };
};

export const unwrapResult = <T>(result: ApiResult<T>): T => {
  return R.match(
    result,
    (value) => value,
    (error) => {
      throw new Error(getErrorMessage(error));
    }
  );
};

export const safeUnwrapResult = <T>(result: ApiResult<T>, defaultValue: T): T => {
  return R.match(
    result,
    (value) => value,
    () => defaultValue
  );
}; 