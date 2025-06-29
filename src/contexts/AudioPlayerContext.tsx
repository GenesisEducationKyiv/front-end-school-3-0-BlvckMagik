"use client";

import { LazyAudioPlayer } from "@/components/tracks/LazyAudioPlayer";
import { createContext, useContext, useState } from "react";
import type { AudioPlayerState } from "@/lib/validators";

interface AudioPlayerContextType {
  currentTrack: AudioPlayerState | null;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTrack: (track: AudioPlayerState | null) => void;
  stopPlayback: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined
);

export function AudioPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentTrack, setCurrentTrack] = useState<AudioPlayerState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const stopPlayback = () => {
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        setCurrentTrack,
        isPlaying,
        setIsPlaying,
        stopPlayback,
      }}
    >
      {children}
      {currentTrack && (
        <LazyAudioPlayer
          audioUrl={currentTrack.audioUrl}
          track={currentTrack.track}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
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
