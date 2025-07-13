"use client";

import { useState, useEffect, useRef } from "react";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";
import { useAudioContextManager } from "@/contexts/AudioContextProvider";

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

export default function AudioPlayer({
  audioUrl,
  track,
  isPlaying,
  setIsPlaying,
}: AudioPlayerProps): React.JSX.Element {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const mobileProgressRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  
  const audioContext = useAudioContextManager();

  const initializeAudioContext = () => {
    if (!audioRef.current) return;

    audioContext.initialize(audioRef.current);
    
    const analyser = audioContext.getAnalyser();
    if (analyser) {
      startVisualization();
    }
  };

  const startVisualization = () => {
    const analyser = audioContext.getAnalyser();

    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const context2d = canvas.getContext("2d");
    if (!context2d) return;
    const ctx = context2d;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = ((dataArray[i] ?? 0) / 255) * canvas.height;

        const hue = (i / bufferLength) * 360;
        ctx.fillStyle = isPlaying
          ? `hsl(${hue.toString()}, 50%, 50%)`
          : "rgb(50, 50, 50)";

        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setDuration(0);
    }
  }, [audioUrl, track.id]);

  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    const handleCanPlay = () => {
      initializeAudioContext();
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };

    audioRef.current.addEventListener("canplay", handleCanPlay);
    audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);

    if (audioRef.current.readyState >= 3) {
      initializeAudioContext();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("canplay", handleCanPlay);
        audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    const analyser = audioContext.getAnalyser();
    
    if (analyser) {
      startVisualization();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      void audioRef.current.play().catch((error: unknown) => {
        console.error("Failed to play audio:", error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, setIsPlaying]);

  useEffect(() => {
    return () => {
      audioContext.cleanup();

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioContext]);

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

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString()}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      data-testid={`audio-player-${track.id}`}
      className="fixed bottom-0 left-0 right-0"
    >
      <div className="w-full bg-secondary">
        <canvas
          ref={canvasRef}
          className="w-full h-16"
          width={window.innerWidth}
          height={64}
        />
      </div>

      <div className="w-full bg-secondary backdrop-blur-lg">
        <div
          data-testid={`audio-progress-mobile-${track.id}`}
          ref={mobileProgressRef}
          className="md:hidden w-full h-1 bg-gray-600 cursor-pointer"
          onClick={handleMobileProgressClick}
        >
          <div
            className="h-full bg-white"
            style={{ width: `${((currentTime / duration) * 100).toString()}%` }}
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
                  data-testid={
                    isPlaying
                      ? `pause-button-${track.id}`
                      : `play-button-${track.id}`
                  }
                  onClick={togglePlay}
                  className="flex items-center justify-center w-10 h-10 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-5 h-5" />
                  ) : (
                    <PlayIcon className="w-5 h-5 ml-0.5" />
                  )}
                </button>
              </div>

              <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <div
                  data-testid={`audio-progress-desktop-${track.id}`}
                  ref={progressRef}
                  className="flex-1 h-1 bg-gray-600 rounded cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full bg-white rounded"
                    style={{ width: `${((currentTime / duration) * 100).toString()}%` }}
                  />
                </div>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={audioUrl} />
    </div>
  );
}
