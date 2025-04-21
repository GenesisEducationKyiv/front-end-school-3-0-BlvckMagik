"use client";

import { useState, useRef, useEffect } from "react";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";

// Клас для управління аудіо контекстом
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
    // Якщо елемент вже підключений, відключаємо його
    this.cleanup();

    // Створюємо новий контекст
    this.audioContext = new AudioContext();

    // Створюємо нові ноди
    this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 256;

    // Підключаємо ноди
    this.sourceNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);

    // Зберігаємо посилання на підключений елемент
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
      try {
        this.sourceNode.disconnect();
      } catch (e) {
        console.log("Error disconnecting source node:", e);
      }
      this.sourceNode = null;
    }

    if (this.analyserNode) {
      try {
        this.analyserNode.disconnect();
      } catch (e) {
        console.log("Error disconnecting analyser:", e);
      }
      this.analyserNode = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        this.audioContext.close();
      } catch (e) {
        console.log("Error closing audio context:", e);
      }
      this.audioContext = null;
    }

    this.connectedElement = null;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(null);
  const contextManagerRef = useRef<AudioContextManager>(
    AudioContextManager.getInstance()
  );

  // Ініціалізуємо аудіо контекст та ноди при зміні URL
  useEffect(() => {
    if (!audioRef.current) return;

    // Ініціалізація аудіо контексту
    const initializeAudioContext = async () => {
      try {
        const manager = contextManagerRef.current;

        // Перевіряємо, чи вже підключений цей елемент
        if (audioRef.current && manager.isElementConnected(audioRef.current)) {
          // Якщо так, просто запускаємо візуалізацію
          if (canvasRef.current && manager.getAnalyser()) {
            startVisualization();
          }
          return;
        }

        // Ініціалізуємо новий контекст
        if (audioRef.current) {
          const { context } = manager.initialize(audioRef.current);

          // Відновлюємо контекст, якщо він призупинений
          if (context.state === "suspended") {
            await context.resume();
          }
        }

        // Запускаємо візуалізацію
        if (canvasRef.current) {
          startVisualization();
        }
      } catch (error) {
        console.error("Failed to initialize audio context:", error);
      }
    };

    // Функція для запуску візуалізації
    const startVisualization = () => {
      const manager = contextManagerRef.current;
      const analyser = manager.getAnalyser();

      if (!canvasRef.current || !analyser) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")!;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!analyser) return;

        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = "rgb(10, 10, 10)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height;

          const hue = (i / bufferLength) * 360;
          ctx.fillStyle = isPlaying
            ? `hsl(${hue}, 50%, 50%)`
            : "rgb(50, 50, 50)";

          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      };

      draw();
    };

    // Ініціалізуємо при завантаженні аудіо
    const handleCanPlay = () => {
      initializeAudioContext();
    };

    audioRef.current.addEventListener("canplay", handleCanPlay);

    // Якщо аудіо вже готове, ініціалізуємо відразу
    if (audioRef.current.readyState >= 3) {
      initializeAudioContext();
    }

    // Очищення при розмонтуванні компонента або зміні URL
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("canplay", handleCanPlay);
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioUrl, isPlaying]);

  // Оновлюємо візуалізацію при зміні стану відтворення
  useEffect(() => {
    const manager = contextManagerRef.current;
    const analyser = manager.getAnalyser();

    if (canvasRef.current && analyser) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")!;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!analyser) return;

        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = "rgb(10, 10, 10)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height;

          const hue = (i / bufferLength) * 360;
          ctx.fillStyle = isPlaying
            ? `hsl(${hue}, 50%, 50%)`
            : "rgb(50, 50, 50)";

          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      };

      draw();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Очищаємо ресурси при закритті плеєра
  useEffect(() => {
    return () => {
      contextManagerRef.current.cleanup();

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Оновлюємо час відтворення
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

  // Керуємо відтворенням
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Failed to play audio:", error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, setIsPlaying]);

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
      <canvas
        ref={canvasRef}
        className="w-full h-16"
        width={window.innerWidth}
        height={64}
      />
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
