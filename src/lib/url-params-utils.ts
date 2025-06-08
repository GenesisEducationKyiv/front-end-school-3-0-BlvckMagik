import { O } from "@mobily/ts-belt";
import { type TrackQueryParams } from "@/lib/validators";

export interface URLSearchParams {
  [key: string]: string | undefined;
}

export const getSearchParam = (params: URLSearchParams, key: string): O.Option<string> => {
  return O.fromNullable(params[key]);
};

export const parseIntParam = (params: URLSearchParams, key: string): O.Option<number> => {
  return O.flatMap(getSearchParam(params, key), (value) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? O.None : O.Some(parsed);
  });
};

export const getSearchParamWithDefault = (
  params: URLSearchParams, 
  key: string, 
  defaultValue: string
): string => {
  return O.getWithDefault(getSearchParam(params, key), defaultValue);
};

export const parseSortParam = (params: URLSearchParams): O.Option<string> => {
  const validSorts = ["createdAt", "title", "artist", "album"];
  return O.flatMap(getSearchParam(params, "sort"), (value) => {
    return validSorts.includes(value) ? O.Some(value) : O.None;
  });
};

export const parseOrderParam = (params: URLSearchParams): O.Option<"asc" | "desc"> => {
  return O.flatMap(getSearchParam(params, "order"), (value) => {
    return value === "asc" || value === "desc" ? O.Some(value) : O.None;
  });
};

export const parseTrackQueryParams = (params: URLSearchParams): TrackQueryParams => {
  const page = O.getWithDefault(parseIntParam(params, "page"), 1);
  const limit = O.getWithDefault(parseIntParam(params, "limit"), 10);
  const sort = O.getWithDefault(parseSortParam(params), "createdAt");
  const order = O.getWithDefault(parseOrderParam(params), "desc");
  const search = O.getWithDefault(getSearchParam(params, "search"), "");
  const genre = O.getWithDefault(getSearchParam(params, "genre"), "");
  const artist = O.getWithDefault(getSearchParam(params, "artist"), "");

  return {
    page: Math.max(1, page), 
    limit: Math.min(100, Math.max(1, limit)), 
    sort,
    order,
    search,
    genre,
    artist,
  };
};

export const createSearchParams = (params: TrackQueryParams): URLSearchParams => {
  const result: URLSearchParams = {};
  
  if (params.page > 1) result["page"] = params.page.toString();
  if (params.limit !== 10) result["limit"] = params.limit.toString();
  if (params.sort && params.sort !== "createdAt") result["sort"] = params.sort;
  if (params.order && params.order !== "desc") result["order"] = params.order;
  if (params.search && params.search.trim() !== "") result["search"] = params.search;
  if (params.genre && params.genre.trim() !== "") result["genre"] = params.genre;
  if (params.artist && params.artist.trim() !== "") result["artist"] = params.artist;

  return result;
};

export const useSearchParamsMonad = () => {
  const safeParseParams = (searchParams: { [key: string]: string | string[] | undefined }): TrackQueryParams => {
    const normalizedParams: URLSearchParams = {};
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === "string") {
        normalizedParams[key] = value;
      } else if (Array.isArray(value) && value.length > 0) {
        normalizedParams[key] = value[0];
      }
    });

    return parseTrackQueryParams(normalizedParams);
  };

  return { safeParseParams };
}; 