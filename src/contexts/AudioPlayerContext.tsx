"use client";

import AudioPlayer from "@/components/tracks/AudioPlayer";
import { createContext, useContext, useState } from "react";

interface AudioPlayerContextType {
  currentTrack: {
    audioUrl: string;
    track: {
      title: string;
      artist: string;
      coverImage: string;
    };
  } | null;
  setCurrentTrack: (track: AudioPlayerContextType["currentTrack"]) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined
);

export function AudioPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentTrack, setCurrentTrack] =
    useState<AudioPlayerContextType["currentTrack"]>(null);

  return (
    <AudioPlayerContext.Provider value={{ currentTrack, setCurrentTrack }}>
      {children}
      {currentTrack && (
        <AudioPlayer
          audioUrl={currentTrack.audioUrl}
          track={currentTrack.track}
          onClose={() => setCurrentTrack(null)}
        />
      )}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error(
      "useAudioPlayer must be used within an AudioPlayerProvider"
    );
  }
  return context;
}
