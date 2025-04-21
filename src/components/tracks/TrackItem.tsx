"use client";

import { useState, useRef, useEffect } from "react";
import { Track } from "@/types";
import EditTrackModal from "@/components/tracks/EditTrackModal";
import Image from "next/image";
import { trackApi } from "@/lib/api";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import TrackDetailsModal from "@/components/tracks/TrackDetailsModal";
import { useTracks } from "@/contexts/TracksContext";
import { useQueryClient } from "@tanstack/react-query";

interface TrackItemProps {
  track: Track;
}

export default function TrackItem({ track }: TrackItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    setCurrentTrack,
    currentTrack,
    isPlaying,
    setIsPlaying,
    stopPlayback,
  } = useAudioPlayer();
  const { deleteTrack } = useTracks();
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const isCurrentTrack = currentTrack?.track.id === track.id;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePlayClick = async () => {
    if (isCurrentTrack) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (track.audioFile) {
      setIsLoading(true);
      try {
        const url = await trackApi.getAudioFile(track.audioFile);
        setCurrentTrack({
          audioUrl: url,
          track: {
            title: track.title,
            artist: track.artist,
            coverImage: track.coverImage || "/default-cover.webp",
            id: track.id,
          },
        });
        setIsPlaying(true);
      } catch (error) {
        console.error("Failed to load audio:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей трек?")) {
      return;
    }

    try {
      setIsDeleting(true);
      if (currentTrack?.track.id === track.id) {
        stopPlayback();
      }
      await trackApi.deleteTrack(track.id);
      deleteTrack(track.id);

      queryClient.invalidateQueries({ queryKey: ["tracks"] });
    } catch (error) {
      console.error("Failed to delete track:", error);
      window.location.reload();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4 gap-4 md:gap-6 max-w-[60%] md:max-w-[100%]">
        <Image
          src={track.coverImage || "/default-cover.webp"}
          alt={track.title}
          width={64}
          height={64}
          className="object-cover rounded"
        />
        <div className="grid">
          <h3
            className="font-semibold truncate whitespace-nowrap"
            title={track.title}
          >
            {track.title}
          </h3>
          <p
            className="text-gray-600 truncate whitespace-nowrap"
            title={track.artist}
          >
            {track.artist}
          </p>
          {track.album && (
            <p
              className="text-gray-500 text-sm truncate whitespace-nowrap"
              title={track.album}
            >
              {track.album}
            </p>
          )}
          <div className="gap-2 mt-1 hidden md:flex">
            {track.genres.map((genre) => (
              <span
                key={genre}
                className="bg-gray-100 text-sm px-2 py-1 rounded text-gray-800"
              >
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex space-x-2 gap-2 md:gap-6">
        {track.audioFile && (
          <>
            {isLoading ? (
              <div className="h-8 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-300" />
              </div>
            ) : (
              <button
                onClick={handlePlayClick}
                className="w-12 h-12 cursor-pointer rounded-full border-2 border-white bg-primary/20 flex items-center justify-center hover:bg-primary/40 transition-colors"
              >
                {isCurrentTrack && isPlaying ? (
                  <PauseIcon className="w-6 h-6 text-white" />
                ) : (
                  <PlayIcon className="w-6 h-6 text-white" />
                )}
              </button>
            )}
          </>
        )}
        <div className="relative flex" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
              <button
                onClick={() => {
                  setIsDetailsModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-black transition-colors"
              >
                Деталі
              </button>
              <button
                onClick={() => {
                  setIsEditModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-black transition-colors"
              >
                Редагувати
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? <span>Видалення...</span> : "Видалити"}
              </button>
            </div>
          )}
        </div>
      </div>

      <EditTrackModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        track={track}
      />

      <TrackDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        track={track}
      />
    </div>
  );
}
