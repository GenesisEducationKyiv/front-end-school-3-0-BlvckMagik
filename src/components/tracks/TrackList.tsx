"use client";

import { useState, useMemo } from "react";
import { debounce } from "lodash";
import { type TrackQueryParams } from "@/lib/validators";
import TrackItem from "@/components/tracks/TrackItem";
import Select from "react-select";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useTracks, useGenres } from "@/hooks/useTracks";

interface TracksListProps {
  onCreateTrackClick: () => void;
}

export default function TracksList({ onCreateTrackClick }: TracksListProps) {
  const [queryParams, setQueryParams] = useState<TrackQueryParams>({
    page: 1,
    limit: 10,
    sort: "createdAt",
    order: "desc",
    search: "",
    genre: "",
    artist: "",
  });

  const { data: genreOptions = [], isLoading: genresLoading } = useGenres();
  const { data: tracksData, isLoading } = useTracks(queryParams);

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
      </div>{" "}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <input
            data-testid="search-input"
            type="text"
            placeholder="Search by title, artist or album..."
            className="w-full p-2 border rounded"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select
            data-testid="sort-select"
            id="sort-select"
            instanceId="sort-select"
            options={sortOptions}
            value={sortOptions.find((opt) => opt.value === queryParams.sort)}
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
          {tracksData?.data.map((track) => (
            <TrackItem key={track.id} track={track} />
          ))}
        </div>
      )}
      {tracksData?.meta && (
        <div
          data-testid="pagination"
          className="flex justify-center gap-2 mt-4"
        >
          {Array.from({ length: tracksData.meta.totalPages }, (_, i) => (
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
