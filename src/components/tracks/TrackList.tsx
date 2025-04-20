"use client";

import { useState } from "react";
import { Track, PaginatedResponse } from "@/types";
import { getTracks } from "@/app/actions/tracks";
import TrackItem from "@/components/tracks/TrackItem";
import CreateTrackModal from "@/components/tracks/CreateTrackModal";
import { useTracks } from "@/contexts/TracksContext";

interface TrackListProps {
  initialTracks: PaginatedResponse<Track>;
}

export default function TrackList({ initialTracks }: TrackListProps) {
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { tracks, setTracks } = useTracks();

  const handlePageChange = async (newPage: number) => {
    try {
      setIsLoading(true);
      setPage(newPage);
      const newTracks = await getTracks(newPage);
      setTracks(newTracks);
    } catch (error) {
      console.error("Failed to fetch tracks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Завантаження...</div>;
  }

  return (
    <>
      <div className="flex justify-between mb-8">
        <h1 className="text-2xl font-bold">Треки</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
        >
          Створити трек
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {tracks?.data?.map((track) => (
          <TrackItem key={track.id} track={track} />
        )) || <div>Немає треків</div>}
      </div>

      {tracks?.meta && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: tracks.meta.totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 rounded cursor-pointer text-gray-800 ${
                page === i + 1 ? "bg-blue-500" : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <CreateTrackModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
