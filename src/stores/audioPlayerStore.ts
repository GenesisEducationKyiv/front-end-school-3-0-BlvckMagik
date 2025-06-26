import { create } from 'zustand';
import { type AudioPlayerState } from '@/lib/validators';

interface AudioPlayerStore {
  currentTrack: AudioPlayerState | null;
  isPlaying: boolean;
  setCurrentTrack: (track: AudioPlayerState | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  stopPlayback: () => void;
}

export const useAudioPlayerStore = create<AudioPlayerStore>((set) => ({
  currentTrack: null,
  isPlaying: false,
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  stopPlayback: () => set({ currentTrack: null, isPlaying: false }),
})); 