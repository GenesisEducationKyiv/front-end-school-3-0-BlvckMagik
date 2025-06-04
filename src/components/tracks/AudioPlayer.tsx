"use client";

import { useState, useRef, useEffect } from "react";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";

class AudioContextManager {
  private static instance: AudioContextManager | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private connectedElement: HTMLAudioElement | null = null;

  private constructor() {}

  public static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  public initialize(audioElement: HTMLAudioElement): {
    context: AudioContext;
    analyser: AnalyserNode;
  } {
    if (this.audioContext && this.connectedElement === audioElement && this.analyserNode) {
      return {
        context: this.audioContext,
        analyser: this.analyserNode,
      };
    }

    if (this.audioContext) {
      this.cleanup();
    }

    this.audioContext = new AudioContext();
    this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
    this.analyserNode = this.audioContext.createAnalyser();

    this.sourceNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);

    this.connectedElement = audioElement;

    return {
      context: this.audioContext,
      analyser: this.analyserNode,
    };
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  public getContext(): AudioContext | null {
    return this.audioContext;
  }

  public isElementConnected(element: HTMLAudioElement): boolean {
    return this.connectedElement === element;
  }

  public cleanup(): void {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      void this.audioContext.close();
      this.audioContext = null;
    }

    this.connectedElement = null;
  }

  public reset(): void {
    this.cleanup();
    AudioContextManager.instance = null;
  }

  public static resetInstance(): void {
    if (AudioContextManager.instance) {
      AudioContextManager.instance.cleanup();
      AudioContextManager.instance = null;
    }
  }

  public getConnectedElement(): HTMLAudioElement | null {
    return this.connectedElement;
  }
}

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
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const mobileProgressRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const contextManagerRef = useRef<AudioContextManager>(
    AudioContextManager.getInstance()
  );

  const initializeAudioContext = (): void => {
    if (!audioRef.current) return;

    const manager = contextManagerRef.current;
    manager.initialize(audioRef.current);
    
    const analyser = manager.getAnalyser();
    if (analyser) {
      startVisualization();
    }
  };

  const startVisualization = (): void => {
    const manager = contextManagerRef.current;
    const analyser = manager.getAnalyser();

    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const context2d = canvas.getContext("2d");
    if (!context2d) return;
    const ctx = context2d;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = (): void => {
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

  // Reset audio when track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setDuration(0);
    }
  }, [audioUrl, track.id]);

  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    const handleCanPlay = (): void => {
      initializeAudioContext();
    };

    const handleLoadedMetadata = (): void => {
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
    const manager = contextManagerRef.current;
    const analyser = manager.getAnalyser();
    
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

    const handleTimeUpdate = (): void => setCurrentTime(audio.currentTime);

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
      contextManagerRef.current.cleanup();

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const togglePlay = (): void => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!audioRef.current || !progressRef.current) return;

    const progressRect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - progressRect.left) / progressRect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const handleMobileProgressClick = (e: React.MouseEvent<HTMLDivElement>): void => {
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
