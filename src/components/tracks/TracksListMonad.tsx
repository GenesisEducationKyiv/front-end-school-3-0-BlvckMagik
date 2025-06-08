"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { debounce } from "lodash";
import { O } from "@mobily/ts-belt";
import { type Track, type TrackQueryParams } from "@/lib/validators";
import { useTracksMonad, useGenresMonad } from "@/lib/hooks/useTracksMonad";
import { parseTrackQueryParams, type URLSearchParams } from "@/lib/url-params-utils";
import TrackItem from "@/components/tracks/TrackItem";
import Select from "react-select";
import { PlusIcon } from "@heroicons/react/24/solid";

interface TracksListMonadProps {
  onCreateTrackClick: () => void;
}

export default function TracksListMonad({ onCreateTrackClick }: TracksListMonadProps) {
  const searchParams = useSearchParams();
  
  const initialParams = useMemo(() => {
    const params: URLSearchParams = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return parseTrackQueryParams(params);
  }, [searchParams]);

  const [queryParams, setQueryParams] = useState<TrackQueryParams>(initialParams);

  useEffect(() => {
    const params: URLSearchParams = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    const urlParams = parseTrackQueryParams(params);
    setQueryParams(urlParams);
  }, [searchParams]);

  const { data: tracksData, isLoading, error: tracksError, isError: tracksIsError } = useTracksMonad(queryParams);
  const { data: genreOptions = [], isLoading: genresLoading, error: genresError } = useGenresMonad();

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setQueryParams((prev: TrackQueryParams) => ({ ...prev, search: value, page: 1 }));
      }, 500),
    []
  );

  const sortOptions = [
    { value: "createdAt", label: "By Creation Date" },
    { value: "title", label: "By Title" },
    { value: "artist", label: "By Artist" },
    { value: "album", label: "By Album" },
  ];

  const errorMessage = useMemo(() => {
    return O.getWithDefault(
      O.fromNullable(tracksError || genresError),
      ""
    );
  }, [tracksError, genresError]);

  const tracks = useMemo(() => {
    return tracksData?.data || [];
  }, [tracksData]);

  const meta = useMemo(() => {
    return tracksData?.meta || { total: 0, totalPages: 0, page: 1, limit: 10 };
  }, [tracksData]);

  if (tracksIsError) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          Error loading tracks: {errorMessage}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <button
          data-testid="create-track-button"
          onClick={onCreateTrackClick}
          className="flex items-center gap-2 px-4 py-2 justify-center bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors w-full md:w-auto"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Track</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <input
            data-testid="search-input"
            type="text"
            placeholder="Search by title, artist or album..."
            className="w-full p-2 border rounded"
            defaultValue={queryParams.search}
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select
            data-testid="sort-select"
            id="sort-select"
            instanceId="sort-select"
            options={sortOptions}
            value={O.fromNullable(sortOptions.find((opt) => opt.value === queryParams.sort))}
            onChange={(option) =>
              setQueryParams((prev: TrackQueryParams) => ({
                ...prev,
                sort: option?.value || "title",
              }))
            }
            className="w-48"
          />
          <button
            onClick={() =>
              setQueryParams((prev: TrackQueryParams) => ({
                ...prev,
                order: prev.order === "asc" ? "desc" : "asc",
              }))
            }
            className="px-3 py-1 border rounded"
          >
            {queryParams.order === "asc" ? "↑" : "↓"}
          </button>
        </div>

        <div>
          <Select
            data-testid="filter-genre"
            id="genre-select"
            instanceId="genre-select"
            options={genreOptions}
            isLoading={genresLoading}
            isClearable
            placeholder="Filter by genre"
            value={O.fromNullable(genreOptions.find((opt) => opt.value === queryParams.genre))}
            onChange={(option) =>
              setQueryParams((prev: TrackQueryParams) => ({
                ...prev,
                genre: option?.value || "",
                page: 1,
              }))
            }
          />
        </div>
      </div>

      {isLoading ? (
        <div data-testid="loading-tracks" className="flex justify-center py-8">
          <div
            data-testid="loading-indicator"
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {tracks.map((track: Track) => (
            <TrackItem key={track.id} track={track} />
          ))}
          
          {tracks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No tracks found. Try adjusting your search criteria.
            </div>
          )}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div data-testid="pagination" className="flex justify-center gap-2 mt-4">
          {Array.from({ length: meta.totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() =>
                setQueryParams((prev: TrackQueryParams) => ({ ...prev, page: i + 1 }))
              }
              className={`px-3 py-1 rounded cursor-pointer ${
                queryParams.page === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 