import { create } from 'zustand';

const DEFAULT_FFT_SIZE = 256;

interface AudioContextState {
  context: AudioContext | null;
  sourceNode: MediaElementAudioSourceNode | null;
  analyserNode: AnalyserNode | null;
  connectedElement: HTMLAudioElement | null;
}

interface AudioContextStore {
  state: AudioContextState;
  initialize: (audioElement: HTMLAudioElement) => { context: AudioContext; analyser: AnalyserNode };
  getAnalyser: () => AnalyserNode | null;
  getContext: () => AudioContext | null;
  isElementConnected: (element: HTMLAudioElement) => boolean;
  cleanup: () => void;
}

const initialState: AudioContextState = {
  context: null,
  sourceNode: null,
  analyserNode: null,
  connectedElement: null,
};

export const useAudioContextStore = create<AudioContextStore>((set, get) => ({
  state: initialState,

  initialize: (audioElement: HTMLAudioElement) => {
    const { state, cleanup } = get();

    if (
      state.context &&
      state.connectedElement === audioElement &&
      state.analyserNode &&
      state.sourceNode &&
      state.context.state !== 'closed'
    ) {
      if (state.context.state === 'suspended') {
        void state.context.resume();
      }
      return {
        context: state.context,
        analyser: state.analyserNode,
      };
    }

    if (state.connectedElement !== audioElement || !state.context || state.context.state === 'closed') {
      cleanup();
    }

    const context = new AudioContext();
    const analyserNode = context.createAnalyser();
    analyserNode.fftSize = DEFAULT_FFT_SIZE;
    const sourceNode = context.createMediaElementSource(audioElement);
    sourceNode.connect(analyserNode);
    analyserNode.connect(context.destination);

    set({
      state: {
        context,
        sourceNode,
        analyserNode,
        connectedElement: audioElement,
      },
    });

    return { context, analyser: analyserNode };
  },

  getAnalyser: () => get().state.analyserNode,
  getContext: () => get().state.context,
  isElementConnected: (element: HTMLAudioElement) => get().state.connectedElement === element,
  cleanup: () => {
    const { state } = get();
    if (state.sourceNode) {
      try {
        state.sourceNode.disconnect();
      } catch (error) {
        console.warn('Error disconnecting source node:', error);
      }
    }
    if (state.analyserNode) {
      try {
        state.analyserNode.disconnect();
      } catch (error) {
        console.warn('Error disconnecting analyser node:', error);
      }
    }
    if (state.context && state.context.state !== 'closed') {
      void state.context.close().catch((error: unknown) => {
        console.warn('Error closing audio context:', error);
      });
    }
    set({
      state: initialState,
    });
  },
})); 