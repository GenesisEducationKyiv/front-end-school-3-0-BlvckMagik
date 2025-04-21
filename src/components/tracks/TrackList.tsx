"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { Track, TrackQueryParams } from "@/types";
import { trackApi } from "@/lib/api";
import TrackItem from "@/components/tracks/TrackItem";
import Select from "react-select";

export default function TrackList() {
  const [genreOptions, setGenreOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [queryParams, setQueryParams] = useState<TrackQueryParams>({
    page: 1,
    limit: 10,
    sort: "title",
    order: "asc",
    search: "",
    genre: "",
    artist: "",
  });

  const { data: tracks, isLoading } = useQuery({
    queryKey: ["tracks", queryParams],
    queryFn: () => trackApi.getTracks(queryParams),
    staleTime: 1000 * 60, // Кешуємо дані на 1 хвилину
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
    { value: "title", label: "За назвою" },
    { value: "artist", label: "За виконавцем" },
    { value: "album", label: "За альбомом" },
    { value: "createdAt", label: "За датою створення" },
  ];

  return (
    <div className="space-y-6">
      {/* Фільтри та сортування */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <input
            type="text"
            placeholder="Пошук за назвою, виконавцем чи альбомом..."
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
            placeholder="Фільтр за жанром"
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

      {/* Список треків */}
      {isLoading ? (
        <div>Завантаження...</div>
      ) : (
        <div className="flex flex-col gap-8">
          {tracks?.data.data.map((track: Track) => (
            <TrackItem key={track.id} track={track} />
          ))}
        </div>
      )}

      {/* Пагінація */}
      {tracks?.data.meta && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: tracks.data.meta.totalPages }, (_, i) => (
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
