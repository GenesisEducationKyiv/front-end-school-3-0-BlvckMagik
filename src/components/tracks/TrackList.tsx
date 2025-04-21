"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { Track, TrackQueryParams } from "@/types";
import { trackApi } from "@/lib/api";
import TrackItem from "@/components/tracks/TrackItem";
import Select from "react-select";
import { PlusIcon } from "@heroicons/react/24/solid";

interface TracksListProps {
  onCreateTrackClick: () => void;
}

export default function TracksList({ onCreateTrackClick }: TracksListProps) {
  const [genreOptions, setGenreOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [queryParams, setQueryParams] = useState<TrackQueryParams>({
    page: 1,
    limit: 10,
    sort: "createdAt",
    order: "desc",
    search: "",
    genre: "",
    artist: "",
  });

  const { data: tracksData, isLoading } = useQuery({
    queryKey: ["tracks", queryParams],
    queryFn: () => trackApi.getTracks(queryParams),
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await trackApi.getGenres();
        const genres = response.data;
        setGenreOptions(
          genres.map((genre: string) => ({
            value: genre,
            label: genre.charAt(0).toUpperCase() + genre.slice(1),
          }))
        );
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    };

    fetchGenres();
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setQueryParams((prev) => ({ ...prev, search: value, page: 1 }));
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <button
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
            type="text"
            placeholder="Search by title, artist or album..."
            className="w-full p-2 border rounded"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select
            id="sort-select"
            instanceId="sort-select"
            options={sortOptions}
            value={sortOptions.find((opt) => opt.value === queryParams.sort)}
            onChange={(option) =>
              setQueryParams((prev) => ({
                ...prev,
                sort: option?.value || "title",
              }))
            }
            className="w-48"
          />
          <button
            onClick={() =>
              setQueryParams((prev) => ({
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
            id="genre-select"
            instanceId="genre-select"
            options={genreOptions}
            isClearable
            placeholder="Filter by genre"
            onChange={(option) =>
              setQueryParams((prev) => ({
                ...prev,
                genre: option?.value || "",
                page: 1,
              }))
            }
          />
        </div>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex flex-col gap-8">
          {tracksData?.data.data.map((track: Track) => (
            <TrackItem key={track.id} track={track} />
          ))}
        </div>
      )}
      {tracksData?.data.meta && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: tracksData.data.meta.totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() =>
                setQueryParams((prev) => ({ ...prev, page: i + 1 }))
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
