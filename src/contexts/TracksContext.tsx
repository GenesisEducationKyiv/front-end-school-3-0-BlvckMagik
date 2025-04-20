"use client";

import { createContext, useContext, useState } from "react";
import { Track, PaginatedResponse } from "@/types";

interface TracksContextType {
  tracks: PaginatedResponse<Track> | null;
  setTracks: (tracks: PaginatedResponse<Track>) => void;
  updateTrack: (updatedTrack: Track) => void;
  deleteTrack: (trackId: string) => void;
  addTrack: (newTrack: Track) => void;
}

const TracksContext = createContext<TracksContextType | undefined>(undefined);

export function TracksProvider({
  children,
  initialTracks,
}: {
  children: React.ReactNode;
  initialTracks: PaginatedResponse<Track>;
}) {
  const [tracks, setTracks] = useState<PaginatedResponse<Track>>(initialTracks);

  const updateTrack = (updatedTrack: Track) => {
    setTracks((prev) => ({
      ...prev,
      data: prev.data.map((track) =>
        track.id === updatedTrack.id ? updatedTrack : track
      ),
    }));
  };

  const deleteTrack = (trackId: string) => {
    setTracks((prev) => ({
      ...prev,
      data: prev.data.filter((track) => track.id !== trackId),
      meta: {
        ...prev.meta,
        total: prev.meta.total - 1,
      },
    }));
  };

  const addTrack = (newTrack: Track) => {
    setTracks((prev) => ({
      ...prev,
      data: [newTrack, ...prev.data],
      meta: {
        ...prev.meta,
        total: prev.meta.total + 1,
      },
    }));
  };

  return (
    <TracksContext.Provider
      value={{ tracks, setTracks, updateTrack, deleteTrack, addTrack }}
    >
      {children}
    </TracksContext.Provider>
  );
}

export function useTracks() {
  const context = useContext(TracksContext);
  if (context === undefined) {
    throw new Error("useTracks must be used within a TracksProvider");
  }
  return context;
}
