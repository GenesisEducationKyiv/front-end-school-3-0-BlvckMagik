"use client";

import { useState, useRef, useEffect } from "react";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";

interface AudioPlayerProps {
  audioUrl: string;
  track: {
    title: string;
    artist: string;
    coverImage: string;
    id: string;
  };
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  onClose: () => void;
}

export default function AudioPlayer({
  audioUrl,
  track,
  isPlaying,
  setIsPlaying,
}: AudioPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const mobileProgressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return;

    const progressRect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - progressRect.left) / progressRect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const handleMobileProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !mobileProgressRef.current) return;

    const progressRect = mobileProgressRef.current.getBoundingClientRect();
    const percent = (e.clientX - progressRect.left) / progressRect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-secondary backdrop-blur-lg">
      {/* Мобільний прогрес-бар */}
      <div
        ref={mobileProgressRef}
        className="md:hidden w-full h-1 bg-gray-600 cursor-pointer"
        onClick={handleMobileProgressClick}
      >
        <div
          className="h-full bg-white"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
      </div>

      <div className="hidden md:block border-t border-border/40" />

      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src={track.coverImage || "/default-cover.webp"}
              alt={track.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{track.title}</div>
              <div className="text-sm text-gray-400 truncate">
                {track.artist}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-4 justify-end md:justify-center">
              <button
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="w-5 h-5 text-white" />
                ) : (
                  <PlayIcon className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            {/* Десктопний прогрес-бар */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-gray-400 w-12 text-right">
                {formatTime(currentTime)}
              </span>

              <div
                ref={progressRef}
                className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              <span className="text-sm text-gray-400 w-12">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
        autoPlay
      />
    </div>
  );
}
