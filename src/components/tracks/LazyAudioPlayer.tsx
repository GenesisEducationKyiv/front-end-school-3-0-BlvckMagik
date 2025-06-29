"use client";

import dynamic from "next/dynamic";
import { type ComponentType } from "react";

interface AudioPlayerProps {
  audioUrl: string;
  track: {
    title: string;
    artist: string;
    coverImage?: string;
    id: string;
  };
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
}

const AudioPlayer = dynamic(() => import("./AudioPlayer"), {
  ssr: false,
});

export const LazyAudioPlayer: ComponentType<AudioPlayerProps> = AudioPlayer; 