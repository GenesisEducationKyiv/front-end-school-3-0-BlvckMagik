"use client";

import { useState } from "react";
import { Track } from "@/types";
import EditTrackModal from "@/components/tracks/EditTrackModal";
import Image from "next/image";
import { trackApi } from "@/lib/api";
import { PlayIcon } from "@heroicons/react/24/solid";
import AudioPlayer from "./AudioPlayer";

interface TrackItemProps {
  track: Track;
}

export default function TrackItem({ track }: TrackItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handlePlayClick = async () => {
    if (track.audioFile && !audioUrl) {
      setIsLoading(true);
      try {
        const url = await trackApi.getAudioFile(track.audioFile);
        setAudioUrl(url);
      } catch (error) {
        console.error("Failed to load audio:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4 gap-6">
        <Image
          src={track.coverImage || "/default-cover.webp"}
          alt={track.title}
          width={64}
          height={64}
          className="object-cover rounded"
        />
        <div>
          <h3 className="font-semibold">{track.title}</h3>
          <p className="text-gray-600">{track.artist}</p>
          {track.album && (
            <p className="text-gray-500 text-sm">{track.album}</p>
          )}
          <div className="flex gap-2 mt-1">
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

      <div className="flex space-x-2 gap-6">
        {track.audioFile && (
          <>
            {isLoading ? (
              <div className="h-8 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
              </div>
            ) : audioUrl ? (
              <AudioPlayer
                audioUrl={audioUrl}
                onClose={() => setAudioUrl(null)}
              />
            ) : (
              <button
                onClick={handlePlayClick}
                className="w-12 h-12 cursor-pointer rounded-full border-2 border-white bg-primary/20 flex items-center justify-center hover:bg-primary/40 transition-colors"
              >
                <PlayIcon className="w-6 h-6 text-white" />
              </button>
            )}
          </>
        )}
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="text-blue-500 hover:text-blue-700"
        >
          Редагувати
        </button>
      </div>

      <EditTrackModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        track={track}
      />
    </div>
  );
}
