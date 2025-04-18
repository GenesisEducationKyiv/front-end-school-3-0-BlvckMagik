"use client";

import { useState } from "react";
import { Track } from "@/types";
import EditTrackModal from "@/components/tracks/EditTrackModal";
import Image from "next/image";

interface TrackItemProps {
  track: Track;
}

export default function TrackItem({ track }: TrackItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Image
          src={track.coverImage || "/default-cover.jpg"}
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
                className="bg-gray-100 text-sm px-2 py-1 rounded"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        {track.audioFile && (
          <audio controls className="h-8">
            <source src={track.audioFile} type="audio/mpeg" />
          </audio>
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
