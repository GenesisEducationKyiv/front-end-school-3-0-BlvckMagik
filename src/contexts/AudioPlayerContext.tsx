"use client";

import AudioPlayer from "@/components/tracks/AudioPlayer";
import { createContext, useContext, useState } from "react";

interface AudioPlayerContextType {
  currentTrack: {
    audioUrl: string;
    track: {
      title: string;
      artist: string;
      coverImage?: string;
      id: string;
    };
  } | null;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTrack: (track: AudioPlayerContextType["currentTrack"]) => void;
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
  const [currentTrack, setCurrentTrack] =
    useState<AudioPlayerContextType["currentTrack"]>(null);
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
        <AudioPlayer
          audioUrl={currentTrack.audioUrl}
          track={currentTrack.track}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onClose={() => {
            setCurrentTrack(null);
            setIsPlaying(false);
          }}
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
